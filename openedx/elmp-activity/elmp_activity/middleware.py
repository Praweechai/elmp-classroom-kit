"""
Adds the activity script to lesson pages: the LMS page the Classroom player shows in its
iframe (`/xblock/<unit usage key>`). Nothing else is touched.

Parent origin (where messages may go): ELMP_ACTIVITY_PARENT_ORIGIN if set, else the origin
of LEARNING_MICROFRONTEND_URL (Tutor sets it, e.g. http://apps.local.openedx.io).
"""
import functools
import json
import re
from importlib.resources import files
from urllib.parse import urlsplit

from django.conf import settings

MARKER = b"data-elmp-activity"
# render_xblock: /xblock/<usage key> (usage keys never contain "/")
LESSON_PAGE = re.compile(r"^/xblock/[^/]+/?$")


@functools.lru_cache(maxsize=1)
def activity_script():
    return files("elmp_activity").joinpath("static/elmp-activity.js").read_text(encoding="utf-8")


def parent_origin():
    explicit = getattr(settings, "ELMP_ACTIVITY_PARENT_ORIGIN", "") or ""
    if explicit:
        return explicit.rstrip("/")
    parts = urlsplit(getattr(settings, "LEARNING_MICROFRONTEND_URL", "") or "")
    if parts.scheme in ("http", "https") and parts.netloc:
        return f"{parts.scheme}://{parts.netloc}"
    return ""


def script_tags(origin):
    config = json.dumps({"parentOrigin": origin}).replace("</", "<\\/")
    return (
        f'<script data-elmp-activity="config">window.ELMP_ACTIVITY = {config};</script>'
        f'<script data-elmp-activity="bridge">{activity_script()}</script>'
    ).encode("utf-8")


def should_inject(request, response):
    return (
        getattr(settings, "ELMP_ACTIVITY_ENABLED", True)
        and request.method == "GET"
        and response.status_code == 200
        and not getattr(response, "streaming", False)
        and response.get("Content-Type", "").startswith("text/html")
        and not response.get("Content-Encoding")
        and LESSON_PAGE.match(request.path) is not None
    )


class ActivityScriptMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if not should_inject(request, response):
            return response
        origin = parent_origin()
        content = response.content
        end = content.rfind(b"</body>")
        if not origin or end == -1 or MARKER in content:
            return response
        response.content = content[:end] + script_tags(origin) + content[end:]
        if response.has_header("Content-Length"):
            response["Content-Length"] = str(len(response.content))
        return response
