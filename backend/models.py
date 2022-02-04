from datetime import datetime

from peewee import Model
from peewee import Field, BooleanField, CharField, DateField, DateTimeField, FloatField, ForeignKeyField, TextField

from marshmallow import Schema, fields
from marshmallow.validate import Length, Range

from app import db


class BaseModel(Model):
    class Meta:
        database = db


class PositionSchema(Schema):
    lat = fields.Float(required=True, validate=Range(min=-90, max=90))
    lng = fields.Float(required=True, validate=Range(min=-180, max=180))


class Place(BaseModel):
    kind = CharField()
    name = CharField()
    latitude = FloatField()
    longitude = FloatField()
    visible = BooleanField(default=True, index=True)
    claimed = BooleanField(default=False)
    claim = TextField(null=True)
    url = CharField(null=True)
    instagram = CharField(null=True)

    @property
    def serialize_list(self):
        data = {
            'id': self.id,
            'kind': self.kind,
            'name': self.name,
            'position': {
                'lat': self.latitude,
                'lng': self.longitude
            },
            'claimed': self.claimed,
        }
        return data

    @property
    def serialize(self):
        data = self.serialize_list
        data['url'] = self.url
        data['instagram'] = self.instagram
        data['claim'] = self.claim
        data['reviews'] = [review.serialize for review in self.reviews.where(Review.is_published == True).order_by(Review.visited_date.desc())]
        return data


class PlaceSchema(Schema):
    id = fields.Int(dump_only=True)
    kind = fields.Str(required=True)
    name = fields.Str(required=True, validate=Length(max=100))
    position = fields.Nested(PositionSchema, many = False)
    visited = fields.Date(required=False, load_default=datetime.now())


class PlaceCreateSchema(PlaceSchema):
    description = fields.Str(required=True, validate=Length(max=10000))


class InetField(Field):
    field_type = 'inet'


class Review(BaseModel):
    place = ForeignKeyField(Place, backref='reviews')
    message = TextField()
    created_date = DateTimeField(default=datetime.now)
    visited_date = DateField()
    is_published = BooleanField(default=True, index=True)
    ip = InetField()

    @property
    def serialize(self):
        return {
            'id': self.id,
            'message': self.message,
            'created': self.created_date.isoformat(timespec='seconds'),
            'visited': self.visited_date.isoformat()
        }
