"""Settings hook called by Open edX at start-up (common and production)."""

MIDDLEWARE_PATH = "elmp_activity.middleware.ActivityScriptMiddleware"


def plugin_settings(settings):
    # Last in the list = closest to the view, so it sees the page before GZip etc.
    middleware = list(settings.MIDDLEWARE)
    if MIDDLEWARE_PATH not in middleware:
        middleware.append(MIDDLEWARE_PATH)
    settings.MIDDLEWARE = middleware
    # Switch: ELMP_ACTIVITY_ENABLED = False in a Tutor settings patch turns the script off.
    if not hasattr(settings, "ELMP_ACTIVITY_ENABLED"):
        settings.ELMP_ACTIVITY_ENABLED = True
