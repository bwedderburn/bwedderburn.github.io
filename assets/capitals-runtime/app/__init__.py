"""Capitals: an offline atlas and capital-city quiz for the Universe 2026 badge."""

import gc
import os
import sys

APP_DIR = "/system/apps/capitals"
os.chdir(APP_DIR)
sys.path.insert(0, APP_DIR)

from badgeware import State

import explore
import layout
import progress
import quiz

DATA_ERROR = None
try:
    import atlas
    import catalog
    if catalog.SCHEMA_VERSION != 1 or atlas.SCHEMA_VERSION != 1:
        DATA_ERROR = "Unexpected data version: catalog %s, atlas %s" % (catalog.SCHEMA_VERSION, atlas.SCHEMA_VERSION)
except Exception as error:
    DATA_ERROR = "Could not load the geography data: %s" % error
    catalog = atlas = None

# Saved quiz progress is tied to the data release it was made with.
DATA_ID = "%s:%s" % (catalog.SCHEMA_VERSION, catalog.DATA_AS_OF) if catalog else ""

badge.mode(HIRES | VSYNC)
screen.antialias = image.X2

STATE_KEY = "capitals"

BG = color.rgb(18, 43, 43)
PANEL = color.rgb(31, 66, 63)
LINE = color.rgb(70, 110, 104)
TEXT = color.rgb(240, 244, 236)
MUTED = color.rgb(150, 182, 172)
ACCENT = color.rgb(244, 196, 88)
INK = color.rgb(18, 30, 28)
GOOD = color.rgb(86, 196, 118)
BAD = color.rgb(228, 92, 82)
WHITE = color.rgb(255, 255, 255)
SEA = color.rgb(24, 56, 72)

TITLE = 18
HEAD = 16
BODY = 15
SMALL = 13
TINY = 11

WIDTH, HEIGHT = 320, 240
MARGIN = 8
MAP_TOP = 42
LIST_TOP = 26
LIST_ROWS = 7
LIST_ROW_H = 24

KIND_LABELS = {"country": "Country", "state": "State", "territory": "Territory", "district": "Federal district"}
ANTARCTICA = "antarctica"
ANTARCTICA_TEXT = "No countries and no capitals. The Antarctic Treaty sets the continent aside for peace and science."

MENU, SCOPE, EXPLORE_LIST, EXPLORE_MAP, DETAIL, QUIZ_START, QUESTION, NOTE, RESULTS, SETTINGS, CONFIRM_RESET, ERROR = (
    "menu", "scope", "explore_list", "explore_map", "detail", "quiz_start", "question", "note", "results",
    "settings", "confirm_reset", "error")

MENU_ROWS = (("World", "world"), ("United States", "us"), ("Settings", None))
SCOPE_TITLES = {"world": "World", "us": "United States"}
ORDER_LABELS = {quiz.RANDOM: "Random", quiz.ALPHABETICAL: "Alphabetical"}


# --- fonts and text -------------------------------------------------------

def load_body_font():
    try:
        import missing_details
        return missing_details.mona_sans()
    except Exception:
        pass
    try:
        return font.load("/system/assets/fonts/MonaSans-Medium.af")
    except Exception:
        return None


MONA = load_body_font()


def pixel_font(size):
    if size >= HEAD:
        return font.absolute
    return font.nope if size >= SMALL else font.sins


def use_font(size):
    if MONA is not None:
        screen.font = MONA
    else:
        screen.font = pixel_font(size)


def width_of(message, size=BODY):
    use_font(size)
    if MONA is not None:
        return screen.measure_text(message, font_size=size)[0]
    return screen.measure_text(message)[0]


def text(message, x, y, size=BODY, pen=TEXT):
    use_font(size)
    screen.pen = pen
    if MONA is not None:
        screen.text(message, x, y, size)
    else:
        screen.text(message, x, y)


def centered(message, y, size=BODY, pen=TEXT):
    text(message, (WIDTH - width_of(message, size)) // 2, y, size, pen)


def right_aligned(message, x, y, size=BODY, pen=TEXT):
    text(message, x - width_of(message, size), y, size, pen)


def fit(message, width, size=BODY):
    return layout.truncate(message, width, lambda part: width_of(part, size))


def wrapped(message, width, size=BODY, max_lines=None):
    return layout.wrap(message, width, lambda part: width_of(part, size), max_lines)


def line_height(size):
    return size + 5


# --- shared drawing ------------------------------------------------------

def clear():
    screen.pen = BG
    screen.rectangle(0, 0, WIDTH, HEIGHT)


def header(title, right=None, size=HEAD):
    text(fit(title, WIDTH - MARGIN * 2 - (width_of(right, SMALL) + 12 if right else 0), size), MARGIN, 6, size)
    if right:
        right_aligned(right, WIDTH - MARGIN, 9, SMALL, MUTED)
    screen.pen = LINE
    screen.rectangle(MARGIN, 30, WIDTH - MARGIN * 2, 1)


def footer(left, right=None, left_pen=MUTED):
    top = HEIGHT - 22
    screen.pen = PANEL
    screen.rectangle(0, top, WIDTH, HEIGHT - top)
    if left and right and width_of(left, SMALL) + width_of(right, SMALL) + MARGIN * 3 > WIDTH:
        left = fit(left, WIDTH - MARGIN * 3 - width_of(right, SMALL), SMALL)
    if left:
        text(left, MARGIN, top + 4, SMALL, left_pen)
    if right:
        right_aligned(right, WIDTH - MARGIN, top + 4, SMALL, MUTED)


def row(y, label, value, selected, height=26, value_pen=None):
    screen.pen = ACCENT if selected else PANEL
    screen.shape(shape.rounded_rectangle(MARGIN, y, WIDTH - MARGIN * 2, height, 4))
    pen = INK if selected else TEXT
    text(label, MARGIN + 10, y + (height - BODY) // 2 - 1, BODY, pen)
    if value is not None:
        right_aligned(value, WIDTH - MARGIN - 10, y + (height - BODY) // 2 - 1, BODY,
                      INK if selected else (value_pen or MUTED))


def mark(x, y, size, ok, pen):
    screen.pen = pen
    if ok:
        screen.shape(shape.line(x - size, y, x - size * 0.3, y + size * 0.7, 2))
        screen.shape(shape.line(x - size * 0.3, y + size * 0.7, x + size, y - size * 0.8, 2))
    else:
        screen.shape(shape.line(x - size, y - size, x + size, y + size, 2))
        screen.shape(shape.line(x - size, y + size, x + size, y - size, 2))


def progress_bar(y, done, total, pen=ACCENT):
    screen.pen = LINE
    screen.rectangle(MARGIN, y, WIDTH - MARGIN * 2, 6)
    if total:
        screen.pen = pen
        screen.rectangle(MARGIN, y, (WIDTH - MARGIN * 2) * done // total, 6)


def kind_label(entry):
    return KIND_LABELS.get(entry.get("kind"), "")


def places(count):
    return "%d place%s" % (count, "" if count == 1 else "s")


def capital_line(entry):
    """"Capital: Paris", or the capital's actual role such as "Government district: Yaren"."""
    return "%s: %s" % (quiz.capital_label(entry), entry["capital"])


# --- the app ----------------------------------------------------------------

class App:
    def __init__(self):
        self.mode = ERROR if DATA_ERROR else MENU
        self.banks = catalog.BANKS if catalog else {"world": (), "us": (), "states": (), "territories": (), "district": ()}
        self.state = progress.migrate(self.load_state(), self.banks, DATA_ID)
        self.scope = "world"
        self.menu_cursor = 0
        self.scope_cursor = 0
        self.settings_cursor = 0
        self.explorers = {}
        self.sequences = {}
        self.round_ = None
        self.round_open = False
        self.round_start = 0
        self.note_pending = False
        self.choice = 0
        self.new_best = False
        self.image_id = None
        self.image = None
        self.message = ""

    # --- persistence ---------------------------------------------------------

    def load_state(self):
        raw = {}
        try:
            State.load(STATE_KEY, raw)
        except Exception as error:
            print("capitals: could not load state:", error)
        return raw

    def save_state(self):
        try:
            State.save(STATE_KEY, self.state)
        except Exception as error:
            print("capitals: could not save state:", error)

    # --- data access --------------------------------------------------------

    def settings(self, scope=None):
        return self.state["settings"][scope or self.scope]

    def pool(self, scope=None):
        scope = scope or self.scope
        return progress.pool_for(scope, self.settings(scope)["filter"], self.banks)

    def bank(self, scope=None):
        return self.banks["world"] if (scope or self.scope) == "world" else self.banks["us"]

    def filters(self, scope=None):
        return progress.filters_for(scope or self.scope, self.banks)

    def filter_text(self, scope=None):
        scope = scope or self.scope
        return progress.filter_label(scope, self.settings(scope)["filter"])

    def order_text(self, scope=None):
        return ORDER_LABELS[self.settings(scope)["order"]]

    def explorer(self):
        key = (self.scope, self.settings()["filter"])
        if key not in self.explorers:
            extra = (ANTARCTICA,) if key == ("world", progress.ALL) else ()
            page_order = [page["id"] for page in atlas.PAGES]
            self.explorers = {key: explore.Explorer(self.pool(), page_order, atlas.pages_for, atlas.project, extra)}
            gc.collect()
        return self.explorers[key]

    def sequence(self):
        if self.scope not in self.sequences:
            self.sequences[self.scope] = progress.sequence_for(self.state, self.scope, self.banks, DATA_ID)
        return self.sequences[self.scope]

    def cycle_setting(self, scope, key, delta):
        chosen = self.settings(scope)
        options = list(quiz.ORDERS) if key == "order" else self.filters(scope)
        value = options[(options.index(chosen[key]) + delta) % len(options)]
        if progress.change_setting(self.state, scope, key, value):
            self.sequences.pop(scope, None)
            self.explorers = {}
            self.save_state()

    # --- map images ----------------------------------------------------------

    def page_image(self, page_id):
        if page_id != self.image_id:
            self.image = None
            gc.collect()
            self.image_id = page_id
            try:
                self.image = image.load(atlas.get_page(page_id)["asset"])
            except Exception as error:
                print("capitals: could not load map page", page_id, error)
        return self.image

    def release_image(self):
        self.image = None
        self.image_id = None
        gc.collect()

    # --- input ---------------------------------------------------------------

    def update(self):
        handler = getattr(self, "input_" + self.mode)
        handler()
        clear()
        getattr(self, "draw_" + self.mode)()

    def input_error(self):
        if badge.pressed(BUTTON_BACK) or badge.pressed(BUTTON_SELECT):
            reset()

    def input_menu(self):
        if badge.pressed(BUTTON_DOWN):
            self.menu_cursor = (self.menu_cursor + 1) % len(MENU_ROWS)
        elif badge.pressed(BUTTON_UP):
            self.menu_cursor = (self.menu_cursor - 1) % len(MENU_ROWS)
        elif badge.pressed(BUTTON_SELECT):
            scope = MENU_ROWS[self.menu_cursor][1]
            if scope:
                self.scope = scope
                self.scope_cursor = 0
                self.mode = SCOPE
            else:
                self.settings_cursor = 0
                self.mode = SETTINGS
        elif badge.pressed(BUTTON_BACK):
            reset()

    def scope_rows(self):
        return (("Explore", None), ("Quiz", None),
                ("Region" if self.scope == "world" else "Filter", self.filter_text()),
                ("Order", self.order_text()))

    def input_scope(self):
        rows = self.scope_rows()
        if badge.pressed(BUTTON_DOWN):
            self.scope_cursor = (self.scope_cursor + 1) % len(rows)
        elif badge.pressed(BUTTON_UP):
            self.scope_cursor = (self.scope_cursor - 1) % len(rows)
        elif badge.pressed(BUTTON_BACK):
            self.release_image()
            self.mode = MENU
        elif self.scope_cursor == 2 and (badge.pressed(BUTTON_LEFT) or badge.pressed(BUTTON_RIGHT)):
            self.cycle_setting(self.scope, "filter", 1 if badge.pressed(BUTTON_RIGHT) else -1)
        elif self.scope_cursor == 3 and (badge.pressed(BUTTON_LEFT) or badge.pressed(BUTTON_RIGHT)):
            self.cycle_setting(self.scope, "order", 1)
        elif badge.pressed(BUTTON_SELECT):
            if self.scope_cursor == 0:
                self.explorer()
                self.mode = EXPLORE_LIST
            elif self.scope_cursor == 1:
                self.sequence()
                self.mode = QUIZ_START
            elif self.scope_cursor == 2:
                self.cycle_setting(self.scope, "filter", 1)
            else:
                self.cycle_setting(self.scope, "order", 1)

    def input_explore_list(self):
        ex = self.explorer()
        if badge.pressed(BUTTON_BACK):
            self.release_image()
            self.mode = SCOPE
        elif not ex.entries:
            return
        elif badge.pressed(BUTTON_DOWN):
            ex.move_entry(1)
        elif badge.pressed(BUTTON_UP):
            ex.move_entry(-1)
        elif badge.pressed(BUTTON_RIGHT):
            ex.show_entry(layout.page_bounds(layout.page_of(ex.cursor, LIST_ROWS) + 1, LIST_ROWS, len(ex.entries))[0])
        elif badge.pressed(BUTTON_LEFT):
            page = layout.page_of(ex.cursor, LIST_ROWS) - 1
            ex.show_entry(layout.page_bounds(page % layout.page_count(len(ex.entries), LIST_ROWS), LIST_ROWS, len(ex.entries))[0])
        elif badge.pressed(BUTTON_SELECT):
            self.mode = EXPLORE_MAP

    def input_explore_map(self):
        ex = self.explorer()
        if badge.pressed(BUTTON_BACK):
            self.mode = EXPLORE_LIST
        elif badge.pressed(BUTTON_RIGHT):
            ex.move_on_page(1)
        elif badge.pressed(BUTTON_LEFT):
            ex.move_on_page(-1)
        elif badge.pressed(BUTTON_DOWN):
            ex.change_page(1)
        elif badge.pressed(BUTTON_UP):
            ex.change_page(-1)
        elif badge.pressed(BUTTON_SELECT) and ex.entry is not None and ex.page_entries():
            self.mode = DETAIL

    def input_detail(self):
        ex = self.explorer()
        if badge.pressed(BUTTON_BACK):
            self.mode = EXPLORE_LIST
        elif badge.pressed(BUTTON_SELECT):
            self.mode = EXPLORE_MAP
        elif badge.pressed(BUTTON_RIGHT) or badge.pressed(BUTTON_DOWN):
            ex.move_entry(1)
        elif badge.pressed(BUTTON_LEFT) or badge.pressed(BUTTON_UP):
            ex.move_entry(-1)

    def input_quiz_start(self):
        if badge.pressed(BUTTON_BACK):
            self.mode = SCOPE
        elif badge.pressed(BUTTON_SELECT):
            sequence = self.sequence()
            if sequence.exhausted:
                sequence.restart()
                progress.remember(self.state, self.scope, sequence, 0, 0, DATA_ID)
                self.save_state()
            if sequence.total:
                self.start_round()

    def start_round(self):
        sequence = self.sequence()
        self.round_start = sequence.position
        self.round_ = quiz.start_round(sequence, self.bank())
        self.round_open = self.round_ is not None
        self.choice = 0
        self.new_best = False
        self.mode = QUESTION if self.round_ else QUIZ_START

    def settle_round(self, completed):
        """Record a finished round, or put an abandoned round's unanswered questions back.

        Answered questions count as asked either way; the rest return to the
        front of the pass, so BACK or HOME mid-round never skips a place.
        """
        round_ = self.round_
        if round_ is None or not self.round_open:
            return
        self.round_open = False
        sequence = self.sequence()
        answered = len(round_.answers)
        if completed:
            self.new_best = progress.record_round(self.state, round_)
        else:
            sequence.position = self.round_start + answered
        correct, asked = progress.pass_totals(self.state, self.scope)
        progress.remember(self.state, self.scope, sequence, correct + round_.score(), asked + answered, DATA_ID)
        self.save_state()

    def input_question(self):
        round_ = self.round_
        if badge.pressed(BUTTON_BACK):
            self.abandon_round()
            return
        if round_.phase == quiz.ANSWERING:
            count = len(round_.current_choices())
            if badge.pressed(BUTTON_DOWN):
                self.choice = (self.choice + 1) % count
            elif badge.pressed(BUTTON_UP):
                self.choice = (self.choice - 1) % count
            elif badge.pressed(BUTTON_SELECT):
                round_.submit(self.choice)
        elif badge.pressed(BUTTON_SELECT):
            if self.note_pending:
                self.mode = NOTE
            else:
                self.advance_question()

    def advance_question(self):
        round_ = self.round_
        round_.advance()
        self.choice = 0
        self.note_pending = False
        if round_.phase == quiz.COMPLETE:
            self.finish_round()
        else:
            self.mode = QUESTION

    def input_note(self):
        if badge.pressed(BUTTON_BACK):
            self.abandon_round()
        elif badge.pressed(BUTTON_SELECT):
            self.advance_question()

    def abandon_round(self):
        self.settle_round(False)
        self.round_ = None
        self.mode = QUIZ_START

    def finish_round(self):
        self.settle_round(True)
        self.mode = RESULTS

    def input_results(self):
        if badge.pressed(BUTTON_SELECT):
            if self.sequence().exhausted:
                self.mode = QUIZ_START
            else:
                self.start_round()
        elif badge.pressed(BUTTON_BACK):
            self.mode = QUIZ_START

    def settings_rows(self):
        return (("World order", ("world", "order")), ("World region", ("world", "filter")),
                ("U.S. order", ("us", "order")), ("U.S. filter", ("us", "filter")),
                ("Reset quiz passes", None))

    def input_settings(self):
        rows = self.settings_rows()
        target = rows[self.settings_cursor][1]
        if badge.pressed(BUTTON_DOWN):
            self.settings_cursor = (self.settings_cursor + 1) % len(rows)
        elif badge.pressed(BUTTON_UP):
            self.settings_cursor = (self.settings_cursor - 1) % len(rows)
        elif badge.pressed(BUTTON_BACK):
            self.mode = MENU
        elif target and (badge.pressed(BUTTON_RIGHT) or badge.pressed(BUTTON_SELECT)):
            self.cycle_setting(target[0], target[1], 1)
        elif target and badge.pressed(BUTTON_LEFT):
            self.cycle_setting(target[0], target[1], -1)
        elif not target and badge.pressed(BUTTON_SELECT):
            self.mode = CONFIRM_RESET

    def input_confirm_reset(self):
        if badge.pressed(BUTTON_SELECT):
            progress.clear_progress(self.state)
            self.sequences = {}
            self.save_state()
            self.message = "Quiz passes forgotten"
            self.mode = SETTINGS
        elif badge.pressed(BUTTON_BACK):
            self.mode = SETTINGS

    # --- drawing -------------------------------------------------------------

    def draw_error(self):
        header("Capitals")
        y = 44
        for line in wrapped(DATA_ERROR or "", WIDTH - MARGIN * 2, SMALL, 6):
            text(line, MARGIN, y, SMALL, BAD)
            y += line_height(SMALL)
        footer("Reinstall the app's data files", "BACK: menu")

    def draw_menu(self):
        header("Capitals", "data as of " + catalog.DATA_AS_OF if catalog else "")
        for index, (label, scope) in enumerate(MENU_ROWS):
            value = None
            if scope:
                value = places(len(self.bank(scope)))
            row(44 + index * 32, label, value, index == self.menu_cursor)
        best = "Best round %d/%d" % (self.state["best"], quiz.QUESTIONS) if self.state["played"] else "No rounds played yet"
        footer(best, "SELECT: open")

    def draw_scope(self):
        header(SCOPE_TITLES[self.scope], places(len(self.pool())))
        rows = self.scope_rows()
        for index, (label, value) in enumerate(rows):
            row(40 + index * 30, label, value, index == self.scope_cursor)
        correct, asked = progress.pass_totals(self.state, self.scope)
        total = len(self.pool())
        if total:
            summary = "Quiz pass: %d of %d asked, %d right" % (asked, total, correct)
        else:
            summary = "Nothing matches this filter"
        hint = "LEFT/RIGHT: change" if self.scope_cursor >= 2 else "SELECT: open"
        footer(summary, hint)

    def draw_explore_list(self):
        ex = self.explorer()
        count = len(ex.entries)
        header("%s: %s" % (SCOPE_TITLES[self.scope], self.filter_text()), places(count))
        if not count:
            centered("Nothing matches this filter.", 100, BODY, MUTED)
            footer("", "BACK")
            return
        page = layout.page_of(ex.cursor, LIST_ROWS)
        start, end = layout.page_bounds(page, LIST_ROWS, count)
        for slot, index in enumerate(range(start, end)):
            entry = ex.entries[index]
            y = LIST_TOP + 10 + slot * LIST_ROW_H
            selected = index == ex.cursor
            screen.pen = ACCENT if selected else BG
            if selected:
                screen.shape(shape.rounded_rectangle(MARGIN, y - 3, WIDTH - MARGIN * 2, LIST_ROW_H - 2, 4))
            pen = INK if selected else TEXT
            tag = kind_label(entry) if entry.get("kind") in ("territory", "district") else ""
            capital = fit(entry["capital"], 120, SMALL)
            name_width = WIDTH - MARGIN * 2 - 20 - width_of(capital, SMALL) - (width_of(tag, TINY) + 8 if tag else 0)
            name = fit(entry["name"], name_width, BODY)
            text(name, MARGIN + 8, y, BODY, pen)
            if tag:
                text(tag, MARGIN + 12 + width_of(name, BODY), y + 3, TINY, INK if selected else ACCENT)
            right_aligned(capital, WIDTH - MARGIN - 8, y + 1, SMALL, INK if selected else MUTED)
        footer("Page %s" % layout.page_label(page, layout.page_count(count, LIST_ROWS)),
               "SELECT: map   LEFT/RIGHT: page")

    def draw_marker(self, point):
        x, y = point
        screen.pen = WHITE
        screen.shape(shape.circle(x, y, 7).stroke(2))
        screen.pen = ACCENT
        screen.shape(shape.circle(x, y, 3.5))

    def draw_map(self, ex):
        img = self.page_image(ex.page) if ex.page else None
        if img is not None:
            screen.blit(img, vec2(0, MAP_TOP))
        else:
            screen.pen = SEA
            screen.rectangle(0, MAP_TOP, WIDTH, atlas.MAP_HEIGHT)
            centered("Map image unavailable", MAP_TOP + 68, SMALL, MUTED)
        point = ex.marker(MAP_TOP)
        if point is not None:
            self.draw_marker(point)

    def draw_explore_map(self):
        ex = self.explorer()
        page = atlas.get_page(ex.page) if ex.page else None
        position, count = ex.position_on_page()
        header(page["title"] if page else SCOPE_TITLES[self.scope],
               "%d/%d" % (position, count) if count else "page %d/%d" % (ex.page_index + 1, len(ex.pages)))
        self.draw_map(ex)
        entry = ex.entry
        if ex.page == ANTARCTICA or not count:
            lines = wrapped(ANTARCTICA_TEXT if ex.page == ANTARCTICA else "No places on this page.", WIDTH - MARGIN * 2, SMALL, 2)
            for index, line in enumerate(lines):
                text(line, MARGIN, 198 + index * line_height(SMALL), SMALL, MUTED)
            return
        text(fit(entry["name"], WIDTH - MARGIN * 2 - 70, HEAD), MARGIN, 195, HEAD)
        right_aligned(kind_label(entry), WIDTH - MARGIN, 199, TINY, ACCENT)
        text(fit(capital_line(entry), WIDTH - MARGIN * 2, BODY), MARGIN, 217, BODY, MUTED)

    def draw_detail(self):
        ex = self.explorer()
        entry = ex.entry
        if entry is None:
            self.mode = EXPLORE_LIST
            return
        y = 8
        for line in wrapped(entry["name"], WIDTH - MARGIN * 2, TITLE, 2):
            text(line, MARGIN, y, TITLE)
            y += line_height(TITLE)
        for line in wrapped(capital_line(entry), WIDTH - MARGIN * 2, HEAD, 2):
            text(line, MARGIN, y + 2, HEAD, ACCENT)
            y += line_height(HEAD)
        y += 4
        where = kind_label(entry)
        if entry.get("region"):
            where += "  ·  " + entry["region"]
            if entry.get("subregion") and entry["subregion"] != entry["region"]:
                where += "  ·  " + entry["subregion"]
        text(fit(where, WIDTH - MARGIN * 2, SMALL), MARGIN, y, SMALL, MUTED)
        y += line_height(SMALL) + 4
        if entry.get("note"):
            for line in wrapped(entry["note"], WIDTH - MARGIN * 2, SMALL, 4):
                text(line, MARGIN, y, SMALL)
                y += line_height(SMALL)
        aliases = entry.get("aliases") or ()
        if aliases and y < HEIGHT - 44:
            text(fit("Also known as " + ", ".join(aliases), WIDTH - MARGIN * 2, TINY), MARGIN, y + 2, TINY, MUTED)
        footer("%d of %d" % (ex.cursor + 1, len(ex.entries)), "LEFT/RIGHT: next   SELECT: map")

    def draw_quiz_start(self):
        sequence = self.sequence()
        header(SCOPE_TITLES[self.scope] + " quiz", places(sequence.total))
        y = 42
        for label, value in (("Region" if self.scope == "world" else "Filter", self.filter_text()), ("Order", self.order_text())):
            text(label, MARGIN, y, BODY, MUTED)
            right_aligned(value, WIDTH - MARGIN, y, BODY)
            y += line_height(BODY) + 2
        correct, asked = progress.pass_totals(self.state, self.scope)
        if not sequence.total:
            centered("Nothing matches this filter.", 120, BODY, MUTED)
            footer("", "BACK")
            return
        y += 6
        text("This pass", MARGIN, y, SMALL, MUTED)
        right_aligned("%d of %d asked, %d right" % (asked, sequence.total, correct), WIDTH - MARGIN, y, SMALL)
        progress_bar(y + 20, sequence.position, sequence.total)
        y += 34
        if self.state["played"]:
            played = self.state["played"]
            text("Best round %d/%d  ·  %d round%s played" % (self.state["best"], quiz.QUESTIONS, played, "" if played == 1 else "s"),
                 MARGIN, y, SMALL, MUTED)
        if sequence.exhausted:
            centered("Pass complete!", y + 28, HEAD, ACCENT)
            action = "SELECT: reshuffle" if sequence.order == quiz.RANDOM else "SELECT: start over"
            footer("All places asked once", action, GOOD)
        else:
            count = min(quiz.QUESTIONS, sequence.remaining)
            footer("Next round: %d question%s" % (count, "" if count == 1 else "s"), "SELECT: start")

    def draw_question(self):
        round_ = self.round_
        entry = round_.current()
        sequence = self.sequence()
        header("Question %d of %d" % (round_.index + 1, len(round_.questions)),
               "%d/%d in pass" % (self.round_start + round_.index + 1, sequence.total), SMALL)
        y = 36
        for line in wrapped(quiz.question_text(entry), WIDTH - MARGIN * 2, HEAD, 3):
            text(line, MARGIN, y, HEAD)
            y += line_height(HEAD)
        feedback = round_.phase == quiz.FEEDBACK
        chosen = round_.answers[round_.index] if feedback else None
        # Short questions leave the answers higher, which keeps room for the note.
        top = y + 6
        for index, option in enumerate(round_.current_choices()):
            ry = top + index * layout.CHOICE_PITCH
            if feedback:
                if option == entry["capital"]:
                    fill, pen = GOOD, INK
                elif option == chosen:
                    fill, pen = BAD, INK
                else:
                    fill, pen = PANEL, MUTED
            elif index == self.choice:
                fill, pen = ACCENT, INK
            else:
                fill, pen = PANEL, TEXT
            screen.pen = fill
            screen.shape(shape.rounded_rectangle(MARGIN, ry, WIDTH - MARGIN * 2, layout.CHOICE_HEIGHT, 4))
            text(chr(ord("A") + index), MARGIN + 8, ry + 4, SMALL, pen)
            text(fit(option, WIDTH - MARGIN * 2 - 50, BODY), MARGIN + 26, ry + 3, BODY, pen)
            if feedback and (option == entry["capital"] or option == chosen):
                mark(WIDTH - MARGIN - 14, ry + 11, 4, option == entry["capital"], INK)
        self.note_pending = False
        if feedback:
            note = entry.get("note") or ""
            right = "SELECT: results" if round_.is_last() else "SELECT: next"
            if note:
                note_top = top + len(round_.current_choices()) * layout.CHOICE_PITCH + 2
                room = layout.lines_available(note_top, layout.NOTE_LINE_HEIGHT)
                lines = wrapped(note, WIDTH - MARGIN * 2, SMALL)
                if len(lines) > room:
                    # The whole note gets its own screen; show what fits as a preview.
                    self.note_pending = True
                    lines = wrapped(note, WIDTH - MARGIN * 2, SMALL, max(room, 1)) if room else []
                    right = "SELECT: full note"
                for index, line in enumerate(lines):
                    text(line, MARGIN, note_top + index * layout.NOTE_LINE_HEIGHT, SMALL, MUTED)
            if chosen == entry["capital"]:
                footer("Correct!", right, GOOD)
            else:
                footer("Wrong. It's " + entry["capital"], right, BAD)
        else:
            footer("Pick the capital", "SELECT: check")

    def draw_note(self):
        round_ = self.round_
        entry = round_.current()
        header(fit("About " + entry["name"], WIDTH - MARGIN * 2, HEAD))
        text(fit("%s: %s" % (quiz.capital_label(entry), entry["capital"]), WIDTH - MARGIN * 2, BODY), MARGIN, 38, BODY, ACCENT)
        y = 62
        for line in wrapped(entry.get("note") or "", WIDTH - MARGIN * 2, BODY, layout.lines_available(62, line_height(BODY))):
            text(line, MARGIN, y, BODY)
            y += line_height(BODY)
        footer("", "SELECT: results" if round_.is_last() else "SELECT: next")

    def draw_results(self):
        round_ = self.round_
        sequence = self.sequence()
        score, total = round_.score(), len(round_.questions)
        header("Round done: %d of %d" % (score, total), "pass %d/%d" % (sequence.position, sequence.total))
        correct, asked = progress.pass_totals(self.state, self.scope)
        best = "New best!" if self.new_best else "Best %d/%d" % (self.state["best"], quiz.QUESTIONS)
        text("This pass: %d of %d right  ·  %s" % (correct, asked, best), MARGIN, 34, SMALL, ACCENT if self.new_best else MUTED)
        missed = round_.missed()
        if not missed:
            centered("Every answer was right!", 100, HEAD, GOOD)
        else:
            # Five rows of 30 px from 56 end at 202, above the footer (layout.rows_fit).
            for index, (entry, chosen) in enumerate(missed):
                y = layout.RESULTS_TOP + index * layout.RESULTS_PITCH
                text(fit(entry["name"] + ": " + entry["capital"], WIDTH - MARGIN * 2, BODY), MARGIN, y, BODY)
                text(fit("you chose " + chosen, WIDTH - MARGIN * 2 - 12, TINY), MARGIN + 12, y + 15, TINY, BAD)
        if sequence.exhausted:
            footer("Pass complete!", "SELECT: continue", GOOD)
        else:
            footer("%d places left in this pass" % sequence.remaining, "SELECT: next round")

    def draw_settings(self):
        header("Settings", "data as of " + catalog.DATA_AS_OF if catalog else "")
        for index, (label, target) in enumerate(self.settings_rows()):
            if target:
                scope, key = target
                value = self.order_text(scope) if key == "order" else self.filter_text(scope)
            else:
                value = None
            row(40 + index * 30, label, value, index == self.settings_cursor)
        hint = "SELECT" if self.settings_cursor == 4 else "LEFT/RIGHT: change"
        footer(self.message or "Scores and settings are kept on the badge", hint)

    def draw_confirm_reset(self):
        header("Reset quiz passes?")
        y = 52
        for line in wrapped("Both quiz passes start over from scratch. Your best round and rounds played are kept.", WIDTH - MARGIN * 2, BODY, 4):
            text(line, MARGIN, y, BODY)
            y += line_height(BODY)
        footer("BACK: keep them", "SELECT: reset")


app = App()


def update():
    app.update()


def on_exit():
    """HOME during a round keeps the answered questions and returns the rest to the pass."""
    app.settle_round(False)
    app.release_image()


run(update)
