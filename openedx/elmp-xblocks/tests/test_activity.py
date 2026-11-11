"""elmp_activity (V-3.03): six kinds, author checks, "done when" rules checked on the server, completion once."""
import copy

import pytest

from elmp_xblocks import activities
from elmp_xblocks.activities import ActivityError

pytest.importorskip("xblock")
from elmp_xblocks.activity import ElmpActivityBlock  # noqa: E402
from tests.helpers import EXAMPLES, call, load, make  # noqa: E402

FILES = {p.name.split("-")[1]: p.name for p in EXAMPLES.glob("activity-*.json")}


def ex(kind):
    return load(FILES[kind])


@pytest.mark.parametrize("kind", activities.KINDS)
def test_every_kind_has_a_clean_example(kind):
    assert activities.clean_activity(ex(kind))["kind"] == kind


BROKEN = [
    ("hotspot", lambda a: a.update(art="Zone!")),
    ("hotspot", lambda a: a.pop("alt")),
    ("hotspot", lambda a: a["spots"][1].update(n=a["spots"][0]["n"])),
    ("hotspot", lambda a: a["spots"][0].update(x=120)),
    ("order", lambda a: a.update(items=a["items"][:2])),
    ("scenario", lambda a: a.update(start="nope")),
    ("scenario", lambda a: next(iter(a["scenes"].values()))["choices"][0].update(next="missing")),
    ("scenario", lambda a: [sc.update(end=False, choices=sc.get("choices") or [{"text": "x", "next": a["start"]}])
                            for sc in a["scenes"].values()]),  # no end reachable
    ("sort", lambda a: a["items"][0].update(bin=3)),
    ("sort", lambda a: a.update(bins=["only one"])),
    ("deck", lambda a: a["cards"][0].pop("back")),
    ("practice", lambda a: a.update(seconds=2)),
    ("practice", lambda a: a.update(steps=[])),
    ("order", lambda a: a.update(spots=[])),  # field of another kind
    ("order", lambda a: a.update(kind="flip")),  # flip cards stay a content-kit pattern (D-85)
]


@pytest.mark.parametrize("kind,change", BROKEN, ids=[f"{k}-{i}" for i, (k, _) in enumerate(BROKEN)])
def test_broken_activity_rejected(kind, change):
    a = copy.deepcopy(ex(kind))
    change(a)
    with pytest.raises(ActivityError):
        activities.clean_activity(a)


def test_end_scene_with_choices_rejected():
    a = ex("scenario")
    end = next(sid for sid, sc in a["scenes"].items() if sc.get("end"))
    a["scenes"][end]["choices"] = [{"text": "again", "next": a["start"]}]
    with pytest.raises(ActivityError, match="end scene"):
        activities.clean_activity(a)


def test_public_activity_language_and_shape():
    a = activities.clean_activity({"kind": "deck", "cards": [{"front": {"en": "Rub", "th": "ถู"}, "back": "x"},
                                                             {"front": "B", "back": "y"}]})
    assert activities.public_activity(a, "th")["cards"][0] == {"front": "ถู", "back": "x"}
    sc = activities.public_activity(activities.clean_activity(ex("scenario")))
    assert sc["start"] in sc["scenes"] and all("end" in s for s in sc["scenes"].values())


# ---------- done when ----------

def test_hotspot_all_spots():
    a = activities.clean_activity(ex("hotspot"))
    ns = [s["n"] for s in a["spots"]]
    with pytest.raises(ActivityError):
        activities.finish(a, {"opened": ns[:-1]})
    assert activities.finish(a, {"opened": ns}) == {}


def test_order_must_be_right():
    a = activities.clean_activity(ex("order"))
    n = len(a["items"])
    with pytest.raises(ActivityError):
        activities.finish(a, {"order": list(reversed(range(n)))})
    assert activities.finish(a, {"order": list(range(n))}) == {}


def _good_path(a):
    path, here = [a["start"]], a["start"]
    while not a["scenes"][here].get("end"):
        choices = a["scenes"][here]["choices"]
        here = next((c["next"] for c in choices if c.get("good")), choices[0]["next"])
        path.append(here)
    return path


def test_scenario_real_path_to_an_end():
    a = activities.clean_activity(ex("scenario"))
    path = _good_path(a)
    assert activities.finish(a, {"path": path}) == {}
    with pytest.raises(ActivityError):
        activities.finish(a, {"path": path[:-1]})  # not at an end yet
    with pytest.raises(ActivityError):
        activities.finish(a, {"path": [a["start"], path[-1]]} if len(path) > 2 else {"path": [path[-1]]})
    with pytest.raises(ActivityError):
        activities.finish(a, {"path": "s1"})


def test_sort_all_placed_and_score():
    a = activities.clean_activity(ex("sort"))
    right = [i["bin"] for i in a["items"]]
    assert activities.finish(a, {"placed": right}) == {"score": len(right), "of": len(right)}
    wrong = [1 - b for b in right]
    assert activities.finish(a, {"placed": wrong})["score"] == 0
    with pytest.raises(ActivityError):
        activities.finish(a, {"placed": right[:-1]})
    with pytest.raises(ActivityError):
        activities.finish(a, {"placed": [9] * len(right)})


def test_deck_every_card_got_it():
    a = activities.clean_activity(ex("deck"))
    n = len(a["cards"])
    with pytest.raises(ActivityError):
        activities.finish(a, {"known": list(range(n - 1))})
    assert activities.finish(a, {"known": list(range(n))}) == {}


def test_practice_timer_must_run():
    a = activities.clean_activity(ex("practice"))
    with pytest.raises(ActivityError, match="start"):
        activities.finish(a, {}, None)
    with pytest.raises(ActivityError, match="not finished"):
        activities.finish(a, {}, a["seconds"] - 5)
    assert activities.finish(a, {}, a["seconds"] - 1) == {}


# ---------- block ----------

class Clock:
    now = 500.0

    def __call__(self):
        return self.now


def block_for(kind_or_config):
    config = ex(kind_or_config) if isinstance(kind_or_config, str) else kind_or_config
    block = make(ElmpActivityBlock, "elmp_activity", config)
    block.clock = Clock()
    return block


def test_block_page_and_complete_once():
    block = block_for("order")
    frag = block.student_view()
    assert 'class="elmp-block elmp-activity elmp-order"' in frag.body_html()
    cfg = frag.json_init_args
    assert cfg["kind"] == "order" and not cfg["complete"]
    n = len(cfg["items"])
    assert call(block, "finish", {"order": [1, 0] + list(range(2, n))})["reason"] == "not_done"
    assert block.runtime.events == []
    assert call(block, "finish", {"order": list(range(n))}) == {"ok": True, "complete": True}
    call(block, "finish", {"order": list(range(n))})
    assert block.runtime.events == [("completion", {"completion": 1.0})]
    assert block.student_view().json_init_args["complete"] is True


def test_block_practice_uses_server_clock():
    block = block_for("practice")
    assert call(block, "finish", {})["reason"] == "not_done"
    call(block, "start", {})
    block.clock.now += 5
    assert call(block, "finish", {})["reason"] == "not_done"
    block.clock.now += 20
    assert call(block, "finish", {})["ok"]


def test_block_sort_keeps_result():
    block = block_for("sort")
    right = [i["bin"] for i in ex("sort")["items"]]
    res = call(block, "finish", {"placed": right})
    assert res["score"] == len(right)
    assert block.student_view().json_init_args["result"] == {"score": len(right), "of": len(right)}


def test_block_author_mistake():
    block = block_for({"kind": "flip"})
    assert "kind must be one of" in block.student_view().json_init_args["error"]
    assert call(block, "finish", {})["reason"] == "not_done"
