"""Quiz rules (V-3.01): grading.py agrees with the schema, keeps answers on the server, grades fairly."""
import copy
import json
import pathlib

import pytest

from elmp_xblocks import grading
from elmp_xblocks.grading import QuizError

EXAMPLES = pathlib.Path(__file__).resolve().parent.parent / "schemas" / "examples" / "inf101"
QUIZ_FILES = sorted(EXAMPLES.glob("quiz-*.json"))


def load(name):
    return json.loads((EXAMPLES / name).read_text(encoding="utf-8"))


def exam(**over):
    quiz = {
        "mode": "exam",
        "pass_pct": 80,
        "questions": [
            {"id": "q1", "prompt": {"en": "Rub for how long?", "th": "ถูนานเท่าไร"},
             "choices": [{"id": "a", "text": "5 s"}, {"id": "b", "text": {"en": "20–30 s", "th": "20–30 วินาที"}}],
             "answer": ["b"], "explain": {"en": "Until dry.", "th": "จนมือแห้ง"}},
            {"id": "q2", "type": "multi", "prompt": "Which are moments?",
             "choices": [{"id": "a", "text": "Before patient"}, {"id": "b", "text": "After lunch"},
                         {"id": "c", "text": "After body fluid"}],
             "answer": ["a", "c"]},
        ],
    }
    quiz.update(over)
    return grading.clean_quiz(quiz)


# ---------- data checks ----------

@pytest.mark.parametrize("path", QUIZ_FILES, ids=lambda p: p.name)
def test_inf101_examples_are_clean(path):
    quiz = grading.clean_quiz(json.loads(path.read_text(encoding="utf-8")))
    assert quiz["mode"] in grading.MODES


def test_defaults_filled_in():
    quiz = grading.clean_quiz({"mode": "check", "questions": exam()["questions"]})
    assert (quiz["max_attempts"], quiz["pass_pct"], quiz["shuffle"], quiz["weight"]) == (3, 80, False, None)
    assert quiz["questions"][0]["type"] == "single"


BROKEN = {
    "not an object": [],
    "no mode": {"questions": []},
    "bad mode": {"mode": "test"},
    "extra field": {"extra": 1},
    "no questions": {"questions": []},
    "too many attempts": {"max_attempts": 11},
    "attempts as text": {"max_attempts": "3"},
    "attempts as bool": {"max_attempts": True},
    "pass 0": {"pass_pct": 0},
    "shuffle as text": {"shuffle": "yes"},
    "negative weight": {"weight": -1},
}


@pytest.mark.parametrize("name", BROKEN)
def test_broken_quiz_rejected(name):
    change = BROKEN[name]
    data = change if not isinstance(change, dict) else {**load("quiz-exam-final.json"), **change}
    if name == "no mode":
        data.pop("mode")
    with pytest.raises(QuizError):
        grading.clean_quiz(data)


def _with_q(**over):
    data = load("quiz-check-1-3.json")
    data["questions"][0].update(over)
    return data


BROKEN_Q = {
    "id with capitals": {"id": "Q1"},
    "type other": {"type": "text"},
    "no prompt": {"prompt": ""},
    "one choice": {"choices": [{"id": "a", "text": "x"}]},
    "repeated choice": {"choices": [{"id": "a", "text": "x"}, {"id": "a", "text": "y"}], "answer": ["a"]},
    "answer not a choice": {"answer": ["zz"]},
    "two answers on single": {"type": "single"},
    "html field": {"html": "<b>x</b>"},
    "text with other language": {"prompt": {"fr": "x"}},
}


@pytest.mark.parametrize("name", BROKEN_Q)
def test_broken_question_rejected(name):
    over = dict(BROKEN_Q[name])
    if name == "two answers on single":
        data = _with_q(type="single")
        q = data["questions"][0]
        q["answer"] = [c["id"] for c in q["choices"][:2]]
    else:
        data = _with_q(**over)
    with pytest.raises(QuizError):
        grading.clean_quiz(data)


def test_repeated_question_ids_rejected():
    data = load("quiz-exam-final.json")
    data["questions"][1]["id"] = data["questions"][0]["id"]
    with pytest.raises(QuizError):
        grading.clean_quiz(data)


# Rules that link two fields; JSON Schema cannot say them, so only the Python rules (block + olxlib) catch them.
PYTHON_ONLY = {"repeated choice", "answer not a choice", "two answers on single"}


def test_python_and_schema_agree_on_broken_inputs():
    """What the schema can express, both reject (Studio and olxlib use the schema, the block uses Python)."""
    pytest.importorskip("jsonschema")
    from tests.test_schemas import validator

    check = validator("elmp_quiz")
    cases = [{**load("quiz-exam-final.json"), **c} for c in BROKEN.values() if isinstance(c, dict)]
    cases += [_with_q(**c) for n, c in BROKEN_Q.items() if n not in PYTHON_ONLY]
    for data in cases:
        with pytest.raises(QuizError):
            grading.clean_quiz(data)
        assert list(check.iter_errors(data)), data
    for name in PYTHON_ONLY - {"two answers on single"}:
        assert not list(check.iter_errors(_with_q(**BROKEN_Q[name])))  # schema lets it through …
        with pytest.raises(QuizError):  # … the block does not
            grading.clean_quiz(_with_q(**BROKEN_Q[name]))


# ---------- answers never reach the browser ----------

def test_public_questions_have_no_answers_and_pick_language():
    quiz = exam()
    th = grading.public_questions(quiz, "th")
    blob = json.dumps(th, ensure_ascii=False)
    assert "answer" not in blob and "explain" not in blob and "Until dry" not in blob and "จนมือแห้ง" not in blob
    assert th[0]["prompt"] == "ถูนานเท่าไร" and th[0]["choices"][1]["text"] == "20–30 วินาที"
    assert grading.public_questions(quiz, "th")[1]["prompt"] == "Which are moments?"  # plain text = course language
    assert grading.public_questions(quiz, "en")[0]["choices"][0] == {"id": "a", "text": "5 s"}


def test_shuffle_is_stable_per_seed_and_off_by_default():
    quiz = grading.clean_quiz(load("quiz-exam-final.json"))
    assert quiz["shuffle"] is True
    one = grading.attempt_order(quiz, "user-1:1")
    assert one == grading.attempt_order(quiz, "user-1:1")
    orders = {json.dumps(grading.attempt_order(quiz, f"user-1:{n}")) for n in range(10)}
    assert len(orders) > 1
    plain = exam()
    assert grading.attempt_order(plain, 99)["questions"] == ["q1", "q2"]
    shown = grading.public_questions(quiz, "en", one)
    assert [q["id"] for q in shown] == one["questions"]
    assert sorted(q["id"] for q in shown) == sorted(q["id"] for q in quiz["questions"])


# ---------- grading ----------

def test_exam_grade_all_or_nothing_and_review_hides_right_choice():
    quiz = exam()
    earned, possible, review = grading.grade(quiz, {"q1": ["b"], "q2": ["a"]}, "th")
    assert (earned, possible) == (1, 2)
    assert review == {"q1": {"correct": True, "explain": "จนมือแห้ง"}, "q2": {"correct": False, "explain": ""}}
    assert grading.grade(quiz, {"q1": ["b"], "q2": ["c", "a"]})[0] == 2
    assert grading.grade(quiz, {"q1": ["b"], "q2": ["a", "b", "c"]})[0] == 1  # ticking everything is not right


def test_bad_answers_rejected():
    quiz = exam()
    for answers in ([], {"q1": "b"}, {"q1": ["z"]}, {"q1": ["a", "b"]}, {"q1": [1]}):
        with pytest.raises(QuizError):
            grading.grade(quiz, answers)
    assert grading.clean_answers(quiz, {"q1": ["b", "b"], "zz": ["a"], "q2": []}) == {"q1": ["b"]}


def test_missing_lists_unanswered():
    quiz = exam()
    assert grading.missing(quiz, {"q1": ["a"]}) == ["q2"]
    assert grading.missing(quiz, None) == ["q1", "q2"]


def test_check_one_gives_instant_feedback_with_right_choice():
    quiz = grading.clean_quiz({**exam(), "mode": "check"})
    assert grading.check_one(quiz, "q1", ["a"], "en") == {"correct": False, "explain": "Until dry.", "answer": ["b"]}
    assert grading.check_one(quiz, "q2", ["c", "a"])["correct"] is True
    with pytest.raises(QuizError):
        grading.check_one(quiz, "nope", ["a"])
    with pytest.raises(QuizError):
        grading.check_one(quiz, "q1", [])


def test_pass_mark_is_exact():
    assert grading.passed(4, 5, 80) and not grading.passed(3, 5, 80)
    assert grading.passed(2, 3, 66) and not grading.passed(2, 3, 67)  # 66.7 %
    assert not grading.passed(0, 0, 1)
    assert grading.percent(2, 3) == 67 and grading.percent(0, 0) == 0


def test_attempts_left():
    quiz = exam(max_attempts=3)
    assert [grading.attempts_left(quiz, n) for n in (0, 2, 3, 5)] == [3, 1, 0, 0]
    assert grading.attempts_left(exam(max_attempts=0), 9) is None
    assert grading.attempts_left(grading.clean_quiz({**quiz, "mode": "check"}), 9) is None


def test_clean_quiz_does_not_change_the_input():
    data = load("quiz-exam-final.json")
    before = copy.deepcopy(data)
    grading.clean_quiz(data)
    assert data == before
