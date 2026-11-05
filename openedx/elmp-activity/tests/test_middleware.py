"""Middleware tests (run: python -m unittest discover -s openedx/elmp-activity/tests)."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import django  # noqa: E402
from django.conf import settings  # noqa: E402

settings.configure(
    DEBUG=False,
    SECRET_KEY="test",
    ALLOWED_HOSTS=["*"],
    MIDDLEWARE=["django.middleware.common.CommonMiddleware"],
    LEARNING_MICROFRONTEND_URL="http://apps.local.openedx.io/learning",
)
django.setup()

from django.http import HttpResponse, StreamingHttpResponse  # noqa: E402
from django.test import RequestFactory, override_settings  # noqa: E402

from elmp_activity.middleware import ActivityScriptMiddleware, parent_origin  # noqa: E402
from elmp_activity.settings.common import MIDDLEWARE_PATH, plugin_settings  # noqa: E402

UNIT = "/xblock/block-v1:ELMP+INF101+2026+type@vertical+block@u1"
PAGE = b"<html><body><div>lesson</div></body></html>"


def run(path=UNIT, body=PAGE, method="get", **resp_kwargs):
    request = getattr(RequestFactory(), method)(path)
    response = resp_kwargs.pop("response", None) or HttpResponse(body, **resp_kwargs)
    response["Content-Length"] = str(len(response.content)) if not response.streaming else "0"
    return ActivityScriptMiddleware(lambda r: response)(request)


class InjectTests(unittest.TestCase):
    def test_lesson_page_gets_script_before_body_end(self):
        out = run().content
        self.assertIn(b'data-elmp-activity="bridge"', out)
        self.assertIn(b'"parentOrigin": "http://apps.local.openedx.io"', out)
        self.assertTrue(out.endswith(b"</body></html>"))
        self.assertLess(out.index(b"lesson"), out.index(b"data-elmp-activity"))

    def test_content_length_updated(self):
        response = run()
        self.assertEqual(int(response["Content-Length"]), len(response.content))

    def test_other_pages_untouched(self):
        for path in ("/dashboard", "/courses/x/courseware", "/xblock/a/handler/x", "/xblock/resource/h5pxblock/x.js"):
            self.assertEqual(run(path=path).content, PAGE, path)

    def test_non_html_post_errors_streaming_untouched(self):
        self.assertEqual(run(content_type="application/json").content, PAGE)
        self.assertEqual(run(method="post").content, PAGE)
        self.assertEqual(run(status=404).content, PAGE)
        streamed = run(response=StreamingHttpResponse([PAGE]))
        self.assertTrue(streamed.streaming)

    def test_injects_once(self):
        once = run().content
        self.assertEqual(run(body=once).content, once)

    def test_no_body_tag_untouched(self):
        self.assertEqual(run(body=b"<div>fragment</div>").content, b"<div>fragment</div>")

    @override_settings(ELMP_ACTIVITY_ENABLED=False)
    def test_switch_off(self):
        self.assertEqual(run().content, PAGE)

    @override_settings(ELMP_ACTIVITY_PARENT_ORIGIN="https://apps.hospital.example/")
    def test_explicit_origin(self):
        self.assertEqual(parent_origin(), "https://apps.hospital.example")

    @override_settings(LEARNING_MICROFRONTEND_URL="")
    def test_no_origin_untouched(self):
        self.assertEqual(run().content, PAGE)


class SettingsTests(unittest.TestCase):
    def test_plugin_settings_adds_middleware_once(self):
        class S:
            MIDDLEWARE = ("a.B",)

        plugin_settings(S)
        plugin_settings(S)
        self.assertEqual(S.MIDDLEWARE, ["a.B", MIDDLEWARE_PATH])
        self.assertTrue(S.ELMP_ACTIVITY_ENABLED)

    def test_script_has_no_closing_tag(self):
        from elmp_activity.middleware import activity_script

        self.assertNotIn("</", activity_script())


if __name__ == "__main__":
    unittest.main()
