"""Shared helpers for the ELMP blocks: packaged JS/CSS and the learner's language."""
import functools
from importlib.resources import files


@functools.cache
def resource(path):
    """Block CSS/JS shipped inside the package, inlined into the fragment (no collectstatic needed)."""
    return files("elmp_xblocks").joinpath(path).read_text(encoding="utf-8")


def learner_lang():
    """'th' or 'en' from the request language (Open edX sets it from the language cookie); 'en' outside Django."""
    try:
        from django.core.exceptions import ImproperlyConfigured  # pylint: disable=import-outside-toplevel
        from django.utils import translation  # pylint: disable=import-outside-toplevel
    except ImportError:  # tests / workbench without Django
        return "en"
    try:
        lang = translation.get_language() or "en"
    except ImproperlyConfigured:  # Django present but not set up
        lang = "en"
    return "th" if lang.lower().startswith("th") else "en"


def course_url(block, path):
    """A '/static/x' path from our JSON → the course file URL (Open edX rewrites this in HTML, not in JSON).
    Uses the runtime's replace_urls service (blocks declare @XBlock.wants("replace_urls")); unchanged without it."""
    if not isinstance(path, str) or not path.startswith("/static/"):
        return path
    try:
        service = block.runtime.service(block, "replace_urls")
    except Exception:  # noqa: BLE001  (NoSuchServiceError and friends: tests, workbench)
        service = None
    if service is None:
        return path
    quoted = service.replace_urls(f'"{path}"')
    return quoted[1:-1] if quoted.startswith('"') and quoted.endswith('"') else path
