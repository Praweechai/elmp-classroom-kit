"""Shared test helpers: a runtime that records events, building a block, calling a JSON handler."""
import json
import pathlib

from webob import Request
from xblock.field_data import DictFieldData
from xblock.fields import ScopeIds
from xblock.test.toy_runtime import ToyRuntime

EXAMPLES = pathlib.Path(__file__).resolve().parent.parent / "schemas" / "examples" / "inf101"


def load(name):
    return json.loads((EXAMPLES / name).read_text(encoding="utf-8"))


class Runtime(ToyRuntime):
    def __init__(self):
        super().__init__(user_id="nok")
        self.events = []

    def publish(self, block, event_type, event_data):
        self.events.append((event_type, event_data))


def make(cls, block_type, config, user="nok"):
    ids = ScopeIds(user, block_type, "def-1", f"block-v1:ELMP+INF101+2026+type@{block_type}+block@b1")
    return Runtime().construct_xblock_from_class(cls, ids, DictFieldData({"config": config}))


def call(block, handler, body):
    res = getattr(block, handler)(Request.blank("/", method="POST", body=json.dumps(body).encode()))
    return json.loads(res.body)
