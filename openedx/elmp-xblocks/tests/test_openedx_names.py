"""Open edX reads these names on every block as settings (dates, grading, access). A method with one of
these names breaks the course tree build (V-7.01: `start` handler → "'>' not supported between 'method'
and 'datetime'", empty course outline)."""
import inspect

import pytest

pytest.importorskip("xblock")
from elmp_xblocks.activity import ElmpActivityBlock
from elmp_xblocks.quiz import ElmpQuizBlock
from elmp_xblocks.video import ElmpVideoBlock

OPENEDX_FIELDS = {
    "start", "due", "end", "format", "graded", "graceperiod", "visible_to_staff_only", "group_access",
    "days_early_for_beta", "show_correctness", "hide_after_due", "showanswer", "rerandomize", "max_attempts",
    "self_paced", "in_entrance_exam", "user_partitions", "static_asset_path", "use_latex_compiler",
    "due_date_display_format", "submission_start", "submission_due", "course_edit_method", "giturl",
    "xqa_key", "reset_key", "edxnotes", "edxnotes_visibility", "hide_from_toc", "is_entrance_exam",
}


@pytest.mark.parametrize("block", [ElmpActivityBlock, ElmpQuizBlock, ElmpVideoBlock])
def test_no_method_uses_an_openedx_field_name(block):
    clash = sorted(n for n in OPENEDX_FIELDS if inspect.isfunction(inspect.getattr_static(block, n, None)))
    assert clash == [], f"{block.__name__} methods clash with Open edX fields: {clash}"
