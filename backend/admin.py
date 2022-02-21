import logging

from flask_admin import Admin
from flask_admin.form import SecureForm
from flask_admin.model import typefmt
from flask_admin.contrib.peewee import ModelView
from flask_admin.contrib.peewee.form import CustomModelConverter

from wtforms import fields as wt_fields
from wtforms.validators import Optional

from app import app
from models import *


logger = logging.getLogger('mozhnossobakoi')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)


CustomModelConverter.defaults[InetField] = wt_fields.StringField


class PlaceAdmin(ModelView):
    column_list = ['kind', 'name', 'visible', 'last_seen', 'claimed', 'address', 'url']
    column_searchable_list = ['name', 'address']
    column_filters = ['kind', 'visible', 'claimed', 'announced']
    column_display_pk = False
    column_default_sort = ('id', True)
    list_template = 'admin/place_list.html'
    inline_models = [(Review, dict(form_args = dict(id = dict(validators = [Optional()]))))]  # flask-admin/issues/1718
    form_base_class = SecureForm
    form_excluded_columns = ['last_seen']
    form_overrides = dict(kind=wt_fields.SelectField)
    form_args = dict(kind=dict(choices=[
        ('hotel', 'hotel'),
        ('camp', 'camp'),
        ('cafe', 'cafe'),
        ('shop', 'shop'),
        ('park', 'park'),
        ('other', 'other')
    ]))
    form_widget_args = {
        'name': {
            'style': 'min-width: 50%'
        },
        'claim': {
            'rows': 5,
            'style': 'width: 98%'
        },
        'address': {
            'style': 'width: 98%'
        },
        'url': {
            'style': 'min-width: 50%'
        },
        'facebook': {
            'style': 'min-width: 50%'
        },
        'vk': {
            'style': 'min-width: 50%'
        }
    }

    def _bool_formatter(view, context, model, name):
        return typefmt.bool_formatter(view, getattr(model, name) is not None)

    column_formatters = {
        'address': _bool_formatter,
        'url': _bool_formatter
    }


admin = Admin(app, name='#можноссобакой', template_mode='bootstrap2')
admin.add_view(PlaceAdmin(Place))
