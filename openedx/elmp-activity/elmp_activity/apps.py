"""Open edX plugin app config: Open edX finds it through the "lms.djangoapp" entry point."""
from django.apps import AppConfig


class ElmpActivityConfig(AppConfig):
    name = "elmp_activity"
    verbose_name = "ELMP activity bridge"
    default_auto_field = "django.db.models.AutoField"

    # edx_django_utils.plugins reads this; "common" + "production" both call the same
    # plugin_settings(), which is safe to run twice.
    plugin_app = {
        "settings_config": {
            "lms.djangoapp": {
                "common": {"relative_path": "settings.common"},
                "production": {"relative_path": "settings.common"},
            },
        },
    }
