import datetime
import os

from peewee import fn

from app import app
from models import Place


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
    pages.append({
        'url': '',
        'modified': global_modified,
        'changefreq': 'daily',
        'priority': 0.5
    })

    source_path = os.path.join(os.path.dirname(path), 'src', 'About.js')
    pages.append({
        'url': 'about',
        'modified': datetime.date.fromtimestamp(os.path.getmtime(source_path)),
        'changefreq': 'monthly',
        'priority': 0.2
    })

    source_path = os.path.join(os.path.dirname(path), 'src', 'Help.js')
    pages.append({
        'url': 'help',
        'modified': datetime.date.fromtimestamp(os.path.getmtime(source_path)),
        'changefreq': 'monthly',
        'priority': 0.2
    })

    pages.append({
        'url': 'places',
        'modified': global_modified,
        'changefreq': 'daily',
        'priority': 0.8
    })

    for place in query:
        modified = place.last_seen if place.last_seen > datetime.date.min else global_modified
        pages.append({
            'url': 'places/{}'.format(place.id),
            'modified': modified,
            'changefreq': 'monthly',
            'priority': 0.5
        })

    return app.response_class(stream_template('sitemap.xml', pages=pages), mimetype='text/xml')
