from flask import abort, jsonify, request
from marshmallow import ValidationError
from peewee import fn, JOIN, DoesNotExist, PeeweeException

from app import app
from models import *


@app.errorhandler(PeeweeException)
def handle_data_error(e):
    return jsonify(error=str(e)), 400

@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

"""
{prefix}/
GET list
POST create

{prefix}/{lookup}/
GET retrieve
PUT update
PATCH partial_update
DELETE destroy
"""

@app.route('/api/v0/places/', methods=['GET'])
def list_places():
    query = (
        Place
        .select(
            Place,
            fn.Count(Review.id).alias('review_count'),
            fn.MAX(Review.visited_date).alias('last_visited'),
        )
        .join(
            Review,
            JOIN.LEFT_OUTER,
            on=((Place.id == Review.place_id) & (Review.is_published == True))
        )
        .group_by(
            Place
        )
        .where(
            Place.visible == True
        )
        .order_by(
            fn.MAX(Review.visited_date).desc(nulls='LAST')
        )
    )
    results = [p.serialize_list for p in query]
    return {
        'results': results
    }

@app.route('/api/v0/places/', methods=['POST'])
def create_place():
    app.logger.info('payload: %s', str(request.json))

    schema = PlaceCreateSchema()
    try:
        data = schema.load(request.json)
        app.logger.info('result: %s', str(data))
        data['latitude'] = data['position']['lat']
        data['longitude'] = data['position']['lng']

        place = Place.create(**data)
        review = Review.create(place=place, message=data['description'], visited_date=data['visited'], ip=request.remote_addr)

        return place.serialize

    except ValidationError as e:
        app.logger.error(e.messages)
        return jsonify(e.messages), 400
    except peewee.IntegrityError as e:
        app.logger.error(str(e))

@app.route('/api/v0/places/<place_id>/', methods=['GET'])
def retrive_place(place_id):
    try:
        place = Place.get(Place.id == place_id)
        return place.serialize
    except DoesNotExist:
        abort(404, description="Place not found")

