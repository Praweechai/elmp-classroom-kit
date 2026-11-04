"""
ELMP Classroom — Tutor plugin (Plan 3 · D-51/D-52 · R-12, R-14, R-15).

Points the two staff-facing MFEs at our forks and drops apps we do not serve.
The image name is NOT set here: CI sets MFE_DOCKER_IMAGE per release, the laptop
sets it in tutor-config.env. Undo: `tutor plugins disable elmp_classroom` and
unset MFE_DOCKER_IMAGE -> stock Open edX screens (D-57).
"""
from tutor import hooks
from tutormfe.hooks import MFE_APPS

OWNER = "Praweechai"
# Git branch or tag of each fork that goes into the image.
DASH_VERSION = "elmp/verawood"
LEARN_VERSION = "elmp/verawood"

# Not served by the Classroom: Discussion is off on every course (Plan 2 P2-3.04),
# profile and catalog are redirected to the Portal / Classroom home by Caddy.
UNUSED_MFES = ("discussions", "profile", "catalog")


@MFE_APPS.add()
def _elmp_forks(mfes):
    mfes["learner-dashboard"]["repository"] = (
        f"https://github.com/{OWNER}/frontend-app-learner-dashboard.git"
    )
    mfes["learner-dashboard"]["version"] = DASH_VERSION
    mfes["learning"]["repository"] = (
        f"https://github.com/{OWNER}/frontend-app-learning.git"
    )
    mfes["learning"]["version"] = LEARN_VERSION
    for name in UNUSED_MFES:
        mfes.pop(name, None)
    return mfes


hooks.Filters.ENV_PATCHES.add_items(
    [
        # Webpack heap cap so parallel MFE builds fit the 16 GB CI runner (R-14 §3).
        ("mfe-dockerfile-pre-npm-build", 'ENV NODE_OPTIONS="--max-old-space-size=6144"'),
    ]
)
