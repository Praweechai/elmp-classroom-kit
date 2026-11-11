"""
elmp_activity — one block, six kinds (hotspot, order, scenario, sort, deck, practice) (doc 10 §4.2, D-87).
Never graded. Complete (1.0) when the "done when" rule of the kind is met; the server checks it (activities.finish).

OLX (config = JSON in the shape of schemas/elmp_activity.schema.json):
  <elmp_activity url_name="five-moments-order" display_name="Put the moments in order" config='{"kind": "order", ...}'/>
"""
import json
import time
from typing import ClassVar

from web_fragments.fragment import Fragment
from xblock.completable import XBlockCompletionMode
from xblock.core import XBlock
from xblock.fields import Boolean, Dict, Float, Scope, String

from . import activities
from .common import text
from .resources import course_url, learner_lang, resource
from .studio import StudioJsonMixin


@XBlock.wants("replace_urls")
class ElmpActivityBlock(StudioJsonMixin, XBlock):
    display_name = String(display_name="Display name", default="Activity", scope=Scope.settings)
    config = Dict(help="The activity (schemas/elmp_activity.schema.json).", default={}, scope=Scope.content)

    done = Boolean(default=False, scope=Scope.user_state)
    result = Dict(default={}, scope=Scope.user_state, help="e.g. sort score of the finishing try")
    started_at = Float(default=None, scope=Scope.user_state, help="practice: server time the timer started")

    has_score = False
    has_custom_completion = True
    completion_mode = XBlockCompletionMode.COMPLETABLE
    icon_class = "other"

    clock = staticmethod(time.time)  # tests replace it
    STUDIO_TEMPLATE: ClassVar[dict] = {"kind": "order", "title": "Put the steps in order", "items": ["First", "Second", "Third"]}
    clean = staticmethod(activities.clean_activity)

    def activity(self):
        return activities.clean_activity(self.config)

    def _public(self, act, lang):
        public = activities.public_activity(act, lang)
        if public.get("art"):
            public["art"] = course_url(self, public["art"])
        for scene in public.get("scenes", {}).values():
            scene["art"] = course_url(self, scene["art"])
        return {"block": "activity", "title": text(act.get("title"), lang) or self.display_name, "lang": lang, **public}

    def preview_config(self, act, lang):
        """Studio preview: a new learner (not done)."""
        return {**self._public(act, lang), "complete": False, "result": {}}

    def student_view(self, context=None):  # pylint: disable=unused-argument
        lang = learner_lang()
        try:
            config = {**self._public(self.activity(), lang), "complete": self.done, "result": self.result}
        except activities.ActivityError as err:
            config = {"block": "activity", "title": self.display_name, "lang": lang, "error": str(err)}
        kind = config.get("kind", "error")
        frag = Fragment(
            f'<div class="elmp-block elmp-activity elmp-{kind}" data-elmp-block="activity" lang="{lang}"></div>'
        )
        frag.add_css(resource("static/elmp-blocks.css"))
        frag.add_javascript(resource("static/elmp-blocks.js"))
        frag.initialize_js("ElmpBlock", config)
        return frag

    @XBlock.json_handler
    def start_timer(self, data, suffix=""):  # pylint: disable=unused-argument
        """practice: the timer starts (the server keeps the time, so finishing early is refused).

        Not called `start`: Open edX reads `start` on every block as its start date (course tree build fails).
        """
        self.started_at = self.clock()
        return {"ok": True}

    @XBlock.json_handler
    def finish(self, data, suffix=""):  # pylint: disable=unused-argument
        """Evidence of the kind (opened / order / path / placed / known / —) → complete once."""
        try:
            act = self.activity()
            ago = None if self.started_at is None else self.clock() - self.started_at
            result = activities.finish(act, data, ago)
        except activities.ActivityError as err:
            return {"ok": False, "reason": "not_done", "message": str(err)}
        if not self.done:
            self.done = True
            self.result = result
            self.runtime.publish(self, "completion", {"completion": 1.0})
        return {"ok": True, "complete": True, **result}

    @staticmethod
    def workbench_scenarios():
        act = {"kind": "order", "title": "Put the steps in order", "items": ["Wet hands", "Soap", "Rub 20 s", "Rinse"]}
        return [("ELMP activity", f"<elmp_activity config='{json.dumps(act)}'/>")]
