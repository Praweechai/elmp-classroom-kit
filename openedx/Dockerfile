# ELMP Open edX image (Plan 4 · F-121 · D-69). Built ONLY on GitHub (C-2): build-openedx.yml.
# A thin layer on the exact image the laptop already runs (Tutor 22.0.3 + Indigo), so nothing
# else changes and the laptop downloads only this layer.
# Rollback: unset DOCKER_IMAGE_OPENEDX on the laptop -> back to the base image.
ARG BASE_IMAGE=docker.io/overhangio/openedx:22.0.3-indigo
FROM ${BASE_IMAGE}

# H5P player XBlock (interactive video with "prevent skipping forward", flashcards, hotspots...).
# --no-deps: never let pip change Open edX's own pinned packages (h5p-xblock only needs XBlock).
ARG H5P_XBLOCK_VERSION=0.2.19
COPY --chown=app:app openedx/elmp-activity /openedx/elmp-activity
# XBlock "public" files are normally gathered by collectstatic when the base image is built; copy
# h5pxblock's into place so local_resource_url (/static/xblock/resources/h5pxblock/...) works.
RUN pip install --no-cache-dir --no-deps "h5p-xblock==${H5P_XBLOCK_VERSION}" /openedx/elmp-activity \
    && rm -rf /openedx/elmp-activity \
    && pkg="$(python -c 'import importlib.util as u, os; print(os.path.dirname(u.find_spec("h5pxblock").origin))')" \
    && mkdir -p /openedx/staticfiles/xblock/resources/h5pxblock \
    && cp -r "$pkg/public" /openedx/staticfiles/xblock/resources/h5pxblock/public

LABEL org.opencontainers.image.source="https://github.com/Praweechai/elmp-classroom-kit" \
      org.opencontainers.image.description="ELMP Open edX: base + h5p-xblock + elmp-activity"
