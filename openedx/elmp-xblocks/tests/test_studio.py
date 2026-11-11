"""Studio editor (V-3.04, D-95): check + preview + save use the same rules as the learner page."""
import json

import pytest

pytest.importorskip("xblock")
from elmp_xblocks.activity import ElmpActivityBlock
from elmp_xblocks.grading import clean_quiz
from elmp_xblocks.quiz import ElmpQuizBlock
from elmp_xblocks.video import ElmpVideoBlock
from tests.helpers import call, load, make

BLOCKS = [
    (ElmpQuizBlock, "elmp_quiz", "quiz-exam-final.json"),
    (ElmpVideoBlock, "elmp_video", "video-1-2.json"),
    (ElmpActivityBlock, "elmp_activity", "activity-scenario-2-2.json"),
]


@pytest.mark.parametrize("cls,block_type,example", BLOCKS)
def test_editor_page_and_templates_are_valid(cls, block_type, example):
    block = make(cls, block_type, {})
    frag = block.studio_view()
    assert frag.js_init_fn == "ElmpStudio" and 'class="elmp-studio"' in frag.body_html()
    init = frag.json_init_args
    assert init["blockType"] == block_type
    assert json.loads(init["config"]) == cls.STUDIO_TEMPLATE  # empty block starts from the example
    cls.clean(cls.STUDIO_TEMPLATE)
    full = make(cls, block_type, load(example))
    assert json.loads(full.studio_view().json_init_args["config"]) == load(example)


@pytest.mark.parametrize("cls,block_type,example", BLOCKS)
def test_preview_is_a_new_learner_and_marked_preview(cls, block_type, example):
    block = make(cls, block_type, {})
    res = call(block, "studio_preview", {"config": json.dumps(load(example)), "lang": "th"})
    assert res["ok"] and res["preview"]["preview"] is True and res["preview"]["lang"] == "th"
    assert res["preview"]["complete"] is False
    assert block.config == {}  # nothing saved


def test_quiz_preview_has_no_answers():
    res = call(make(ElmpQuizBlock, "elmp_quiz", {}), "studio_preview", {"config": load("quiz-exam-final.json")})
    blob = json.dumps(res)
    assert '"answer"' not in blob and '"explain"' not in blob
    assert res["preview"]["attemptsLeft"] == 3 and res["preview"]["best"] is None


@pytest.mark.parametrize("bad,why", [
    ("{not json", "not valid JSON"),
    (json.dumps({"mode": "exam", "questions": []}), "1 to 50 questions"),
    (json.dumps([1, 2]), "must be an object"),
    ("x" * 200_001, "too long"),
])
def test_bad_json_is_refused_and_not_saved(bad, why):
    block = make(ElmpQuizBlock, "elmp_quiz", {"mode": "check", "questions": []})
    for handler in ("studio_preview", "studio_submit"):
        res = call(block, handler, {"config": bad, "display_name": "New"})
        assert not res["ok"] and why in res["error"]
    assert block.display_name == "Quiz" and block.config == {"mode": "check", "questions": []}


def test_save_keeps_the_author_text_and_name():
    block = make(ElmpQuizBlock, "elmp_quiz", {})
    data = load("quiz-check-1-3.json")
    assert call(block, "studio_submit", {"config": json.dumps(data), "display_name": "  Check 1.3  "}) == {"ok": True}
    assert block.config == data and block.display_name == "Check 1.3"
    clean_quiz(block.config)
    assert call(block, "studio_submit", {"config": data, "display_name": ""}) == {"ok": True}  # object also fine
    assert block.display_name == "Check 1.3"
