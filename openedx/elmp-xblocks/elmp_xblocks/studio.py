"""
Studio editor for the ELMP blocks (D-95): a JSON editor with checking and a live preview, shared by the three blocks.
The same rules as the course import (olxlib) and the learner page: the block's clean_* function.
"""
import json
from typing import ClassVar

from web_fragments.fragment import Fragment
from xblock.core import XBlock

from .common import BlockError
from .resources import learner_lang, resource

MAX_JSON = 200_000  # characters


class StudioJsonMixin:
    """Needs on the block: `config` field, `display_name` field, clean(data) → cleaned dict, preview_config(cleaned, lang),
    and STUDIO_TEMPLATE (a small valid example for an empty block)."""

    STUDIO_TEMPLATE: ClassVar[dict] = {}

    def studio_view(self, context=None):  # pylint: disable=unused-argument
        frag = Fragment(resource("static/elmp-studio.html"))
        frag.add_css(resource("static/elmp-blocks.css"))
        frag.add_css(resource("static/elmp-studio.css"))
        frag.add_javascript(resource("static/elmp-blocks.js"))
        frag.add_javascript(resource("static/elmp-studio.js"))
        frag.initialize_js("ElmpStudio", {
            "blockType": self.scope_ids.block_type,
            "displayName": self.display_name,
            "config": json.dumps(self.config or self.STUDIO_TEMPLATE, indent=2, ensure_ascii=False),
            "template": json.dumps(self.STUDIO_TEMPLATE, indent=2, ensure_ascii=False),
            "lang": learner_lang(),
        })
        return frag

    def _read(self, data):
        if not isinstance(data, dict):
            raise BlockError("send an object")
        raw = data.get("config")
        if isinstance(raw, str):
            if len(raw) > MAX_JSON:
                raise BlockError("the JSON is too long")
            try:
                raw = json.loads(raw)
            except ValueError as err:
                raise BlockError(f"not valid JSON: {err}") from err
        return self.clean(raw)

    @XBlock.json_handler
    def studio_preview(self, data, suffix=""):  # pylint: disable=unused-argument
        """Check the JSON and return what a new learner would get (no state, nothing saved)."""
        try:
            cleaned = self._read(data)
        except BlockError as err:
            return {"ok": False, "error": str(err)}
        lang = data.get("lang") if data.get("lang") in ("en", "th") else learner_lang()
        return {"ok": True, "preview": {**self.preview_config(cleaned, lang), "preview": True}}

    @XBlock.json_handler
    def studio_submit(self, data, suffix=""):  # pylint: disable=unused-argument
        """Save only when the JSON passes the same checks the learner page uses."""
        try:
            self._read(data)
            config = data["config"]
            config = json.loads(config) if isinstance(config, str) else config
        except BlockError as err:
            return {"ok": False, "error": str(err)}
        name = data.get("display_name")
        if isinstance(name, str) and name.strip():
            self.display_name = name.strip()[:200]
        self.config = config  # saved as the author wrote it; defaults are filled in when it is used
        return {"ok": True}
