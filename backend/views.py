import datetime
import logging
import os

from collections import defaultdict

from peewee import fn

from app import app
from models import Place


logger = logging.getLogger('mozhnossobakoi')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)


def stream_template(template_name, **context):
    app.update_template_context(context)
    t = app.jinja_env.get_template(template_name)
    rv = t.stream(context)
    rv.enable_buffering(5)
    return rv

@app.route("/sitemap.xml")
def sitemap():
    path = os.path.dirname(os.path.abspath(__file__))
    query = (
        Place
        .select()
        .where(Place.visible == True)
    )

    if query.exists():
        global_modified = Place.select(fn.MAX(Place.last_seen)).scalar()
    else:
        global_modified = datetime.date.today()

    pages = []

    # index page
    pages.append({
        'url': '',
        'modified': global_modified,
        'changefreq': 'daily',
        'priority': 0.5
    })

    # about page
    source_path = os.path.join(os.path.dirname(path), 'src', 'About.js')
    pages.append({
        'url': 'about',
        'modified': datetime.date.fromtimestamp(os.path.getmtime(source_path)),
        'changefreq': 'monthly',
        'priority': 0.2
    })

    # help page
    source_path = os.path.join(os.path.dirname(path), 'src', 'Help.js')
    pages.append({
        'url': 'help',
        'modified': datetime.date.fromtimestamp(os.path.getmtime(source_path)),
        'changefreq': 'monthly',
        'priority': 0.2
    })

    # place list page
    pages.append({
        'url': 'places',
        'modified': global_modified,
        'changefreq': 'daily',
        'priority': 0.7
    })

    # individual place pages
    # calculate kind and address matrix
    all_kinds = defaultdict(lambda: datetime.date.min)
    addresses = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: datetime.date.min)))
    for place in query:
        modified = place.last_seen if place.last_seen > datetime.date.min else global_modified

        if all_kinds[place.kind] < modified:
            all_kinds[place.kind] = modified

        if place.address:
            parts = [s.strip() for s in place.address.split(',')]
            if len(parts) > 1:
                if parts[1].startswith('город') or parts[1].endswith('район') or parts[1].endswith('область') \
                   or parts[1].startswith('край') or parts[1].endswith('край'):
                    if addresses[parts[0]][parts[1]][place.kind] < modified:
                        addresses[parts[0]][parts[1]][place.kind] = modified
            else:
                if addresses[parts[0]][''][place.kind] < modified:
                    addresses[parts[0]][''][place.kind] = modified

        pages.append({
            'url': 'places/{}'.format(place.id),
            'modified': modified,
            'changefreq': 'monthly',
            'priority': 0.5
        })

    for location in addresses:
        location_modified = datetime.date.min
        for sublocation in addresses[location]:
            sublocation_modified = datetime.date.min
            kinds = defaultdict(lambda: datetime.date.min)
            # sub location page with kinds
            for kind, modified in addresses[location][sublocation].items():
                if sublocation_modified < modified:
                    sublocation_modified = modified
                if location_modified < modified:
                    location_modified = modified
                if kinds[kind] < modified:
                    kinds[kind] = modified
                if sublocation:
                    pages.append({
                        'url': 'places?action={}&address={}, {}'.format(kind, location, sublocation),
                        'modified': addresses[location][sublocation][kind],
                        'changefreq': 'weekly',
                        'priority': 0.8
                    })
            # sub location page without kind
            if sublocation:
                pages.append({
                    'url': 'places?address={}, {}'.format(location, sublocation),
                    'modified': sublocation_modified,
                    'changefreq': 'weekly',
                    'priority': 0.8
                })
        # location page with kinds
        for kind, modified in kinds.items():
            pages.append({
                'url': 'places?action={}&address={}'.format(kind, location),
                'modified': modified,
                'changefreq': 'weekly',
                'priority': 0.8
            })
        # location page without kind
        pages.append({
            'url': 'places?address={}'.format(location),
            'modified': location_modified,
            'changefreq': 'weekly',
            'priority': 0.8
        })

    # kind pages
    for kind, modified in all_kinds.items():
        pages.append({
            'url': 'places?action={}'.format(kind),
            'modified': modified,
            'changefreq': 'weekly',
            'priority': 0.8
        })

    return app.response_class(stream_template('sitemap.xml', pages=pages), mimetype='text/xml')
