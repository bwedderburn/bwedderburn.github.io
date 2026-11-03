"""Capitals quiz rules, kept free of badge APIs so they can be tested on a computer.

The rules work on catalog records: plain dicts with id, name, capital, region,
subregion, lat, lon, note, question and kind, as delivered by catalog.py. They
use only what MicroPython provides: no random.Random instances, dataclasses,
typing or itertools.
"""

import random

QUESTIONS = 5
CHOICES = 4

RANDOM = "random"
ALPHABETICAL = "alphabetical"
ORDERS = (RANDOM, ALPHABETICAL)

ANSWERING = "answering"
FEEDBACK = "feedback"
COMPLETE = "complete"

KINDS = ("country", "state", "territory", "district")
REQUIRED_FIELDS = ("id", "name", "capital", "region", "subregion", "lat", "lon", "note", "question", "kind")


def shuffled(items, rng=random):
    """Return a Fisher-Yates shuffled copy (MicroPython has no random.shuffle)."""
    items = list(items)
    for index in range(len(items) - 1, 0, -1):
        target = rng.randrange(index + 1)
        items[index], items[target] = items[target], items[index]
    return items


def seeded(seed):
    """Seed the module RNG and return it, so traversals repeat on the badge."""
    random.seed(seed)
    return random


def new_seed(rng=random):
    return rng.randrange(1 << 30)


def sort_key(record):
    """Alphabetical order uses the catalog's sort_key field, else the lower-cased name."""
    return str(record.get("sort_key") or record["name"]).lower()


def label_key(label):
    """A comparison key for a choice label: case and spacing do not matter."""
    return " ".join(str(label).lower().split())


def same_label(first, second):
    """True when two choice labels would read as the same answer."""
    return label_key(first) == label_key(second)


def ordered(pool, order, rng=random):
    """The pool as a traversal order: stable by name, or shuffled."""
    if order == ALPHABETICAL:
        return sorted(pool, key=sort_key)
    if order == RANDOM:
        return shuffled(pool, rng)
    raise ValueError("Unknown question order: %r" % (order,))


def regions(pool):
    """Distinct region names in the order the catalog lists them."""
    seen = []
    for record in pool:
        if record["region"] not in seen:
            seen.append(record["region"])
    return seen


def by_region(pool, region):
    return tuple(record for record in pool if record["region"] == region)


def by_kind(pool, kind):
    return tuple(record for record in pool if record.get("kind") == kind)


def question_text(record):
    """The question exactly as the catalog words it; special capital roles depend on it."""
    return record.get("question") or "What is the capital of %s?" % record["name"]


def capital_label(record):
    """The role the capital answer plays, taken from the question's wording.

    "Capital of Benin?" gives "Capital"; "Government district of Nauru?" gives
    "Government district"; "Israel's declared capital?" gives "Declared capital";
    a question with neither form is used as it stands.
    """
    question = question_text(record).strip()
    if question.endswith("?"):
        question = question[:-1].strip()
    if question.lower().startswith("capital of ") or question.lower().startswith("what is the capital of "):
        return "Capital"
    cut = question.find(" of ")
    if cut > 0:
        return question[:cut]
    cut = question.find("'s ")
    if cut > 0:
        rest = question[cut + 3:].strip()
        if rest:
            return rest[0].upper() + rest[1:]
    return question or "Capital"


class Sequence:
    """One pass through a pool in the chosen order, continued across rounds.

    Random order never repeats an entry until every entry has been asked; then
    the sequence is exhausted and restart() reshuffles. Alphabetical order walks
    the pool by name and restart() returns to the start.
    """

    def __init__(self, pool, order, seed, rng=None, entries=None):
        if order not in ORDERS:
            raise ValueError("Unknown question order: %r" % (order,))
        self.pool = tuple(pool)
        self.order = order
        self.seed = seed
        self.position = 0
        self.entries = list(entries) if entries is not None else ordered(self.pool, order, rng or seeded(seed))

    @property
    def total(self):
        return len(self.entries)

    @property
    def remaining(self):
        return self.total - self.position

    @property
    def exhausted(self):
        return self.position >= self.total

    def take(self, count=QUESTIONS):
        """Advance past the next `count` entries (fewer at the end) and return them."""
        taken = self.entries[self.position:self.position + count]
        self.position += len(taken)
        return taken

    def restart(self, seed=None, rng=None):
        """Begin a new pass: a reshuffle for random order, the start for alphabetical."""
        if self.order == RANDOM:
            self.seed = new_seed(rng or random) if seed is None else seed
            self.entries = ordered(self.pool, self.order, rng or seeded(self.seed))
        self.position = 0

    def to_state(self):
        """Progress as plain data: the exact question order by id, and how far along it is."""
        return {"order": self.order, "seed": self.seed, "position": self.position,
                "ids": [entry["id"] for entry in self.entries]}

    @classmethod
    def from_state(cls, pool, data, rng=None):
        """Rebuild a sequence from saved progress; None if it does not fit the pool.

        The saved ids must be exactly the pool's ids, so a catalog whose entries
        were re-ordered, added or removed starts a fresh pass instead of
        silently repeating or skipping places.
        """
        if not isinstance(data, dict) or data.get("order") not in ORDERS:
            return None
        seed, position, ids = data.get("seed"), data.get("position"), data.get("ids")
        for value in (seed, position):
            if isinstance(value, bool) or not isinstance(value, int):
                return None
        if not isinstance(ids, (list, tuple)) or len(ids) != len(pool):
            return None
        by_id = {}
        for entry in pool:
            by_id[entry["id"]] = entry
        if len(by_id) != len(pool) or len(set(ids)) != len(ids):
            return None
        entries = []
        for ident in ids:
            if ident not in by_id:
                return None
            entries.append(by_id[ident])
        if data["order"] == ALPHABETICAL and [entry["id"] for entry in ordered(pool, ALPHABETICAL)] != list(ids):
            return None
        if not 0 <= position <= len(entries):
            return None
        sequence = cls(pool, data["order"], seed, rng, entries)
        sequence.position = position
        return sequence


def make_choices(record, pool, bank, rng=random):
    """The correct capital plus distinct distractors, in random order.

    Distractors come from the selected pool first, then from the whole scope
    bank when the pool has fewer than four distinct capitals. Labels that read
    the same as the correct one or as each other (case and spacing aside) are
    never used, so exactly one choice is right. Each label is normalised once
    and tracked in a set, so the cost grows with the pool, not its square.
    """
    correct = record["capital"]
    seen = {label_key(correct)}
    labels = []
    for source in (pool, bank):
        needed = CHOICES - 1 - len(labels)
        if needed <= 0:
            break
        candidates = []
        for other in source:
            key = label_key(other["capital"])
            if key not in seen:
                seen.add(key)
                candidates.append(other["capital"])
        labels.extend(shuffled(candidates, rng)[:needed])
    return shuffled([correct] + labels, rng)


class Round:
    """Up to five questions taken from a sequence, with answers and review."""

    def __init__(self, questions, choices):
        if not questions:
            raise ValueError("A round needs at least one question.")
        self.questions = list(questions)
        self.choices = list(choices)
        self.answers = []
        self.index = 0
        self.phase = ANSWERING

    def current(self):
        return self.questions[self.index]

    def current_choices(self):
        return self.choices[self.index]

    def submit(self, choice):
        """Lock in a choice index for the current question and return whether it was right."""
        if self.phase != ANSWERING:
            raise ValueError("This question has already been answered.")
        options = self.current_choices()
        if not 0 <= choice < len(options):
            raise ValueError("Choose one of the listed capitals.")
        self.answers.append(options[choice])
        self.phase = FEEDBACK
        return self.correct(self.index)

    def advance(self):
        if self.phase != FEEDBACK:
            raise ValueError("Answer the question before continuing.")
        if self.index == len(self.questions) - 1:
            self.phase = COMPLETE
        else:
            self.index += 1
            self.phase = ANSWERING

    def correct(self, index):
        return index < len(self.answers) and self.answers[index] == self.questions[index]["capital"]

    def score(self):
        return sum(1 for index in range(len(self.answers)) if self.correct(index))

    def is_last(self):
        return self.index == len(self.questions) - 1

    def missed(self):
        """(record, chosen label) for each wrong answer, for the review screen."""
        return [(self.questions[index], self.answers[index])
                for index in range(len(self.answers)) if not self.correct(index)]


def start_round(sequence, bank, rng=random, count=QUESTIONS):
    """Take the next round from the sequence, or None when it is exhausted."""
    questions = sequence.take(count)
    if not questions:
        return None
    return Round(questions, [make_choices(record, sequence.pool, bank, rng) for record in questions])


def check_bank(pool, kinds=KINDS):
    """Return a list of problems with a catalog pool; empty when it is usable."""
    problems = []
    ids = set()
    for position, record in enumerate(pool):
        where = "entry %d" % position
        if not isinstance(record, dict):
            problems.append(where + " is not a dict")
            continue
        missing = [field for field in REQUIRED_FIELDS if field not in record]
        if missing:
            problems.append("%s is missing %s" % (where, ", ".join(missing)))
            continue
        where = str(record["id"])
        if record["id"] in ids:
            problems.append(where + " has a duplicate id")
        ids.add(record["id"])
        for field in ("id", "name", "capital", "region", "question"):
            if not isinstance(record[field], str) or not record[field].strip():
                problems.append("%s has an empty %s" % (where, field))
        for field in ("lat", "lon"):
            if not isinstance(record[field], (int, float)):
                problems.append("%s has a non-numeric %s" % (where, field))
        if record["kind"] not in kinds:
            problems.append("%s has an unknown kind %r" % (where, record["kind"]))
        if record["lat"] is not None and isinstance(record["lat"], (int, float)) and not -90 <= record["lat"] <= 90:
            problems.append(where + " has a latitude outside -90..90")
        if record["lon"] is not None and isinstance(record["lon"], (int, float)) and not -180 <= record["lon"] <= 180:
            problems.append(where + " has a longitude outside -180..180")
    return problems
