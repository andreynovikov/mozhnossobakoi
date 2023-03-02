from collections import defaultdict

from flask import abort, jsonify, request
from marshmallow import ValidationError
from peewee import DoesNotExist, IntegrityError, PeeweeException

from app import app
from models import *
from tasks import notify_place_added


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
    filters = [
        Place.visible == True
    ]
    kind = request.args.getlist('kind')
    if len(kind):
        filters.append(Place.kind << kind)
    address = request.args.get('address')
    if address:
        filters.append(Place.address.startswith(address))
    page = request.args.get('page')
    query = (
        Place
        .select()
        .where(*filters)
        .order_by(Place.last_seen.desc())
    )
    count = query.count()
    if page and page.isdigit():
        page = int(page)
        query = query.paginate(page, 20)
    results = [p.serialize_list for p in query]
    return {
        'count': count,
        'page': page,
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

        notify_place_added.delay()

        return place.serialize

    except ValidationError as e:
        app.logger.error(e.messages)
        return jsonify(e.messages), 400
    except IntegrityError as e:
        app.logger.error(str(e))

@app.route('/api/v0/places/<place_id>/', methods=['GET'])
def retrive_place(place_id):
    try:
        place = Place.get(Place.id == place_id)
        return place.serialize
    except DoesNotExist:
        abort(404, description="Place not found")

@app.route('/api/v0/places/<place_id>/reviews/', methods=['POST'])
def create_review(place_id):
    app.logger.info('payload: %s', str(request.json))

    schema = ReviewCreateSchema()
    try:
        data = schema.load(request.json)
        app.logger.info('result: %s', str(data))
        place = Place.get(Place.id == place_id)
        data['place'] = place
        data['rating'] = Review.map_rating(data['rating'])
        data['visited_date'] = data['visited']
        data['ip'] = request.remote_addr

        review = Review.create(**data)

        return review.serialize

    except ValidationError as e:
        app.logger.error(e.messages)
        return jsonify(e.messages), 400
    except IntegrityError as e:
        app.logger.error(str(e))
    except DoesNotExist:
        abort(404, description="Place not found")

def cmp(a, b):
    return (a > b) - (a < b)

def compare_locations(a, b):
    if a[0].startswith('город'):
        if b[0].startswith('город'):
            return cmp(a, b)
        else:
            return -1
    elif b[0].startswith('город'):
        return 1
    else:
        return cmp(a, b)

@app.route('/api/v0/locations/', methods=['GET'])
def list_locations():
    query = (
        Place
        .select(Place.kind, Place.address)
        .where(Place.visible == True, Place.address.is_null(False), Place.address != '')
    )
    results = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for p in query:
        parts = [s.strip() for s in p.address.split(',')]
        if len(parts) > 1:
            if parts[1].startswith('город') or parts[1].endswith('район') or parts[1].endswith('область') \
               or parts[1].startswith('край') or parts[1].endswith('край'):
                results[parts[0]][parts[1]][p.kind] = results[parts[0]][parts[1]][p.kind] + 1
                continue
        results[parts[0]][''][p.kind] = results[parts[0]][''][p.kind] + 1
    return {
        'results': results
    }
