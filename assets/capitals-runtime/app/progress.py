"""Saved settings, scores and quiz progress for Capitals, free of badge APIs.

The saved dict keeps the original {"best", "played"} keys from the first
version of the app and adds per-scope settings and progress. migrate() accepts
anything the badge might hand back (missing keys, wrong types, an older
layout) and never discards a valid best score or play count.
"""

import quiz

SCOPES = ("world", "us")
ALL = "all"
US_KIND_FILTERS = ("states", "territories", "district")
KIND_FOR_FILTER = {"states": "state", "territories": "territory", "district": "district"}
PROGRESS_FIELDS = ("filter", "order", "seed", "position", "ids", "pass_correct", "pass_asked", "data")


def default_settings():
    return {"order": quiz.RANDOM, "filter": ALL}


def default_state():
    return {"best": 0, "played": 0,
            "settings": {scope: default_settings() for scope in SCOPES},
            "progress": {}}


def filters_for(scope, banks):
    """The filter values a scope offers: all, then kinds (US), then regions."""
    if scope == "us":
        return [ALL] + list(US_KIND_FILTERS) + quiz.regions(banks["states"])
    return [ALL] + quiz.regions(banks["world"])


def filter_label(scope, value):
    if value == ALL:
        return "All countries" if scope == "world" else "All 56"
    if value in US_KIND_FILTERS:
        return value[0].upper() + value[1:]
    return value


def pool_for(scope, value, banks):
    """The records a scope and filter select; empty when the filter is unknown."""
    bank = banks["world"] if scope == "world" else banks["us"]
    if value == ALL:
        return tuple(bank)
    if scope == "us" and value in US_KIND_FILTERS:
        return quiz.by_kind(bank, KIND_FOR_FILTER[value])
    return quiz.by_region(bank, value)


def migrate(raw, banks, data_id=""):
    """Return a complete, valid state built from whatever was saved.

    data_id names the catalog release (schema and date); progress saved
    against a different release is dropped, because its question order may no
    longer match the pool.
    """
    state = default_state()
    if not isinstance(raw, dict):
        return state
    for key, limit in (("best", quiz.QUESTIONS), ("played", 1000000000)):
        value = raw.get(key)
        if isinstance(value, int) and not isinstance(value, bool) and 0 <= value <= limit:
            state[key] = value
    settings = raw.get("settings")
    if isinstance(settings, dict):
        for scope in SCOPES:
            chosen = settings.get(scope)
            if not isinstance(chosen, dict):
                continue
            if chosen.get("order") in quiz.ORDERS:
                state["settings"][scope]["order"] = chosen["order"]
            if chosen.get("filter") in filters_for(scope, banks):
                state["settings"][scope]["filter"] = chosen["filter"]
    progress = raw.get("progress")
    if isinstance(progress, dict):
        for scope in SCOPES:
            entry = progress.get(scope)
            if valid_progress(scope, entry, banks, data_id):
                state["progress"][scope] = {field: entry[field] for field in PROGRESS_FIELDS}
    return state


def valid_progress(scope, entry, banks, data_id=""):
    if not isinstance(entry, dict) or any(field not in entry for field in PROGRESS_FIELDS):
        return False
    if entry["data"] != data_id:
        return False
    if entry["order"] not in quiz.ORDERS or entry["filter"] not in filters_for(scope, banks):
        return False
    for field in ("seed", "position", "pass_correct", "pass_asked"):
        value = entry[field]
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            return False
    ids = entry["ids"]
    if not isinstance(ids, (list, tuple)) or not all(isinstance(ident, str) for ident in ids):
        return False
    size = len(pool_for(scope, entry["filter"], banks))
    return len(ids) == size and entry["position"] <= size and entry["pass_correct"] <= entry["pass_asked"] <= size


def sequence_for(state, scope, banks, data_id="", rng=None):
    """The quiz sequence for a scope's current settings, resumed when progress matches.

    Changing the filter or the order starts a fresh sequence; the pass totals
    restart with it. Saved progress whose question ids no longer match the pool
    is discarded the same way.
    """
    chosen = state["settings"][scope]
    pool = pool_for(scope, chosen["filter"], banks)
    saved = state["progress"].get(scope)
    if saved and saved["filter"] == chosen["filter"] and saved["order"] == chosen["order"] and saved.get("data") == data_id:
        sequence = quiz.Sequence.from_state(pool, saved, rng)
        if sequence is not None:
            return sequence
    sequence = quiz.Sequence(pool, chosen["order"], quiz.new_seed(rng or quiz.random), rng)
    remember(state, scope, sequence, 0, 0, data_id)
    return sequence


def remember(state, scope, sequence, pass_correct, pass_asked, data_id=""):
    chosen = state["settings"][scope]
    saved = sequence.to_state()
    saved.update({"filter": chosen["filter"], "pass_correct": pass_correct, "pass_asked": pass_asked, "data": data_id})
    state["progress"][scope] = saved


def change_setting(state, scope, key, value):
    """Apply a setting; a real change forgets that scope's pass and returns True.

    The other scope's pass, the best score and the play count are untouched.
    """
    chosen = state["settings"][scope]
    if chosen.get(key) == value:
        return False
    chosen[key] = value
    state["progress"].pop(scope, None)
    return True


def pass_totals(state, scope):
    saved = state["progress"].get(scope)
    if not saved:
        return 0, 0
    return saved["pass_correct"], saved["pass_asked"]


def clear_progress(state):
    """Forget quiz passes for both scopes; scores and settings are kept."""
    state["progress"] = {}


def record_round(state, round_):
    """Update best score and play count after a completed round."""
    score = round_.score()
    new_best = score > state["best"]
    state["best"] = max(state["best"], score)
    state["played"] += 1
    return new_best
