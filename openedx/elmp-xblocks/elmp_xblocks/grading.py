"""
Quiz rules for elmp_quiz (doc 02 §9, D-87, D-91). Plain Python with no Open edX imports, so it is easy to test.

The quiz data has the shape of schemas/elmp_quiz.schema.json. clean_quiz() checks it the same way the schema
does (the image has no jsonschema) and fills in defaults. Answers and explanations stay on the server:
- public_questions(): what the browser may see (no answer, no explain)
- check_one():        mode check (not graded) — right/wrong, explanation and the right choice, at once
- grade():            mode exam — score + review with right/wrong and explanation, never the right choice
"""
import random
import re

MODES = ("check", "exam")
QUIZ_KEYS = {"mode", "title", "intro", "max_attempts", "pass_pct", "shuffle", "weight", "questions"}
QUESTION_KEYS = {"id", "type", "prompt", "choices", "answer", "explain"}
DEFAULTS = {"max_attempts": 3, "pass_pct": 80, "shuffle": False, "weight": None}
ID = re.compile(r"^[a-z0-9][a-z0-9_-]{0,39}$")
MAX_TEXT = 2000


class QuizError(ValueError):
    pass


# ---------- text: "plain" or {"en": ..., "th": ...} ----------

def _is_text(value):
    if isinstance(value, str):
        return 0 < len(value) <= MAX_TEXT
    if isinstance(value, dict) and value and set(value) <= {"en", "th"} and "en" in value:
        return all(isinstance(v, str) and 0 < len(v) <= MAX_TEXT for v in value.values())
    return False


def text(value, lang="en"):
    """The text for this language: Thai when asked and written, else English, else ''."""
    if isinstance(value, dict):
        return value.get(lang) or value.get("en") or ""
    return value or ""


# ---------- checking the author's data ----------

def _int_in(value, low, high):
    return isinstance(value, int) and not isinstance(value, bool) and low <= value <= high


def _clean_question(q, index):
    where = f"question {index + 1}"
    if not isinstance(q, dict):
        raise QuizError(f"{where}: must be an object")
    extra = set(q) - QUESTION_KEYS
    if extra:
        raise QuizError(f"{where}: unknown field(s) {sorted(extra)}")
    qid = q.get("id")
    if not isinstance(qid, str) or not ID.match(qid):
        raise QuizError(f"{where}: id must be lower-case letters, digits, - or _")
    kind = q.get("type", "single")
    if kind not in ("single", "multi"):
        raise QuizError(f"{qid}: type must be single or multi")
    if not _is_text(q.get("prompt")):
        raise QuizError(f"{qid}: prompt is missing")
    choices = q.get("choices")
    if not isinstance(choices, list) or not 2 <= len(choices) <= 8:
        raise QuizError(f"{qid}: needs 2 to 8 choices")
    choice_ids = []
    for c in choices:
        if not isinstance(c, dict) or set(c) - {"id", "text"}:
            raise QuizError(f"{qid}: a choice has only id and text")
        if not isinstance(c.get("id"), str) or not ID.match(c["id"]) or not _is_text(c.get("text")):
            raise QuizError(f"{qid}: every choice needs an id and a text")
        choice_ids.append(c["id"])
    if len(set(choice_ids)) != len(choice_ids):
        raise QuizError(f"{qid}: choice ids must be different")
    answer = q.get("answer")
    if not isinstance(answer, list) or not answer or not set(answer) <= set(choice_ids):
        raise QuizError(f"{qid}: answer must name existing choices")
    if len(set(answer)) != len(answer):
        raise QuizError(f"{qid}: answer repeats a choice")
    if kind == "single" and len(answer) != 1:
        raise QuizError(f"{qid}: a single-choice question has exactly one answer")
    if "explain" in q and not _is_text(q["explain"]):
        raise QuizError(f"{qid}: explain must be text")
    return {**q, "type": kind}


def clean_quiz(data):
    """Check the quiz like the JSON schema does and fill in defaults. Returns a new dict or raises QuizError."""
    if not isinstance(data, dict):
        raise QuizError("the quiz must be an object")
    extra = set(data) - QUIZ_KEYS
    if extra:
        raise QuizError(f"unknown field(s) {sorted(extra)}")
    if data.get("mode") not in MODES:
        raise QuizError("mode must be check or exam")
    for key in ("title", "intro"):
        if key in data and not _is_text(data[key]):
            raise QuizError(f"{key} must be text")
    quiz = {**DEFAULTS, **data}
    if not _int_in(quiz["max_attempts"], 0, 10):
        raise QuizError("max_attempts must be 0 (unlimited) to 10")
    if not _int_in(quiz["pass_pct"], 1, 100):
        raise QuizError("pass_pct must be 1 to 100")
    if not isinstance(quiz["shuffle"], bool):
        raise QuizError("shuffle must be true or false")
    weight = quiz["weight"]
    if weight is not None and (isinstance(weight, bool) or not isinstance(weight, (int, float)) or weight < 0):
        raise QuizError("weight must be empty or a number from 0")
    questions = quiz.get("questions")
    if not isinstance(questions, list) or not 1 <= len(questions) <= 50:
        raise QuizError("the quiz needs 1 to 50 questions")
    quiz["questions"] = [_clean_question(q, i) for i, q in enumerate(questions)]
    ids = [q["id"] for q in quiz["questions"]]
    if len(set(ids)) != len(ids):
        raise QuizError("question ids must be different")
    return quiz


# ---------- what the learner sees ----------

def attempt_order(quiz, seed):
    """Question order and choice order for one attempt. Same seed → same order (the page can reload)."""
    qids = [q["id"] for q in quiz["questions"]]
    choices = {q["id"]: [c["id"] for c in q["choices"]] for q in quiz["questions"]}
    if quiz.get("shuffle"):
        rnd = random.Random(str(seed))
        rnd.shuffle(qids)
        for ids in choices.values():
            rnd.shuffle(ids)
    return {"questions": qids, "choices": choices}


def public_questions(quiz, lang="en", order=None):
    """Questions for the browser: no answer, no explain. Text already in the learner's language."""
    by_id = {q["id"]: q for q in quiz["questions"]}
    order = order or attempt_order({**quiz, "shuffle": False}, 0)
    out = []
    for qid in order["questions"]:
        q = by_id[qid]
        texts = {c["id"]: c["text"] for c in q["choices"]}
        out.append({
            "id": qid,
            "type": q["type"],
            "prompt": text(q["prompt"], lang),
            "choices": [{"id": cid, "text": text(texts[cid], lang)} for cid in order["choices"][qid]],
        })
    return out


# ---------- the learner's answers ----------

def clean_answers(quiz, answers):
    """{question id: [choice ids]} from the browser → checked copy. Unknown questions are dropped."""
    if not isinstance(answers, dict):
        raise QuizError("answers must be an object")
    out = {}
    for q in quiz["questions"]:
        given = answers.get(q["id"])
        if given in (None, []):
            continue
        if not isinstance(given, list) or not all(isinstance(g, str) for g in given):
            raise QuizError(f"{q['id']}: answer must be a list of choice ids")
        valid = {c["id"] for c in q["choices"]}
        if not set(given) <= valid:
            raise QuizError(f"{q['id']}: unknown choice")
        if q["type"] == "single" and len(set(given)) > 1:
            raise QuizError(f"{q['id']}: pick one choice")
        out[q["id"]] = sorted(set(given))
    return out


def missing(quiz, answers):
    """Question ids with no choice picked (an exam must be answered in full)."""
    return [q["id"] for q in quiz["questions"] if not (answers or {}).get(q["id"])]


def _is_right(q, given):
    return set(given or []) == set(q["answer"])


def check_one(quiz, qid, given, lang="en"):
    """Mode check (not graded): instant feedback for one question, including the right choice."""
    q = next((q for q in quiz["questions"] if q["id"] == qid), None)
    if q is None:
        raise QuizError("unknown question")
    given = clean_answers({"questions": [q]}, {qid: given}).get(qid)
    if not given:
        raise QuizError(f"{qid}: pick a choice")
    return {"correct": _is_right(q, given), "explain": text(q.get("explain"), lang), "answer": list(q["answer"])}


def grade(quiz, answers, lang="en"):
    """
    Mode exam. One point per question, all or nothing (multi = exactly the right set).
    Returns (earned, possible, review); review[qid] = {"correct": bool, "explain": str} — no right choice.
    """
    answers = clean_answers(quiz, answers)
    earned = 0
    review = {}
    for q in quiz["questions"]:
        right = _is_right(q, answers.get(q["id"]))
        earned += 1 if right else 0
        review[q["id"]] = {"correct": right, "explain": text(q.get("explain"), lang)}
    return earned, len(quiz["questions"]), review


def percent(earned, possible):
    return round(100 * earned / possible) if possible else 0


def passed(earned, possible, pass_pct):
    """Exact (no rounding): 4 of 5 = 80 % passes a pass mark of 80."""
    return possible > 0 and earned * 100 >= pass_pct * possible


def attempts_left(quiz, attempts):
    """None = unlimited (max_attempts 0, or mode check)."""
    if quiz["mode"] == "check" or not quiz["max_attempts"]:
        return None
    return max(0, quiz["max_attempts"] - attempts)
