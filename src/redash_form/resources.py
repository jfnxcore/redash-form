# -*- coding: utf-8 -*-

from redash.handlers.api import api


def add_resource(app, *args, **kwargs):
    """
    After api.init_app() is called, api.app should be set by Flask (but it's not) so that
    further calls to add_resource() are handled immediately for the given app.
    """
    api.app = app
    try:
        api.add_org_resource(*args, **kwargs)
    except AssertionError:
        pass
