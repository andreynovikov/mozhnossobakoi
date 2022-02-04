from app import app, db
from models import *
from admin import *
from views import *
from api import *


if __name__ == '__main__':
    db.create_tables([Place, Review], safe=True)
    app.run()
