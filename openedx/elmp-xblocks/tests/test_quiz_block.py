"""elmp_quiz block (V-3.01): modes, attempts, best score, only_if_higher, completion, no answers in the page."""
import json
import pathlib

import pytest

pytest.importorskip("xblock")
from webob import Request
from xblock.field_data import DictFieldData
from xblock.fields import ScopeIds
from xblock.test.toy_runtime import ToyRuntime

from elmp_xblocks.quiz import ElmpQuizBlock

EXAMPLES = pathlib.Path(__file__).resolve().parent.parent / "schemas" / "examples" / "inf101"


def load(name):
    return json.loads((EXAMPLES / name).read_text(encoding="utf-8"))


class Runtime(ToyRuntime):
    def __init__(self):
        super().__init__(user_id="nok")
        self.events = []

    def publish(self, block, event_type, event_data):
        self.events.append((event_type, event_data))


def make(config, user="nok"):
    runtime = Runtime()
    ids = ScopeIds(user, "elmp_quiz", "def-1", "block-v1:ELMP+INF101+2026+type@elmp_quiz+block@final")
    return runtime.construct_xblock_from_class(ElmpQuizBlock, ids, DictFieldData({"config": config}))


def call(block, handler, body):
    res = getattr(block, handler)(Request.blank("/", method="POST", body=json.dumps(body).encode()))
    return json.loads(res.body)


def right_answers(config):
    return {q["id"]: q["answer"] for q in config["questions"]}


def page_config(block):
    frag = block.student_view()
    return frag, frag.json_init_args


# ---------- page ----------

def test_page_has_questions_but_no_answers():
    config = load("quiz-exam-final.json")
    frag, cfg = page_config(make(config))
    assert frag.js_init_fn == "ElmpBlock" and 'data-elmp-block="quiz"' in frag.body_html()
    blob = json.dumps(cfg, ensure_ascii=False)
    assert '"answer"' not in blob and '"explain"' not in blob
    for q in config["questions"]:
        assert q["explain"] not in blob
    assert cfg["mode"] == "exam" and cfg["possible"] == len(config["questions"])
    assert (cfg["attempts"], cfg["attemptsLeft"], cfg["passPct"], cfg["best"]) == (0, 3, 80, None)


def test_author_mistake_shows_a_message_not_a_crash():
    block = make({"mode": "exam", "questions": []})
    _, cfg = page_config(block)
    assert "1 to 50 questions" in cfg["error"]
    assert block.max_score() is None
    assert call(block, "submit", {"answers": {}})["reason"] == "bad_request"


def test_scoring_attributes_follow_the_mode():
    exam = make(load("quiz-exam-final.json"))
    check = make(load("quiz-check-1-3.json"))
    assert exam.has_score and exam.max_score() == len(load("quiz-exam-final.json")["questions"])
    assert not check.has_score and check.max_score() is None
    assert (exam.icon_class, check.icon_class) == ("problem", "other")
    assert make({**load("quiz-exam-final.json"), "weight": 10}).weight == 10


# ---------- exam ----------

def test_exam_must_be_answered_in_full():
    config = load("quiz-exam-final.json")
    block = make(config)
    first = config["questions"][0]
    res = call(block, "submit", {"answers": {first["id"]: first["answer"]}})
    assert res["reason"] == "answer_all" and first["id"] not in res["missing"]
    assert block.attempts == 0 and block.runtime.events == []


def test_exam_attempts_best_score_only_if_higher_and_completion():
    config = load("quiz-exam-final.json")
    block = make(config)
    n = len(config["questions"])
    right = right_answers(config)
    wrong_one = dict(right)
    q0 = config["questions"][0]
    wrong_one[q0["id"]] = [next(c["id"] for c in q0["choices"] if c["id"] not in q0["answer"])]

    res = call(block, "submit", {"answers": wrong_one})
    assert res["ok"] and res["last"]["earned"] == n - 1 and res["attemptsLeft"] == 2
    assert res["last"]["review"][q0["id"]] == {"correct": False, "explain": q0["explain"]}
    assert "answer" not in json.dumps(res["last"]["review"])
    assert block.runtime.events == [
        ("grade", {"value": n - 1, "max_value": n, "only_if_higher": True}),
        ("completion", {"completion": 1.0}),
    ]

    res = call(block, "submit", {"answers": right})
    assert res["best"] == {"earned": n, "percent": 100, "passed": True}

    res = call(block, "submit", {"answers": wrong_one})  # worse third try keeps the best
    assert res["last"]["earned"] == n - 1 and res["best"]["earned"] == n and res["attemptsLeft"] == 0
    grades = [e for e in block.runtime.events if e[0] == "grade"]
    assert len(grades) == 3 and all(g[1]["only_if_higher"] for g in grades)
    assert [e[0] for e in block.runtime.events].count("completion") == 1

    res = call(block, "submit", {"answers": right})  # no attempts left: refused on the server
    assert res["reason"] == "no_attempts_left" and block.attempts == 3


def test_new_order_per_attempt_and_same_order_on_reload():
    config = load("quiz-exam-final.json")
    assert config["shuffle"]
    block = make(config)
    order = [q["id"] for q in page_config(block)[1]["questions"]]
    assert order == [q["id"] for q in page_config(block)[1]["questions"]]
    seen = {tuple(order)}
    for _ in range(3):
        call(block, "submit", {"answers": right_answers(config)})
        seen.add(tuple(q["id"] for q in page_config(block)[1]["questions"]))
    assert len(seen) > 1


def test_exam_handler_refuses_check_and_bad_input():
    block = make(load("quiz-exam-final.json"))
    assert call(block, "check", {"question": "q1", "given": ["a"]})["reason"] == "wrong_mode"
    assert call(block, "submit", {"answers": {"q1": ["zz"]}})["reason"] == "bad_request"
    assert call(block, "submit", ["not", "an", "object"])["reason"] == "bad_request"


# ---------- check ----------

def test_check_mode_instant_feedback_and_completion_once():
    config = load("quiz-check-1-3.json")
    block = make(config)
    q = config["questions"][0]
    wrong = next(c["id"] for c in q["choices"] if c["id"] not in q["answer"])

    res = call(block, "check", {"question": q["id"], "given": [wrong]})
    assert res == {"ok": True, "correct": False, "explain": q.get("explain", ""), "answer": q["answer"]}
    res = call(block, "check", {"question": q["id"], "given": q["answer"]})
    assert res["correct"] is True
    assert block.runtime.events == [("completion", {"completion": 1.0})]  # never a grade

    _, cfg = page_config(block)
    assert cfg["complete"] and cfg["checked"][q["id"]]["given"] == sorted(q["answer"])
    others = [x["id"] for x in config["questions"][1:]]
    assert not set(others) & set(cfg["checked"])  # unchecked questions keep their answer hidden


def test_check_mode_refuses_submit_and_empty_pick():
    config = load("quiz-check-1-3.json")
    block = make(config)
    assert call(block, "submit", {"answers": right_answers(config)})["reason"] == "wrong_mode"
    assert call(block, "check", {"question": config["questions"][0]["id"], "given": []})["reason"] == "bad_request"
    assert block.runtime.events == []


def test_workbench_scenario_parses():
    (_, xml), = ElmpQuizBlock.workbench_scenarios()
    assert xml.startswith("<elmp_quiz config='") and json.loads(xml.split("'")[1])["mode"] == "exam"
