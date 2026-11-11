"""Block data formats (doc 02 §9): every example is valid, broken inputs are rejected."""
import json
import pathlib

import pytest

jsonschema = pytest.importorskip("jsonschema")
referencing = pytest.importorskip("referencing")

SCHEMAS = pathlib.Path(__file__).resolve().parent.parent / "schemas"
KIND = {"quiz": "elmp_quiz", "video": "elmp_video", "activity": "elmp_activity"}


def _load():
    schemas = {p.name: json.loads(p.read_text(encoding="utf-8")) for p in SCHEMAS.glob("*.schema.json")}
    registry = referencing.Registry().with_resources(
        [(s["$id"], referencing.Resource.from_contents(s)) for s in schemas.values()]
    )
    return schemas, registry


SCHEMA_FILES, REGISTRY = _load()


def validator(block):
    return jsonschema.Draft202012Validator(SCHEMA_FILES[f"{block}.schema.json"], registry=REGISTRY)


@pytest.mark.parametrize("name", sorted(SCHEMA_FILES))
def test_schema_is_valid(name):
    jsonschema.Draft202012Validator.check_schema(SCHEMA_FILES[name])


EXAMPLES = sorted((SCHEMAS / "examples").rglob("*.json"))


@pytest.mark.parametrize("path", EXAMPLES, ids=lambda p: p.name)
def test_example_is_valid(path):
    block = KIND[path.name.split("-")[0]]
    errors = [e.message for e in validator(block).iter_errors(json.loads(path.read_text(encoding="utf-8")))]
    assert not errors, errors


@pytest.mark.parametrize("block,data", [
    ("elmp_quiz", {"mode": "exam", "questions": []}),
    ("elmp_quiz", {"mode": "test", "questions": [{"id": "q1", "prompt": "?", "choices": [{"id": "a", "text": "A"}, {"id": "b", "text": "B"}], "answer": ["a"]}]}),
    ("elmp_activity", {"kind": "flip", "cards": []}),  # flip stays in the content kit (D-85)
    ("elmp_activity", {"kind": "order", "items": ["a", "b", "c"], "spots": []}),
    ("elmp_video", {"src": "http://x/a.mp4", "seconds": 5, "captions": []}),
])
def test_broken_input_is_rejected(block, data):
    assert not validator(block).is_valid(data)


def test_examples_cover_all_activity_kinds():
    kinds = {json.loads(p.read_text(encoding="utf-8"))["kind"] for p in EXAMPLES if p.name.startswith("activity-")}
    assert kinds == {"hotspot", "order", "scenario", "sort", "deck", "practice"}
