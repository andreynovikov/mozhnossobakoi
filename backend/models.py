import logging

from datetime import datetime, date

from playhouse.signals import Model, pre_save, post_save, post_delete
from peewee import Field, BooleanField, CharField, DateField, DateTimeField, FloatField, ForeignKeyField, IntegerField, TextField

from marshmallow import Schema, fields
from marshmallow.validate import Length, Range

from app import db


logger = logging.getLogger('mozhnossobakoi')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)


PLACE_KIND = [
    ("hotel", "Отель / аппартаменты"),
    ("camp", "База отдыха / загородный клуб"),
    ("cafe", "Кафе / бар / ресторан"),
    ("park", "Парк / зона отдыха / маршрут"),
    ("shop", "Магазин"),
    ("other", "Другое")
]


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
    last_seen = DateField()
    announced = DateField(null=True)
    claimed = DateField(null=True)
    claim = TextField(null=True)
    address = CharField(null=True)
    phone = CharField(null=True)
    url = CharField(null=True)
    instagram = CharField(null=True)
    telegram = CharField(null=True)
    facebook = CharField(null=True)
    vk = CharField(null=True)

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
            'last_seen': self.last_seen.isoformat(),
            'claimed': self.claimed,
            'claim': self.claim,
            'address': self.address,
            'phone': self.phone,
            'url': self.url,
            'instagram': self.instagram,
            'telegram': self.telegram,
            'facebook': self.facebook,
            'vk': self.vk
        }
        return data

    @property
    def serialize(self):
        data = self.serialize_list
        data['reviews'] = [review.serialize for review in self.reviews.where(Review.is_published == True).order_by(Review.visited_date.desc())]
        return data


@pre_save(sender=Place)
def on_place_save(model_class, instance, created):
    last_seen = [date.min]
    if instance.reviews:
        latest_review = instance.reviews.where(Review.is_published == True).order_by(Review.visited_date.desc()).first()
        if latest_review is not None:
            last_seen.append(latest_review.visited_date)
    if instance.claimed:
        last_seen.append(instance.claimed)
    instance.last_seen = max(last_seen)


class PlaceSchema(Schema):
    id = fields.Int(dump_only=True)
    kind = fields.Str(required=True)
    name = fields.Str(required=True, validate=Length(max=100))
    position = fields.Nested(PositionSchema, many = False)


class PlaceCreateSchema(PlaceSchema):
    description = fields.Str(required=True, validate=Length(max=10000))
    visited = fields.Date(required=False, load_default=datetime.now())


class InetField(Field):
    field_type = 'inet'


class Review(BaseModel):
    place = ForeignKeyField(Place, backref='reviews')
    message = TextField()
    source = CharField(null=True)
    rating = IntegerField(default=0)
    created_date = DateTimeField(default=datetime.now)
    visited_date = DateField()
    is_published = BooleanField(default=True, index=True)
    ip = InetField()

    @staticmethod
    def map_rating(rating):
        if rating == 'good':
            return 5
        elif rating == 'bad':
            return -2
        else:
            return 0

    @property
    def serialize(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'message': self.message,
            'created': self.created_date.isoformat(timespec='seconds'),
            'visited': self.visited_date.isoformat()
        }


class ReviewCreateSchema(Schema):
    message = fields.Str(required=True, validate=Length(max=10000))
    rating = fields.Str(required=False, validate=Length(max=5))
    visited = fields.Date(required=False, load_default=datetime.now())


@post_save(sender=Review)
def on_review_save(model_class, instance, created):
    # re-save place to update last_seen property
    instance.place.save()


@post_delete(sender=Review)
def on_review_delete(model_class, instance):
    # re-save place to update last_seen property
    instance.place.save()
