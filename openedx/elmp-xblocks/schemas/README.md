# ELMP block data formats

JSON Schema (2020-12) for the three lesson blocks (Portal doc `plan-5/02-technical.md` §9, decisions D-87 / D-91).

| File | Block |
|------|-------|
| `common.schema.json` | shared parts: ids, text (`"..."` or `{en, th}`), illustration names |
| `elmp_quiz.schema.json` | quiz — `check` (not graded) or `exam` (graded) |
| `elmp_video.schema.json` | video — completes at 95 % watched |
| `elmp_activity.schema.json` | activity — hotspot, order, scenario, sort, deck, practice |

`examples/inf101/` = the prototype's INF101 course in these formats. `tests/test_schemas.py` checks every example and some broken inputs. `olxlib` and the Studio editor validate against the same files.

Quiz `answer` and `explain` stay on the server; the browser only gets questions without them.
