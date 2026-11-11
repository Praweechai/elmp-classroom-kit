"""elmp_video (V-3.02): data rules, server-side watch counting, no skipping ahead, resume, completion at 95 %."""
import json

import pytest

from elmp_xblocks import watching
from elmp_xblocks.watching import VideoError

pytest.importorskip("xblock")
from elmp_xblocks.video import ElmpVideoBlock  # noqa: E402
from tests.helpers import call, load, make  # noqa: E402

VIDEO = load("video-1-2.json")  # 45 s, complete at 95 % = 42.75 s


def clean(**over):
    return watching.clean_video({**VIDEO, **over})


# ---------- data ----------

def test_example_is_clean_with_defaults():
    v = watching.clean_video({k: VIDEO[k] for k in ("src", "seconds", "captions")})
    assert (v["complete_pct"], v["allow_skip"], v["chapters"], v["poster"]) == (95, False, [], None)


@pytest.mark.parametrize("over", [
    {"src": "http://evil.example/x.mp4"}, {"src": "/static/x.avi"}, {"poster": "/static/x.gif"},
    {"seconds": 0}, {"seconds": 7201}, {"seconds": "45"}, {"captions": []},
    {"captions": [{"lang": "fr", "src": "/static/a.vtt"}]}, {"captions": [{"lang": "en", "src": "/static/a.srt"}]},
    {"captions": [{"lang": "en", "src": "/static/a.vtt"}, {"lang": "en", "src": "/static/b.vtt"}]},
    {"chapters": [{"at": 10, "title": "b"}, {"at": 5, "title": "a"}]}, {"chapters": [{"at": 45, "title": "x"}]},
    {"complete_pct": 40}, {"allow_skip": "no"}, {"extra": 1}, {"transcript": ""},
])
def test_broken_video_rejected(over):
    with pytest.raises(VideoError):
        clean(**over)


def test_schema_agrees():
    pytest.importorskip("jsonschema")
    from tests.test_schemas import validator  # noqa: PLC0415

    check = validator("elmp_video")
    for over in ({"src": "/static/x.avi"}, {"seconds": 0}, {"captions": []}, {"complete_pct": 40}, {"extra": 1}):
        assert list(check.iter_errors({**VIDEO, **over}))
    # chapter order is a Python-only rule (the schema cannot compare items)
    assert not list(check.iter_errors({**VIDEO, "chapters": [{"at": 10, "title": "b"}, {"at": 5, "title": "a"}]}))


def test_public_video_picks_language():
    v = clean(chapters=[{"at": 0, "title": {"en": "Start", "th": "เริ่ม"}}], transcript={"en": "Hi", "th": "สวัสดี"})
    th = watching.public_video(v, "th")
    assert th["chapters"] == [{"at": 0, "title": "เริ่ม"}] and th["transcript"] == "สวัสดี"
    assert th["completePct"] == 95 and th["allowSkip"] is False and 2 in th["speeds"]


# ---------- counting ----------

def test_merge_and_furthest():
    assert watching.merge([[10, 20], [0, 10.2], [30, 40]]) == [[0, 20], [30, 40]]
    assert watching.watched_seconds([[0, 20], [30, 40]]) == 30
    assert watching.furthest([[0, 20], [30, 40]]) == 20 and watching.furthest([[30, 40]]) == 0


def test_no_skipping_ahead_unless_allowed():
    v = clean()
    have = watching.add_report(v, [], [[0, 10]], None)
    with pytest.raises(VideoError, match="skipped"):
        watching.add_report(v, have, [[30, 40]], 30)
    assert watching.add_report(clean(allow_skip=True), have, [[30, 40]], 30) == [[0, 10], [30, 40]]
    assert watching.add_report(v, have, [[5, 25]], 30) == [[0, 25]]  # rewatching + going on is fine


def test_clock_limits_played_time():
    v = clean()
    with pytest.raises(VideoError, match="clock"):
        watching.add_report(v, [], [[0, 45]], None)  # first report: at most 20 s x 2 + 3
    with pytest.raises(VideoError, match="clock"):
        watching.add_report(v, [[0, 10]], [[10, 40]], 5)  # 30 s in 5 s wall time
    assert watching.add_report(v, [[0, 10]], [[10, 30]], 10) == [[0, 30]]  # 2x speed is fine
    assert watching.add_report(v, [[0, 30]], [[0, 30]], 0) == [[0, 30]]  # rewatch gains nothing: always fine


def test_bad_segments_rejected_and_clipped():
    v = clean()
    for bad in ("x", [[0]], [["0", 5]], [[True, 5]], [[0, 1]] * 51):
        with pytest.raises(VideoError):
            watching.add_report(v, [], bad, 10)
    assert watching.add_report(v, [[0, 40]], [[40, 99]], 10) == [[0, 45]]  # clipped to the length
    assert watching.add_report(v, [], [[3, 3.01]], 10) == []


def test_complete_at_95_percent():
    v = clean()
    assert not watching.is_complete(v, [[0, 42]])
    assert watching.is_complete(v, [[0, 42.3]])  # 42.75 - 0.5 s rounding
    assert watching.is_complete(clean(complete_pct=100), [[0, 44.6]])


# ---------- block ----------

class Clock:
    def __init__(self):
        self.now = 1000.0

    def __call__(self):
        return self.now


def video_block(config=None):
    block = make(ElmpVideoBlock, "elmp_video", config or VIDEO)
    block.clock = Clock()
    return block


def test_block_watch_through_resume_and_complete_once():
    block = video_block()
    cfg = block.student_view().json_init_args
    assert cfg["block"] == "video" and cfg["position"] == 0 and not cfg["complete"]
    assert cfg["captions"][0]["src"].endswith(".vtt") and len(cfg["chapters"]) == 3

    t = 0
    for _ in range(4):  # 4 reports of ~10 s each at 1x
        block.clock.now += 10
        res = call(block, "progress", {"segments": [[t, t + 10]], "position": t + 10})
        t += 10
        assert res["ok"]
    assert res["position"] == 40 and res["percent"] == 89 and not res["complete"]
    assert block.runtime.events == []

    block.clock.now += 5
    res = call(block, "progress", {"segments": [[40, 45]], "position": 45})
    assert res["complete"] and res["percent"] == 100
    block.clock.now += 5
    call(block, "progress", {"segments": [[0, 5]], "position": 5})
    assert block.runtime.events == [("completion", {"completion": 1.0})]
    assert block.student_view().json_init_args["position"] == 5  # resume where they left off


def test_block_refuses_fake_reports_and_keeps_nothing():
    block = video_block()
    block.clock.now += 1
    res = call(block, "progress", {"segments": [[0, 45]], "position": 45})
    assert res == {"ok": False, "reason": "bad_report", "message": "more played than the clock allows"}
    assert block.stretches == [] and block.position == 0 and block.runtime.events == []
    block.clock.now += 10
    assert call(block, "progress", {"segments": [[30, 40]], "position": 40})["reason"] == "bad_report"


def test_block_resume_point_cannot_jump_ahead():
    block = video_block()
    block.clock.now += 10
    assert call(block, "progress", {"segments": [[0, 10]], "position": 44})["position"] == 10
    allow = video_block({**VIDEO, "allow_skip": True})
    allow.clock.now += 10
    assert call(allow, "progress", {"segments": [[0, 10]], "position": 44})["position"] == 44


def test_block_author_mistake():
    block = video_block({**VIDEO, "src": "x.mp4"})
    assert "src" in block.student_view().json_init_args["error"]
    assert call(block, "progress", {"segments": []})["reason"] == "bad_report"


def test_workbench_scenario():
    (_, xml), = ElmpVideoBlock.workbench_scenarios()
    assert watching.clean_video(json.loads(xml.split("'")[1]))["seconds"] == 45
