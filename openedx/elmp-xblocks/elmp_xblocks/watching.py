"""
Video rules for elmp_video (doc 02 §9, D-87). Plain Python, easy to test.

The player reports the stretches it really played ([from, to] in seconds). The server keeps them merged and decides
completion — posting "I watched it all" does not work:
- no skipping ahead (allow_skip false): a stretch must start at or before the furthest point already watched (+ slack)
- the clock: in one report, new played time can be at most 2x the wall time since the last report (+ slack),
  because the fastest speed in our player is 2x
- complete when the merged watched time reaches complete_pct of the length
"""
import re

from .common import BlockError, is_int, is_text, only_keys, text

VIDEO_KEYS = {"title", "src", "poster", "seconds", "captions", "chapters", "transcript", "complete_pct", "allow_skip"}
DEFAULTS = {"complete_pct": 95, "allow_skip": False, "chapters": [], "poster": None, "transcript": None}
SRC = re.compile(r"^(/static/|/media/)[A-Za-z0-9._/-]+\.mp4$")
POSTER = re.compile(r"^(/static/|/media/)[A-Za-z0-9._/-]+\.(jpg|png|webp)$")
VTT = re.compile(r"^(/static/|/media/)[A-Za-z0-9._/-]+\.vtt$")
SPEEDS = (0.75, 1, 1.25, 1.5, 2)
MAX_SPEED = max(SPEEDS)
SLACK = 3.0          # seconds of tolerance (timer jitter, buffering, rounding)
FIRST_REPORT = 20.0  # wall seconds assumed for the first report of a page view


class VideoError(BlockError):
    pass


def clean_video(data):
    """Check like schemas/elmp_video.schema.json and fill in defaults. Returns a new dict or raises VideoError."""
    try:
        only_keys(data, VIDEO_KEYS, "video")
    except BlockError as err:
        raise VideoError(str(err)) from err
    if "title" in data and not is_text(data["title"]):
        raise VideoError("title must be text")
    if not isinstance(data.get("src"), str) or not SRC.match(data["src"]):
        raise VideoError("src must be an .mp4 under /static/ or /media/")
    if data.get("poster") is not None and (not isinstance(data["poster"], str) or not POSTER.match(data["poster"])):
        raise VideoError("poster must be a .jpg/.png/.webp under /static/ or /media/")
    if not is_int(data.get("seconds"), 1, 7200):
        raise VideoError("seconds must be 1 to 7200")
    captions = data.get("captions")
    if not isinstance(captions, list) or not captions:
        raise VideoError("captions are required (at least one .vtt)")
    langs = []
    for c in captions:
        if not isinstance(c, dict) or set(c) != {"lang", "src"} or c["lang"] not in ("en", "th"):
            raise VideoError("each caption has lang (en/th) and src")
        if not isinstance(c["src"], str) or not VTT.match(c["src"]):
            raise VideoError("caption src must be a .vtt under /static/ or /media/")
        langs.append(c["lang"])
    if len(set(langs)) != len(langs):
        raise VideoError("one caption file per language")
    video = {**DEFAULTS, **data}
    chapters = video["chapters"]
    if not isinstance(chapters, list):
        raise VideoError("chapters must be a list")
    last = -1
    for ch in chapters:
        if not isinstance(ch, dict) or set(ch) != {"at", "title"} or not is_text(ch["title"]):
            raise VideoError("each chapter has at and title")
        if not is_int(ch["at"], 0, video["seconds"] - 1) or ch["at"] <= last:
            raise VideoError("chapters must be in time order, inside the video")
        last = ch["at"]
    if video["transcript"] is not None and not is_text(video["transcript"]):
        raise VideoError("transcript must be text")
    if not is_int(video["complete_pct"], 50, 100):
        raise VideoError("complete_pct must be 50 to 100")
    if not isinstance(video["allow_skip"], bool):
        raise VideoError("allow_skip must be true or false")
    return video


def public_video(video, lang="en"):
    """What the player needs (nothing secret in a video; text in the learner's language)."""
    return {
        "src": video["src"],
        "poster": video["poster"],
        "seconds": video["seconds"],
        "captions": [{"lang": c["lang"], "src": c["src"]} for c in video["captions"]],
        "chapters": [{"at": ch["at"], "title": text(ch["title"], lang)} for ch in video["chapters"]],
        "transcript": text(video["transcript"], lang),
        "completePct": video["complete_pct"],
        "allowSkip": video["allow_skip"],
        "speeds": list(SPEEDS),
    }


# ---------- watched stretches ----------

def merge(stretches):
    """Sorted, non-overlapping [[from, to], ...] (touching stretches join)."""
    out = []
    for start, end in sorted(stretches):
        if out and start <= out[-1][1] + 0.5:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out


def watched_seconds(stretches):
    return sum(end - start for start, end in stretches)


def furthest(stretches):
    """End of the stretch that starts at 0 (what the learner may seek within when skipping is off)."""
    first = stretches[0] if stretches else None
    return first[1] if first and first[0] <= SLACK else 0.0


def _clean_report(segments, length):
    if not isinstance(segments, list) or len(segments) > 50:
        raise VideoError("segments must be a list (at most 50)")
    out = []
    for seg in segments:
        if not (isinstance(seg, list) and len(seg) == 2 and all(isinstance(x, (int, float)) and not isinstance(x, bool)
                                                                  for x in seg)):
            raise VideoError("each segment is [from, to] in seconds")
        start, end = max(0.0, float(seg[0])), min(float(length), float(seg[1]))
        if end - start > 0.05:
            out.append([round(start, 2), round(end, 2)])
    return out


def add_report(video, stretches, segments, elapsed):
    """
    One progress report → new merged stretches. elapsed = wall seconds since the last report (None = first one).
    Raises VideoError when the report is not believable; nothing is saved then.
    """
    length = video["seconds"]
    new = _clean_report(segments, length)
    have = merge(stretches)
    if not video["allow_skip"]:
        reach = furthest(have)
        for start, end in merge(new):
            if start > reach + SLACK:
                raise VideoError("skipped ahead")
            reach = max(reach, end)
    gained = watched_seconds(merge(have + new)) - watched_seconds(have)
    wall = FIRST_REPORT if elapsed is None else max(0.0, float(elapsed))
    if gained > wall * MAX_SPEED + SLACK:
        raise VideoError("more played than the clock allows")
    return merge(have + new)


def is_complete(video, stretches):
    """complete_pct of the length watched (half a second of rounding allowed)."""
    return watched_seconds(stretches) + 0.5 >= video["complete_pct"] * video["seconds"] / 100
