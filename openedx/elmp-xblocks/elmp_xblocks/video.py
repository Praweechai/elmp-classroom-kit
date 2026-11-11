"""
elmp_video — our own video player block (doc 10 §4.2, D-87). Not graded. Complete when complete_pct (95 %) of the
length was really played; the server counts (watching.py). Resume point saved. Captions on by default.

OLX (config = JSON in the shape of schemas/elmp_video.schema.json):
  <elmp_video url_name="why-it-matters" display_name="Why it matters" config='{"src": "/static/x.mp4", ...}'/>
"""
import json
import time

from web_fragments.fragment import Fragment
from xblock.completable import XBlockCompletionMode
from xblock.core import XBlock
from xblock.fields import Boolean, Dict, Float, List, Scope, String

from . import watching
from .common import text
from .resources import learner_lang, resource


class ElmpVideoBlock(XBlock):
    display_name = String(display_name="Display name", default="Video", scope=Scope.settings)
    config = Dict(help="The video (schemas/elmp_video.schema.json).", default={}, scope=Scope.content)

    # learner state
    stretches = List(default=[], scope=Scope.user_state, help="merged [[from, to], ...] really played")
    position = Float(default=0.0, scope=Scope.user_state, help="resume point (seconds)")
    last_report_at = Float(default=None, scope=Scope.user_state, help="server time of the last report")
    done = Boolean(default=False, scope=Scope.user_state)

    has_score = False
    has_custom_completion = True
    completion_mode = XBlockCompletionMode.COMPLETABLE
    icon_class = "video"

    clock = staticmethod(time.time)  # tests replace it

    def video(self):
        return watching.clean_video(self.config)

    def _state(self, video, lang):
        watched = watching.watched_seconds(self.stretches)
        return {
            "block": "video",
            "title": text(video.get("title"), lang) or self.display_name,
            "lang": lang,
            **watching.public_video(video, lang),
            "position": self.position,
            "furthest": watching.furthest(self.stretches),
            "watched": round(watched, 1),
            "percent": min(100, round(100 * watched / video["seconds"])),
            "complete": self.done,
        }

    def student_view(self, context=None):  # pylint: disable=unused-argument
        lang = learner_lang()
        try:
            config = self._state(self.video(), lang)
        except watching.VideoError as err:
            config = {"block": "video", "title": self.display_name, "lang": lang, "error": str(err)}
        frag = Fragment(f'<div class="elmp-block elmp-video" data-elmp-block="video" lang="{lang}"></div>')
        frag.add_css(resource("static/elmp-blocks.css"))
        frag.add_javascript(resource("static/elmp-blocks.js"))
        frag.initialize_js("ElmpBlock", config)
        return frag

    @XBlock.json_handler
    def progress(self, data, suffix=""):  # pylint: disable=unused-argument
        """{"segments": [[from, to], ...], "position": seconds} → watched %, complete. Called every ~10 s + on pause."""
        lang = learner_lang()
        now = self.clock()
        try:
            video = self.video()
            data = data if isinstance(data, dict) else {}
            elapsed = None if self.last_report_at is None else now - self.last_report_at
            merged = watching.add_report(video, self.stretches, data.get("segments", []), elapsed)
        except watching.VideoError as err:
            # not saved; the player keeps its own count and the learner just keeps watching
            self.last_report_at = now
            return {"ok": False, "reason": "bad_report", "message": str(err)}
        self.stretches = merged
        self.last_report_at = now
        pos = data.get("position")
        if isinstance(pos, (int, float)) and not isinstance(pos, bool):
            limit = video["seconds"] if video["allow_skip"] else watching.furthest(merged)
            self.position = round(max(0.0, min(float(pos), limit, float(video["seconds"]))), 2)
        if not self.done and watching.is_complete(video, merged):
            self.done = True
            self.runtime.publish(self, "completion", {"completion": 1.0})
        return {"ok": True, **self._state(video, lang)}

    @staticmethod
    def workbench_scenarios():
        video = {"src": "/static/demo.mp4", "seconds": 45,
                 "captions": [{"lang": "en", "src": "/static/demo.en.vtt"}],
                 "chapters": [{"at": 0, "title": "Start"}, {"at": 15, "title": "Middle"}]}
        return [("ELMP video", f"<elmp_video config='{json.dumps(video)}'/>")]
