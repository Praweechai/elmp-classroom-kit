# ELMP Classroom kit

Shared front-end pieces for the **Mission Hospital Learning Classroom**: the staff learning screens of ELMP, built on two forked Open edX apps (Verawood).

| Repo | Role |
|------|------|
| [`frontend-app-learner-dashboard`](https://github.com/Praweechai/frontend-app-learner-dashboard) (fork, branch `elmp/verawood`) | Classroom home, certificates, CE hours |
| [`frontend-app-learning`](https://github.com/Praweechai/frontend-app-learning) (fork, branch `elmp/verawood`) | Course home and course player |
| **this repo** | Design tokens, React components, Portal API client, EN/TH messages, the Tutor plugin and the image build |

## Build an image

Images are built **only on GitHub Actions** (never on a laptop):

1. Actions → **build-image** → *Run workflow* → `image_tag` = `verawood-N`.
2. The job installs Tutor 22, enables `tutor/elmp_classroom.py`, runs `tutor images build mfe`, smoke-tests the image and pushes `ghcr.io/praweechai/elmp-mfe:verawood-N`.
3. On the machine running Open edX: `tutor config save --set MFE_DOCKER_IMAGE=ghcr.io/praweechai/elmp-mfe:verawood-N && tutor images pull mfe && tutor local stop mfe && tutor local start -d mfe`.

Rollback: `tutor config save --unset MFE_DOCKER_IMAGE` and `tutor plugins disable elmp_classroom` → stock Open edX screens.

## Rules

- Public repo: no secrets, no real names or hospital data. Hosts and keys come from runtime config.
- Pinned to Open edX **Verawood** (Tutor `>=22,<23`).
- Forks: plugin slots first; every upstream file we change is listed in the fork's `ELMP-CHANGES.md`.

Licence: AGPL-3.0, like the Open edX apps it extends.
