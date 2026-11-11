"""
elmp_quiz — our own quiz block (doc 10 §4.2, D-87, D-91). Our screen and our grading; Open edX stores the grade
(gradebook, Progress, certificates) and the completion.

Two modes (doc 02 §9):
- check: not graded. The learner checks each question and sees at once if it was right, why, and the right choice.
         Unlimited tries. Complete after the first check.
- exam:  graded (the only thing that counts, D-91). All questions answered, then one submit. Attempts limited on the
         server, best score kept (only_if_higher), review shows right/wrong + explanation, never the right choice.
         Complete when the first grade is published.

OLX (config = JSON in the shape of schemas/elmp_quiz.schema.json):
  <elmp_quiz url_name="final-quiz" display_name="Final quiz" config='{"mode": "exam", "questions": [...]}'/>
"""
import json

from web_fragments.fragment import Fragment
from xblock.completable import XBlockCompletionMode
from xblock.core import XBlock
from xblock.fields import Dict, Integer, Scope, String

from . import grading
from .resources import learner_lang, resource


class ElmpQuizBlock(XBlock):
    display_name = String(display_name="Display name", default="Quiz", scope=Scope.settings)
    config = Dict(help="The quiz (schemas/elmp_quiz.schema.json). Answers never leave the server.",
                  default={}, scope=Scope.content)

    # learner state
    attempts = Integer(default=0, scope=Scope.user_state, help="exam: graded submits so far")
    best_earned = Integer(default=None, scope=Scope.user_state)
    last_earned = Integer(default=None, scope=Scope.user_state)
    answers = Dict(default={}, scope=Scope.user_state, help="exam: last submitted answers")
    review = Dict(default={}, scope=Scope.user_state, help="exam: {qid: correct} of the last submit")
    checked = Dict(default={}, scope=Scope.user_state, help="check: {qid: {given, correct}}")

    has_custom_completion = True  # we publish completion ourselves (check: first check, exam: first grade)
    completion_mode = XBlockCompletionMode.COMPLETABLE

    # ---------- quiz data ----------

    def quiz(self):
        """The cleaned quiz, or raises grading.QuizError (an author mistake)."""
        return grading.clean_quiz(self.config)

    def _mode(self):
        return (self.config or {}).get("mode", "check")

    @property
    def has_score(self):
        return self._mode() == "exam"

    @property
    def icon_class(self):
        return "problem" if self._mode() == "exam" else "other"

    @property
    def weight(self):
        """Points in the course grade (empty = number of questions). Open edX scales the raw score to this."""
        return (self.config or {}).get("weight")

    def max_score(self):
        try:
            return len(self.quiz()["questions"]) if self.has_score else None
        except grading.QuizError:
            return None

    def _seed(self):
        """One question/choice order per attempt; a page reload keeps it, the next attempt gets a new one."""
        return f"{self.scope_ids.user_id}:{self.scope_ids.usage_id}:{self.attempts}"

    # ---------- what the browser gets ----------

    def _state(self, quiz, lang):
        mode = quiz["mode"]
        state = {
            "block": "quiz",
            "mode": mode,
            "title": grading.text(quiz.get("title"), lang) or self.display_name,
            "intro": grading.text(quiz.get("intro"), lang),
            "lang": lang,
            "questions": grading.public_questions(quiz, lang, grading.attempt_order(quiz, self._seed())),
            "complete": bool(self.checked) if mode == "check" else self.attempts > 0,
        }
        if mode == "check":
            # the right choice of a question the learner already checked (never before)
            state["checked"] = {
                qid: grading.check_one(quiz, qid, c["given"], lang) | {"given": c["given"]}
                for qid, c in self.checked.items() if any(q["id"] == qid for q in quiz["questions"])
            }
            return state
        possible = len(quiz["questions"])
        state.update({
            "possible": possible,
            "passPct": quiz["pass_pct"],
            "attempts": self.attempts,
            "maxAttempts": quiz["max_attempts"],
            "attemptsLeft": grading.attempts_left(quiz, self.attempts),
            "best": None if self.best_earned is None else {
                "earned": self.best_earned,
                "percent": grading.percent(self.best_earned, possible),
                "passed": grading.passed(self.best_earned, possible, quiz["pass_pct"]),
            },
        })
        if self.attempts:
            _, _, review = grading.grade(quiz, self.answers, lang)
            state["last"] = {
                "earned": self.last_earned,
                "percent": grading.percent(self.last_earned or 0, possible),
                "passed": grading.passed(self.last_earned or 0, possible, quiz["pass_pct"]),
                "answers": self.answers,
                "review": review,
            }
        return state

    def student_view(self, context=None):  # pylint: disable=unused-argument
        lang = learner_lang()
        try:
            config = self._state(self.quiz(), lang)
        except grading.QuizError as err:
            # author mistake: say so instead of a broken quiz (learners never see answers in the message)
            config = {"block": "quiz", "title": self.display_name, "lang": lang, "error": str(err)}
        frag = Fragment(
            f'<div class="elmp-block elmp-quiz" data-elmp-block="quiz" lang="{lang}" aria-live="polite"></div>'
        )
        frag.add_css(resource("static/elmp-blocks.css"))
        frag.add_javascript(resource("static/elmp-blocks.js"))
        frag.initialize_js("ElmpBlock", config)
        return frag

    # ---------- handlers ----------

    def _complete(self):
        self.runtime.publish(self, "completion", {"completion": 1.0})

    @XBlock.json_handler
    def check(self, data, suffix=""):  # pylint: disable=unused-argument
        """mode check: {"question": qid, "given": [choice ids]} → right/wrong, explanation, right choice."""
        lang = learner_lang()
        try:
            quiz = self.quiz()
            if quiz["mode"] != "check":
                return {"ok": False, "reason": "wrong_mode"}
            data = data if isinstance(data, dict) else {}
            result = grading.check_one(quiz, data.get("question"), data.get("given"), lang)
        except grading.QuizError as err:
            return {"ok": False, "reason": "bad_request", "message": str(err)}
        first = not self.checked
        qid = data["question"]
        self.checked = {**self.checked, qid: {"given": sorted(set(data["given"])), "correct": result["correct"]}}
        if first:
            self._complete()
        return {"ok": True, **result}

    @XBlock.json_handler
    def submit(self, data, suffix=""):  # pylint: disable=unused-argument
        """mode exam: {"answers": {qid: [choice ids]}} → score + review; the grade is published only if higher."""
        lang = learner_lang()
        try:
            quiz = self.quiz()
            if quiz["mode"] != "exam":
                return {"ok": False, "reason": "wrong_mode"}
            if grading.attempts_left(quiz, self.attempts) == 0:
                return {"ok": False, "reason": "no_attempts_left", **self._state(quiz, lang)}
            answers = grading.clean_answers(quiz, data.get("answers") if isinstance(data, dict) else None)
            left_out = grading.missing(quiz, answers)
            if left_out:
                return {"ok": False, "reason": "answer_all", "missing": left_out}
            earned, possible, review = grading.grade(quiz, answers, lang)
        except grading.QuizError as err:
            return {"ok": False, "reason": "bad_request", "message": str(err)}

        first = self.attempts == 0
        self.answers = answers
        self.review = {qid: r["correct"] for qid, r in review.items()}
        self.attempts += 1
        self.last_earned = earned
        if self.best_earned is None or earned > self.best_earned:
            self.best_earned = earned
        # only_if_higher: a later, worse try never lowers the recorded grade.
        self.runtime.publish(self, "grade", {"value": earned, "max_value": possible, "only_if_higher": True})
        if first:
            self._complete()
        return {"ok": True, **self._state(quiz, lang)}

    # ---------- workbench ----------

    @staticmethod
    def workbench_scenarios():
        quiz = {"mode": "exam", "max_attempts": 3, "pass_pct": 80, "questions": [
            {"id": "q1", "prompt": {"en": "When must you clean your hands?", "th": "ต้องทำความสะอาดมือเมื่อไร"},
             "choices": [{"id": "a", "text": "Before touching a patient"}, {"id": "b", "text": "Only after lunch"}],
             "answer": ["a"], "explain": "Moment 1 of the WHO 5 moments."}]}
        return [("ELMP quiz", f"<elmp_quiz config='{json.dumps(quiz)}'/>")]
