"""
Activity rules for elmp_activity (doc 02 §9, D-87): six kinds, never graded. The data may reach the browser (instant
feedback), but completion is still decided here: finish() checks the "done when" rule of the kind against what the
learner did. Plain Python, easy to test.
"""
from .common import ART, BlockError, is_id, is_int, is_text, only_keys, text

KINDS = ("hotspot", "order", "scenario", "sort", "deck", "practice")
KEYS = {
    "hotspot": {"art", "alt", "spots"},
    "order": {"items"},
    "scenario": {"start", "scenes"},
    "sort": {"bins", "items"},
    "deck": {"cards"},
    "practice": {"seconds", "art", "steps"},
}
SLACK = 1.5  # seconds of timer tolerance for practice


class ActivityError(BlockError):
    pass


def _need(cond, message):
    if not cond:
        raise ActivityError(message)


def _texts(values, low, high, what):
    _need(isinstance(values, list) and low <= len(values) <= high, f"{what}: {low} to {high} needed")
    _need(all(is_text(v) for v in values), f"{what}: every entry must be text")


def _art(value, what="art"):
    _need(isinstance(value, str) and bool(ART.match(value)), f"{what}: a drawing name or a /static/ picture")


# ---------- checking the author's data ----------

def _hotspot(a):
    _art(a.get("art"))
    _need(is_text(a.get("alt")), "alt text is required (screen readers)")
    spots = a.get("spots")
    _need(isinstance(spots, list) and 2 <= len(spots) <= 12, "spots: 2 to 12 needed")
    ns = []
    for s in spots:
        _need(isinstance(s, dict) and set(s) == {"n", "x", "y", "title", "text"}, "each spot has n, x, y, title, text")
        _need(is_int(s["n"], 1, 99), "spot n must be a number from 1")
        for k in ("x", "y"):
            _need(isinstance(s[k], (int, float)) and not isinstance(s[k], bool) and 0 <= s[k] <= 100, "x/y are 0–100 %")
        _need(is_text(s["title"]) and is_text(s["text"]), "spot title and text are required")
        ns.append(s["n"])
    _need(len(set(ns)) == len(ns), "spot numbers must be different")


def _scenario(a):
    scenes = a.get("scenes")
    _need(isinstance(scenes, dict) and len(scenes) >= 2, "scenes: at least 2")
    _need(is_id(a.get("start")) and a["start"] in scenes, "start must name a scene")
    for sid, sc in scenes.items():
        _need(is_id(sid), f"scene id {sid!r}: lower-case letters, digits, - or _")
        _need(isinstance(sc, dict) and set(sc) <= {"art", "text", "end", "choices"}, f"{sid}: unknown field")
        _need(is_text(sc.get("text")), f"{sid}: text is required")
        if "art" in sc:
            _art(sc["art"], f"{sid} art")
        _need(isinstance(sc.get("end", False), bool), f"{sid}: end is true or false")
        choices = sc.get("choices", [])
        _need(isinstance(choices, list) and len(choices) <= 4, f"{sid}: at most 4 choices")
        if sc.get("end"):
            _need(not choices, f"{sid}: an end scene has no choices")
        else:
            _need(choices, f"{sid}: needs choices (or end: true)")
        for c in choices:
            _need(isinstance(c, dict) and set(c) <= {"text", "next", "good", "feedback"}, f"{sid}: unknown choice field")
            _need(is_text(c.get("text")), f"{sid}: choice text is required")
            _need(c.get("next") in scenes, f"{sid}: choice leads to a missing scene {c.get('next')!r}")
            _need(c.get("good", None) in (True, False, None), f"{sid}: good is true, false or empty")
            if "feedback" in c:
                _need(is_text(c["feedback"]), f"{sid}: feedback must be text")
    # every learner can finish: an end scene is reachable from the start
    seen, todo = set(), [a["start"]]
    while todo:
        sid = todo.pop()
        if sid not in seen:
            seen.add(sid)
            todo.extend(c["next"] for c in scenes[sid].get("choices", []))
    _need(any(scenes[s].get("end") for s in seen), "no end scene can be reached from the start")


def _sort(a):
    _texts(a.get("bins"), 2, 4, "bins")
    items = a.get("items")
    _need(isinstance(items, list) and 2 <= len(items) <= 16, "items: 2 to 16 needed")
    for it in items:
        _need(isinstance(it, dict) and set(it) <= {"text", "bin", "why"}, "each item has text, bin, why")
        _need(is_text(it.get("text")), "item text is required")
        _need(is_int(it.get("bin"), 0, len(a["bins"]) - 1), "item bin must name one of the bins")
        if "why" in it:
            _need(is_text(it["why"]), "why must be text")


def _deck(a):
    cards = a.get("cards")
    _need(isinstance(cards, list) and 2 <= len(cards) <= 30, "cards: 2 to 30 needed")
    for c in cards:
        _need(isinstance(c, dict) and set(c) == {"front", "back"}, "each card has front and back")
        _need(is_text(c["front"]) and is_text(c["back"]), "card front and back must be text")


def _practice(a):
    a.setdefault("seconds", 20)
    _need(is_int(a["seconds"], 5, 300), "seconds must be 5 to 300")
    if "art" in a:
        _art(a["art"])
    _texts(a.get("steps"), 1, 12, "steps")


CHECK = {"hotspot": _hotspot, "order": lambda a: _texts(a.get("items"), 3, 8, "items"), "scenario": _scenario,
         "sort": _sort, "deck": _deck, "practice": _practice}


def clean_activity(data):
    """Check like schemas/elmp_activity.schema.json (+ rules a schema cannot say). Returns a new dict."""
    _need(isinstance(data, dict), "the activity must be an object")
    kind = data.get("kind")
    _need(kind in KINDS, f"kind must be one of {', '.join(KINDS)}")
    try:
        only_keys(data, KEYS[kind] | {"kind", "title"}, kind)
    except BlockError as err:
        raise ActivityError(str(err)) from err
    if "title" in data:
        _need(is_text(data["title"]), "title must be text")
    act = dict(data)
    CHECK[kind](act)
    return act


# ---------- what the page gets (text in the learner's language) ----------

def public_activity(a, lang="en"):
    t = lambda v: text(v, lang)  # noqa: E731
    kind = a["kind"]
    if kind == "hotspot":
        body = {"art": a["art"], "alt": t(a["alt"]),
                "spots": [{"n": s["n"], "x": s["x"], "y": s["y"], "title": t(s["title"]), "text": t(s["text"])}
                          for s in a["spots"]]}
    elif kind == "order":
        body = {"items": [t(i) for i in a["items"]]}  # correct order; the page shuffles
    elif kind == "scenario":
        body = {"start": a["start"], "scenes": {
            sid: {"art": sc.get("art"), "text": t(sc["text"]), "end": bool(sc.get("end")),
                  "choices": [{"text": t(c["text"]), "next": c["next"], "good": c.get("good"),
                               "feedback": t(c.get("feedback"))} for c in sc.get("choices", [])]}
            for sid, sc in a["scenes"].items()}}
    elif kind == "sort":
        body = {"bins": [t(b) for b in a["bins"]],
                "items": [{"text": t(i["text"]), "bin": i["bin"], "why": t(i.get("why"))} for i in a["items"]]}
    elif kind == "deck":
        body = {"cards": [{"front": t(c["front"]), "back": t(c["back"])} for c in a["cards"]]}
    else:
        body = {"seconds": a["seconds"], "art": a.get("art"), "steps": [t(s) for s in a["steps"]]}
    return {"kind": kind, **body}


# ---------- done when ----------

def _ints(value, what):
    _need(isinstance(value, list) and all(is_int(v, 0, 10_000) for v in value), f"{what} must be a list of numbers")
    return value


def finish(a, data, started_seconds_ago=None):
    """
    Check the learner's evidence against the kind's "done when" rule.
    Returns a small result ({"score": .., "of": ..} for sort) or raises ActivityError (not done yet / not believable).
    """
    _need(isinstance(data, dict), "send an object")
    kind = a["kind"]
    if kind == "hotspot":
        opened = set(_ints(data.get("opened"), "opened"))
        _need(opened >= {s["n"] for s in a["spots"]}, "open every spot first")
        return {}
    if kind == "order":
        order = _ints(data.get("order"), "order")
        _need(order == list(range(len(a["items"]))), "the order is not right yet")
        return {}
    if kind == "scenario":
        path = data.get("path")
        _need(isinstance(path, list) and path and all(isinstance(p, str) for p in path) and len(path) <= 100,
              "path must list the scenes visited")
        _need(path[0] == a["start"], "the path must begin at the start")
        scenes = a["scenes"]
        for here, there in zip(path, path[1:]):
            _need(here in scenes and any(c["next"] == there for c in scenes[here].get("choices", [])),
                  "the path does not follow the choices")
        _need(scenes.get(path[-1], {}).get("end"), "an end scene has not been reached")
        return {}
    if kind == "sort":
        placed = _ints(data.get("placed"), "placed")
        _need(len(placed) == len(a["items"]), "place every card first")
        _need(all(p < len(a["bins"]) for p in placed), "unknown bin")
        return {"score": sum(1 for p, it in zip(placed, a["items"]) if p == it["bin"]), "of": len(a["items"])}
    if kind == "deck":
        known = set(_ints(data.get("known"), "known"))
        _need(known >= set(range(len(a["cards"]))), "every card needs 'Got it' once")
        return {}
    # practice: the server saw the start; the timer must really have run
    _need(started_seconds_ago is not None, "start the timer first")
    _need(started_seconds_ago + SLACK >= a["seconds"], "the timer has not finished")
    return {}
