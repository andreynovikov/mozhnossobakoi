from celery import Celery
from celery.utils.log import get_task_logger

from telegram import Bot

from config import Configuration


logger = get_task_logger(__name__)

celery = Celery(__name__)
celery.config_from_object(Configuration.Celery)

bot = Bot(Configuration.Telegram.token)


@celery.task(ignore_result=True)
def notify_place_added():
    bot.send_message(Configuration.Telegram.dev_channel_id, "Добавено новое место")
