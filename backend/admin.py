from flask_admin import Admin
from flask_admin.model import typefmt
from flask_admin.contrib.peewee import ModelView
from flask_admin.contrib.peewee.form import CustomModelConverter

from wtforms import fields as wt_fields
from wtforms.validators import Optional

from app import app
from models import *


CustomModelConverter.defaults[InetField] = wt_fields.StringField


class PlaceAdmin(ModelView):
    create_modal = True
    column_list = ['kind', 'name', 'visible', 'claimed', 'url']
    column_searchable_list = ['name']
    column_filters = ['kind', 'visible', 'claimed']
    column_display_pk = False
    column_default_sort = ('id', True)
    inline_models = [(Review, dict(form_args = dict(id = dict(validators = [Optional()]))))]  # flask-admin/issues/1718
    form_overrides = dict(kind=wt_fields.SelectField)
    form_args = dict(kind=dict(choices=[
        ('hotel', 'hotel'),
        ('camp', 'camp'),
        ('cafe', 'cafe'),
        ('shop', 'shop'),
        ('park', 'park'),
        ('other', 'other')
    ]))

    def _url_formatter(view, context, model, name):
        return typefmt.bool_formatter(view, model.url is not None)

    column_formatters = {
        'url': _url_formatter
    }


admin = Admin(app, name='#можноссобакой', template_mode='bootstrap2')
admin.add_view(PlaceAdmin(Place))
