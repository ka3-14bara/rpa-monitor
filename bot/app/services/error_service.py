from app.bot.parser import *
from app.db.queries import *
from app.utils.logger import logger

async def process_message(message):
    text = message.text

    logger.info(f"Message received: {message.message_id}")

    # Сохраняем сырое сообщение
    await save_raw(message.message_id, text)

    try:
        # --- RPA ---
        if "RPA prod ERROR" in text:
            data = parse_rpa(text)

            if not data.get("project_number"):
                logger.warning(f"RPA NOT PARSED: {text}")

            await insert_rpa(message.message_id, data)

        # --- TimeMonitoring ---
        elif "TimeMonitoring" in text:
            items = parse_time_monitoring(text)

            if not items or items[0]["project_number"] is None:
                logger.warning(f"TM NOT PARSED: {text}")

            # Передаем ВЕСЬ список items сразу, без цикла!
            # Функция insert_jenkins внутри db.py сама обработает этот список.
            await insert_jenkins(message.message_id, items)

        # --- Jenkins ---
        elif "Jenkins" in text:
            #parse_jenkins уже содержит внутри себя вызов extract_project_stage
            # и возвращает готовый словарь с заполненными project_number и stage.
            data = parse_jenkins(text)

            if not data.get("project_number"):
                logger.warning(f"JENKINS NOT PARSED: {text}")

            # Передаем готовый словарь напрямую в функцию БД
            await insert_jenkins(message.message_id, data)

        else:
            logger.info("Skipped message")

    except Exception as e:
        logger.error(f"ERROR inside process_message: {e}")
        logger.error(text)
