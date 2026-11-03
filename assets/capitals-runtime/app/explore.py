"""Explore navigation for Capitals: which map pages a pool uses, which entries
sit on each page, and one cursor shared by the list and the map, free of badge
APIs.

The atlas supplies pages_for(record) (page ids, detail first, world last) and
project(page_id, lat, lon) (map-local pixels or None). Entries are kept in
alphabetical order so the list and the map agree on "next" and "previous".
"""

import quiz


class Explorer:
    def __init__(self, pool, page_order, pages_for, project, extra_pages=()):
        self.entries = quiz.ordered(pool, quiz.ALPHABETICAL)
        self.pages_for = pages_for
        self.project = project
        self.entry_pages = [tuple(pages_for(entry)) for entry in self.entries]
        used = set()
        for pages in self.entry_pages:
            used.update(pages)
        used.update(extra_pages)
        self.pages = [page_id for page_id in page_order if page_id in used]
        self.on_page = {}
        for index, pages in enumerate(self.entry_pages):
            for page_id in pages:
                self.on_page.setdefault(page_id, []).append(index)
        self.cursor = 0
        self.page_index = 0
        if self.entries:
            self.show_entry(0)

    # --- the selected entry -------------------------------------------------

    @property
    def entry(self):
        return self.entries[self.cursor] if self.entries else None

    @property
    def page(self):
        return self.pages[self.page_index] if self.pages else None

    def page_entries(self, page_id=None):
        """Entry indices on a page, in alphabetical order."""
        return self.on_page.get(self.page if page_id is None else page_id, [])

    def position_on_page(self):
        """(1-based position, count) of the selected entry on the current page."""
        indices = self.page_entries()
        if self.cursor in indices:
            return indices.index(self.cursor) + 1, len(indices)
        return 0, len(indices)

    def marker(self, offset_y=0):
        """Map pixel position of the selected entry on the current page, or None."""
        entry = self.entry
        if entry is None or self.page is None or self.page not in self.entry_pages[self.cursor]:
            return None
        point = self.project(self.page, entry["lat"], entry["lon"])
        if point is None:
            return None
        return point[0], point[1] + offset_y

    # --- moving ----------------------------------------------------------

    def show_entry(self, index):
        """Select an entry (from the list) and show its most detailed page."""
        if not self.entries:
            return
        self.cursor = index % len(self.entries)
        first = self.entry_pages[self.cursor][0]
        if first in self.pages:
            self.page_index = self.pages.index(first)

    def move_entry(self, delta):
        """Select the previous or next entry in list order, following it onto its page."""
        if self.entries:
            self.show_entry(self.cursor + delta)

    def move_on_page(self, delta):
        """Select the previous or next entry among those on the current page."""
        indices = self.page_entries()
        if not indices:
            return
        if self.cursor in indices:
            self.cursor = indices[(indices.index(self.cursor) + delta) % len(indices)]
        else:
            self.cursor = indices[0]

    def change_page(self, delta):
        """Show the previous or next page; keep the entry if it is on it, else the first there."""
        if not self.pages:
            return
        self.page_index = (self.page_index + delta) % len(self.pages)
        indices = self.page_entries()
        if indices and self.cursor not in indices:
            self.cursor = indices[0]
