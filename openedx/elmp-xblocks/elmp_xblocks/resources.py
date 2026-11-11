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
