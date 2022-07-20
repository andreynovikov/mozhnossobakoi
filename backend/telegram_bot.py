import html
import json
import logging
import traceback

from datetime import datetime

from telegram import Bot, ReplyKeyboardMarkup, ReplyKeyboardRemove, Update, InlineKeyboardButton, InlineKeyboardMarkup, ParseMode
from telegram.ext import (
    Updater,
    CommandHandler,
    MessageHandler,
    Filters,
    ConversationHandler,
    CallbackContext,
    CallbackQueryHandler
)

from config import Configuration
from models import PLACE_KIND, Place, Review


# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())

settings = Configuration.Telegram

KIND, NAME, LOCATION, DESCRIPTION = range(4)

def addplace(update: Update, context: CallbackContext) -> int:
    """Starts the conversation and asks the user about place kind."""
    keyboard = [
        [InlineKeyboardButton(PLACE_KIND[0][1], callback_data=PLACE_KIND[0][0])],
        [InlineKeyboardButton(PLACE_KIND[1][1], callback_data=PLACE_KIND[1][0])],
        [InlineKeyboardButton(PLACE_KIND[2][1], callback_data=PLACE_KIND[2][0])],
        [InlineKeyboardButton(PLACE_KIND[3][1], callback_data=PLACE_KIND[3][0])],
        [
            InlineKeyboardButton(PLACE_KIND[4][1], callback_data=PLACE_KIND[4][0]),
            InlineKeyboardButton(PLACE_KIND[5][1], callback_data=PLACE_KIND[5][0]),
        ]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    update.message.reply_text(
        'Добрый день! Я задам несколько вопросов. '
        'Отправьте /cancel для окончания беседы.\n\n'
        'Какой тип места вы хотите добавить?',
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

    return KIND


def kind(update: Update, context: CallbackContext) -> int:
    """Stores the selected kind and asks for a name."""
    query = update.callback_query

    query.answer()

    user = query.from_user
    logger.info("%s: Kind: %s", user.first_name, query.data)
    context.user_data[KIND] = query.data

    query.edit_message_text(text='Отлично! Напишите название этого места.')

    return NAME


def name(update: Update, context: CallbackContext) -> int:
    """Stores the name and asks for a location."""
    user = update.message.from_user
    logger.info("%s: Name: %s", user.first_name, update.message.text)
    context.user_data[NAME] = update.message.text
    update.message.reply_text(
        'Теперь прикрепите его координаты или напишите /skip, чтобы пропустить этот шаг.'
    )

    return LOCATION


def location(update: Update, context: CallbackContext) -> int:
    """Stores the location and asks for description."""
    user = update.message.from_user
    location = update.message.location
    logger.info("%s: Location: %f , %f", user.first_name, location.latitude, location.longitude)
    context.user_data[LOCATION] = location
    update.message.reply_text(
        'Почти закончили!\n'
        'Опишите подробно, с какой собакой и на каких условиях вы там побывали. '
        'Если помните, укажите примерный месяц и год посещения.'
    )

    return DESCRIPTION


def skip_location(update: Update, context: CallbackContext) -> int:
    """Skips the location and asks for description."""
    user = update.message.from_user
    logger.info("%s: did not send a location.", user.first_name)
    update.message.reply_text(
        'Жаль, что вы не знаете его местоположение... '
        'Напишите тогда адрес или хотя бы город, где нахходится это место.\n'
        'Опишите подробно, с какой собакой и на каких условиях вы там побывали. '
        'Если помните, укажите примерный месяц и год посещения.'
    )

    return DESCRIPTION


def description(update: Update, context: CallbackContext) -> int:
    """Stores the info about the user and ends the conversation."""
    user = update.message.from_user
    logger.info("%s: Description: %s", user.first_name, update.message.text)
    context.user_data[DESCRIPTION] = update.message.text

    location = context.user_data.get(LOCATION)
    latitude = 0
    longitude = 0
    if location is not None:
        latitude = location.latitude
        longitude = location.longitude

    place = Place.create(
        kind=context.user_data.get(KIND),
        name=context.user_data.get(NAME),
        latitude=latitude,
        longitude=longitude,
        visible=location is not None
    )
    review = Review.create(
        place=place,
        message=context.user_data.get(DESCRIPTION),
        visited_date=datetime.now(),
        ip='127.0.0.1'
    )

    update.message.reply_text(
        'Спасибо за информацию! В ближайшее время мы её обработаем. Заглядывайте почаще.'
    )

    logger.info("Kind: %s", context.user_data.get(KIND))
    logger.info("Name: %s", context.user_data.get(NAME))
    logger.info("Location: %s", context.user_data.get(LOCATION))
    logger.info("Description: %s", context.user_data.get(DESCRIPTION))

    return ConversationHandler.END


def cancel(update: Update, context: CallbackContext) -> int:
    """Cancels and ends the conversation."""
    user = update.message.from_user
    logger.info("User %s canceled the conversation", user.first_name)
    update.message.reply_text(
        'До свидания! Надеюсь, мы ещё пообщаемся.', reply_markup=ReplyKeyboardRemove()
    )

    return ConversationHandler.END


def help(update: Update, context: CallbackContext) -> None:
    user = update.message.from_user
    logger.info("User %s asked for help", user.first_name)
    update.effective_message.reply_html(
        f'Добрый день, {user.first_name}!\n\n'
        'Это бот проекта <a href="https://можноссобакой.рф">#можноссобакой</a>.\n'
        'Вы можете сообщить ему о месте, куда можно с питомцем.',
        disable_web_page_preview=True
    )


def error_handler(update: object, context: CallbackContext) -> None:
    # Log the error before we do anything else, so we can see it even if something breaks.
    logger.error(msg="Exception while handling an update:", exc_info=context.error)

    # traceback.format_exception returns the usual python message about an exception, but as a
    # list of strings rather than a single string, so we have to join them together.
    tb_list = traceback.format_exception(None, context.error, context.error.__traceback__)
    tb_string = ''.join(tb_list)

    # Notify user about error
    update.message.reply_text(
        'Извините, что-то пошло не так! '
        'Мы разберёмся в ближайшее время, попробуйте заглянуть попозже.'
    )

    # Build the message with some markup and additional information about what happened.
    # You might need to add some logic to deal with messages longer than the 4096 character limit.
    update_str = update.to_dict() if isinstance(update, Update) else str(update)
    message = (
        f'An exception was raised while handling an update\n'
        f'<pre>update = {html.escape(json.dumps(update_str, indent=2, ensure_ascii=False))}'
        '</pre>\n\n'
        f'<pre>context.chat_data = {html.escape(str(context.chat_data))}</pre>\n\n'
        f'<pre>context.user_data = {html.escape(str(context.user_data))}</pre>\n\n'
        f'<pre>{html.escape(tb_string)}</pre>'
    )

    # Finally, send the message
    context.bot.send_message(chat_id=settings.dev_channel_id, text=message, parse_mode=ParseMode.HTML)


def main() -> None:
    bot = Bot(settings.token)
    bot.setMyCommands(settings.commands)

    """Run the bot."""
    # Create the Updater and pass it your bot's token.
    updater = Updater(settings.token)

    # Get the dispatcher to register handlers
    dispatcher = updater.dispatcher

    # Add conversation handler with the states KIND, NAME, LOCATION and DESCRIPTION
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('addplace', addplace)],
        states={
            KIND: [
                CallbackQueryHandler(kind)
                # MessageHandler(Filters.regex('^(hotel|camp|cafe|shop|park|other)$'), kind)
            ],
            NAME: [
                MessageHandler(Filters.text & ~Filters.command, name)
            ],
            LOCATION: [
                MessageHandler(Filters.location, location),
                CommandHandler('skip', skip_location),
            ],
            DESCRIPTION: [
                MessageHandler(Filters.text & ~Filters.command, description)
            ],
        },
        fallbacks=[CommandHandler('cancel', cancel)],
    )

    dispatcher.add_handler(conv_handler)
    dispatcher.add_handler(CommandHandler('help', help))

    # Register the error handler
    dispatcher.add_error_handler(error_handler)

    # Start the Bot
    updater.start_polling()

    # Run the bot until you press Ctrl-C or the process receives SIGINT,
    # SIGTERM or SIGABRT. This should be used most of the time, since
    # start_polling() is non-blocking and will stop the bot gracefully.
    updater.idle()


if __name__ == '__main__':
    main()
