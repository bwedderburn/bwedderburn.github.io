"""Single-app browser launcher. The Capitals application itself is unmodified."""
import builtins
import gc
import json
import os
import sys
import time
import js
import badgeware
import editor_support

APP = "/system/apps/capitals"
sys.path[:0] = [APP, "/system/lib", "/lib", "/system"]
os.chdir(APP)

class _Action:
    def __init__(self, name):
        self.name = name

builtins.BUTTON_BACK = _Action("BACK")
builtins.BUTTON_MENU = _Action("MENU")

class _Home(BaseException):
    pass

_scope = {}
_native_poll = badge.poll
_native_run = badgeware._run
_saved_save = badgeware.State.save
_last_snapshot = ""
_last_snapshot_time = 0
_memory_at_launch = None

def _save(app, data):
    _saved_save(app, data)
    if app == "capitals":
        js.sim_capitals_persist(json.dumps(data))

badgeware.State.save = staticmethod(_save)

def _poll():
    _native_poll()
    if badge.pressed(BUTTON_HOME):
        raise _Home()

badge.poll = _poll
builtins.reset = lambda: (_ for _ in ()).throw(_Home())

def _record(entry, answer=True):
    if entry is None:
        return None
    names = ("id", "name", "kind", "region", "subregion", "question", "lat", "lon")
    result = {name: entry.get(name) for name in names}
    if answer:
        result["capital"] = entry["capital"]
        result["note"] = entry.get("note", "")
    return result

def _option(label, selected, value=None):
    return {"label": label, "selected": selected, "value": value}

def _snapshot():
    app = _scope.get("app")
    if app is None:
        return None
    mode, scope = app.mode, app.scope
    result = {"mode": mode, "scope": scope, "title": "World Capitals", "options": [],
              "selectedIndex": 0, "lines": [], "hint": "Use the badge controls", "record": None,
              "question": None, "choices": [], "feedback": None, "score": None,
              "settings": app.state["settings"], "counts": {"world": 195, "us": 56},
              "dataAsOf": _scope["catalog"].DATA_AS_OF, "best": app.state["best"], "played": app.state["played"],
              "memoryAtLaunch": _memory_at_launch}
    settings = app.settings()
    total = len(app.pool())
    remembered = app.state["progress"].get(scope, {})
    sequence = app.sequences.get(scope)
    result["progress"] = {"total": total, "position": sequence.position if sequence else remembered.get("position", 0),
                          "asked": remembered.get("pass_asked", 0), "correct": remembered.get("pass_correct", 0),
                          "exhausted": sequence.exhausted if sequence else False,
                          "filter": settings["filter"], "filterLabel": app.filter_text(), "order": app.order_text()}
    if mode == "menu":
        result["title"] = "World Capitals"
        result["selectedIndex"] = app.menu_cursor
        result["options"] = [_option(label, index == app.menu_cursor, "195 countries" if target == "world" else "50 states + 6 other places" if target == "us" else None)
                             for index, (label, target) in enumerate(_scope["MENU_ROWS"])]
        result["hint"] = "SELECT opens the highlighted item. HOME returns to the launcher."
    elif mode == "scope":
        result["title"] = _scope["SCOPE_TITLES"][scope]
        result["summary"] = "%s. %s. %d places." % (app.filter_text(), app.order_text(), total)
        result["selectedIndex"] = app.scope_cursor
        result["options"] = [_option(label, index == app.scope_cursor, value) for index, (label, value) in enumerate(app.scope_rows())]
        result["hint"] = "SELECT opens; left/right changes the highlighted region, filter or order. BACK returns."
    elif mode in ("explore_list", "explore_map", "detail"):
        ex = app.explorers.get((scope, settings["filter"]))
        result["title"] = "Explore " + _scope["SCOPE_TITLES"][scope]
        if ex:
            entry = ex.entry
            result["record"] = _record(entry)
            result["map"] = {"id": ex.page, "index": ex.page_index, "count": len(ex.pages),
                             "position": list(ex.position_on_page()), "marker": ex.marker()}
            if ex.page:
                page = _scope["atlas"].get_page(ex.page)
                result["map"]["title"] = page["title"]
                result["map"]["asset"] = page["asset"]
            result["entryIndex"] = ex.cursor
            result["entryTotal"] = len(ex.entries)
            if mode == "explore_list":
                start = ex.cursor // 7 * 7
                result["selectedIndex"] = ex.cursor - start
                result["options"] = [_option(record["name"], index == ex.cursor, record["capital"])
                                     for index, record in enumerate(ex.entries) if start <= index < start + 7]
                result["page"] = {"index": ex.cursor // 7, "count": (len(ex.entries) + 6) // 7}
                result["summary"] = "Page %d of %d. %d places." % (ex.cursor // 7 + 1, (len(ex.entries) + 6) // 7, len(ex.entries))
                result["hint"] = "Up/down chooses a place. Left/right changes the list page. SELECT opens its map."
            elif mode == "explore_map":
                result["summary"] = "Map: %s. Page %d of %d." % (result["map"].get("title", ""), ex.page_index + 1, len(ex.pages))
                if entry and ex.page_entries():
                    result["lines"] = [entry["name"], _scope["quiz"].capital_label(entry) + ": " + entry["capital"], entry.get("note", "")]
                result["hint"] = "Left/right chooses a place on the map. Up/down changes map page. SELECT shows details; BACK shows the list."
                if ex.page == "antarctica":
                    result["record"] = None
                    result["lines"] = [_scope["ANTARCTICA_TEXT"]]
            else:
                result["title"] = entry["name"] if entry else "Place details"
                if entry:
                    result["summary"] = _scope["quiz"].capital_label(entry) + ": " + entry["capital"]
                    result["lines"] = [entry["region"], entry.get("subregion", ""), entry.get("note", "")]
                result["hint"] = "Left/right selects another place. SELECT returns to the map; BACK shows the list."
    elif mode == "quiz_start":
        result["title"] = _scope["SCOPE_TITLES"][scope] + " quiz"
        result["lines"] = [app.filter_text(), app.order_text(), "%d places in this pass" % total]
        result["hint"] = "SELECT starts the next round or begins a new pass. BACK returns."
    elif mode in ("question", "note", "results"):
        round_ = app.round_
        if round_:
            result["score"] = {"correct": round_.score(), "answered": len(round_.answers), "total": len(round_.questions)}
            if mode != "results":
                entry = round_.current()
                answered = round_.phase != _scope["quiz"].ANSWERING
                result["record"] = _record(entry, answered)
                result["question"] = _scope["quiz"].question_text(entry)
                result["title"] = "Question %d of %d" % (round_.index + 1, len(round_.questions))
                result["selectedIndex"] = app.choice
                result["choices"] = list(round_.current_choices())
                result["options"] = [_option(label, index == app.choice) for index, label in enumerate(round_.current_choices())]
                result["phase"] = round_.phase
                if answered:
                    chosen = round_.answers[round_.index]
                    result["feedback"] = {"correct": round_.correct(round_.index), "chosen": chosen,
                                          "answer": entry["capital"], "note": entry.get("note", ""),
                                          "text": ("Correct! " if round_.correct(round_.index) else "Incorrect. The answer is ") + entry["capital"]}
                    result["lines"] = [entry.get("note", "")]
                result["hint"] = "SELECT continues; BACK returns to the quiz overview." if answered else "Up/down chooses an answer. SELECT checks it. BACK returns."
            else:
                result["title"] = "Round complete"
                result["summary"] = "%d of %d correct." % (round_.score(), len(round_.questions))
                result["missed"] = [{"record": _record(entry), "chosen": chosen} for entry, chosen in round_.missed()]
                result["lines"] = [entry["name"] + ": " + entry["capital"] + ". You chose " + chosen + "." for entry, chosen in round_.missed()]
                if not result["lines"]:
                    result["lines"] = ["Every answer was right!"]
                result["hint"] = "SELECT continues through the pass. BACK returns to the quiz overview."
    elif mode == "settings":
        result["title"] = "Settings"
        result["selectedIndex"] = app.settings_cursor
        for index, (label, target) in enumerate(app.settings_rows()):
            value = (app.order_text(target[0]) if target[1] == "order" else app.filter_text(target[0])) if target else None
            result["options"].append(_option(label, index == app.settings_cursor, value))
        result["hint"] = "Left/right changes the highlighted setting. BACK returns. Quiz-pass reset keeps best scores."
    elif mode == "confirm_reset":
        result["title"] = "Reset quiz passes?"
        result["lines"] = ["Both passes start over. Best round and completed-round counters are kept."]
        result["hint"] = "SELECT confirms. BACK keeps your passes."
    elif mode == "error":
        result["title"] = "Data unavailable"
        result["lines"] = [_scope.get("DATA_ERROR") or "Unknown app error"]
    return result

def _publish(force=False):
    global _last_snapshot, _last_snapshot_time
    now = time.ticks_ms()
    if not force and time.ticks_diff(now, _last_snapshot_time) < 90:
        return
    _last_snapshot_time = now
    snapshot = _snapshot()
    if snapshot:
        encoded = json.dumps(snapshot)
        if encoded != _last_snapshot:
            _last_snapshot = encoded
            js.sim_capitals_snapshot(encoded)

def _run(callback):
    def tick():
        global _memory_at_launch
        callback()
        if _memory_at_launch is None:
            gc.collect()
            _memory_at_launch = {"gcAllocatedBytes": gc.mem_alloc(), "gcFreeBytes": gc.mem_free(),
                                 "requestedMicroPythonHeapBytes": 7 * 1024 * 1024,
                                 "wasmLinearMemoryBytes": int(js.sim_capitals_wasm_bytes())}
        _publish()
    _native_run(tick)

builtins.run = _run

def _launcher():
    global _last_snapshot
    snapshot = {"mode": "launcher", "scope": "world", "title": "Badge launcher",
                "options": [_option("World Capitals", True, "Atlas and quiz")], "selectedIndex": 0,
                "lines": [], "hint": "SELECT opens World Capitals.", "record": None,
                "counts": {"world": 195, "us": 56}}
    _last_snapshot = json.dumps(snapshot)
    js.sim_capitals_snapshot(_last_snapshot)
    while True:
        screen.pen = color.rgb(18, 43, 43)
        screen.rectangle(0, 0, 320, 240)
        screen.font = font.absolute
        screen.pen = color.rgb(240, 244, 236)
        screen.text("Badge launcher", 12, 16)
        screen.pen = color.rgb(244, 196, 88)
        screen.rectangle(8, 78, 304, 42)
        screen.pen = color.rgb(18, 30, 28)
        screen.text("World Capitals", 18, 90)
        screen.pen = color.rgb(240, 244, 236)
        screen.font = font.nope
        screen.text("SELECT: open", 12, 210)
        display.update()
        _native_poll()
        if badge.pressed(BUTTON_SELECT):
            break
        time.sleep(0.02)

show_launcher = False
while True:
    try:
        badge.mode(HIRES | VSYNC)
        badge.autorotate(False)
        badge.rotate_180(False)
        _native_poll()
        while badge.held():
            time.sleep(0.02)
            _native_poll()
        if show_launcher:
            _launcher()
            while badge.held():
                time.sleep(0.02)
                _native_poll()
        _scope = {"__name__": "__main__", "__file__": APP + "/__init__.py"}
        with open(APP + "/__init__.py") as source:
            exec(compile(source.read(), APP + "/__init__.py", "exec"), _scope)
    except _Home:
        on_exit = _scope.get("on_exit")
        if callable(on_exit):
            on_exit()
        show_launcher = True
    except Exception as error:
        sys.print_exception(error)
        raise
