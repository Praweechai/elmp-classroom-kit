"""Rules shared by the ELMP blocks (schemas/common.schema.json): ids, text "..." or {en, th}, pictures."""
import re

ID = re.compile(r"^[a-z0-9][a-z0-9_-]{0,39}$")
ART = re.compile(r"^([a-z][a-z0-9-]{1,30}|/static/[A-Za-z0-9._/-]+\.(svg|png|jpg|webp))$")
MAX_TEXT = 2000


class BlockError(ValueError):
    """An author mistake in a block's data (shown to the author, never crashes the page)."""


def is_text(value):
    if isinstance(value, str):
        return 0 < len(value) <= MAX_TEXT
    if isinstance(value, dict) and value and set(value) <= {"en", "th"} and "en" in value:
        return all(isinstance(v, str) and 0 < len(v) <= MAX_TEXT for v in value.values())
    return False


def is_id(value):
    return isinstance(value, str) and bool(ID.match(value))


def is_int(value, low, high):
    return isinstance(value, int) and not isinstance(value, bool) and low <= value <= high


def text(value, lang="en"):
    """The text for this language: Thai when asked and written, else English, else ''."""
    if isinstance(value, dict):
        return value.get(lang) or value.get("en") or ""
    return value or ""


def only_keys(obj, allowed, where):
    if not isinstance(obj, dict):
        raise BlockError(f"{where}: must be an object")
    extra = set(obj) - set(allowed)
    if extra:
        raise BlockError(f"{where}: unknown field(s) {sorted(extra)}")
