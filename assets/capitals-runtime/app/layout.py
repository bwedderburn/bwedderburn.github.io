"""Text wrapping and paging helpers for Capitals screens, free of badge APIs.

The badge measures text through screen.measure_text; these helpers take a
measure callback so they can be tested on a computer with a fake ruler.
"""

ELLIPSIS = "..."

# Screen geometry shared with the badge entry point and checked by host tests.
SCREEN_HEIGHT = 240
FOOTER_TOP = SCREEN_HEIGHT - 22
RESULTS_TOP = 56            # first missed answer on the results screen
RESULTS_PITCH = 30          # one missed answer per 30 px
RESULTS_ROW_HEIGHT = 27     # a 15 px name line and a 12 px "you chose" line
CHOICE_PITCH = 24           # answer rows on the question screen
CHOICE_HEIGHT = 22
NOTE_LINE_HEIGHT = 18       # 13 px note text plus spacing


def rows_fit(top, pitch, height, count, bottom=FOOTER_TOP):
    """True when `count` rows of `height` every `pitch` px from `top` end above `bottom`."""
    return count <= 0 or top + (count - 1) * pitch + height <= bottom


def lines_available(top, line_height, bottom=FOOTER_TOP):
    """How many text lines of `line_height` fit between `top` and `bottom`."""
    return max(0, (bottom - top) // line_height)


def wrap(text, width, measure, max_lines=None):
    """Break text into lines no wider than `width` pixels.

    Breaks at spaces, and inside a word only when the word alone is too wide.
    With max_lines, the last kept line ends in an ellipsis when text is cut.
    """
    lines = []
    for paragraph in str(text).split("\n"):
        words = paragraph.split(" ")
        line = ""
        for word in words:
            candidate = word if not line else line + " " + word
            if measure(candidate) <= width:
                line = candidate
                continue
            if line:
                lines.append(line)
                line = ""
            while word and measure(word) > width:
                cut = len(word)
                while cut > 1 and measure(word[:cut]) > width:
                    cut -= 1
                lines.append(word[:cut])
                word = word[cut:]
            line = word
        lines.append(line)
    if max_lines is not None and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = truncate(lines[-1] + " " + ELLIPSIS, width, measure)
    return lines


def truncate(text, width, measure):
    """Shorten text to fit `width`, ending in an ellipsis when it was cut."""
    text = str(text)
    if measure(text) <= width:
        return text
    cut = len(text)
    while cut > 0 and measure(text[:cut].rstrip() + ELLIPSIS) > width:
        cut -= 1
    return text[:cut].rstrip() + ELLIPSIS if cut else ELLIPSIS


def page_count(total, per_page):
    return max(1, (total + per_page - 1) // per_page)


def page_of(index, per_page):
    return index // per_page


def page_bounds(page, per_page, total):
    """(first index, end index) of a page, clamped to the collection."""
    start = min(page * per_page, max(0, total - 1))
    return start, min(start + per_page, total)


def move(index, delta, total, wrap_around=True):
    """A cursor moved by delta within a collection, wrapping or clamping."""
    if total <= 0:
        return 0
    if wrap_around:
        return (index + delta) % total
    return max(0, min(total - 1, index + delta))


def page_label(page, pages):
    return "%d/%d" % (page + 1, pages)
