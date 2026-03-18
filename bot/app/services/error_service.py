from app.bot.parser import *
from app.db.queries import *
from app.utils.logger import logger

async def process_message(message):
    text = message.text

    logger.info(f"Message received: {message.message_id}")

    await save_raw(message.message_id, text)

    try:
        # --- RPA ---
        if "RPA prod ERROR" in text:
            data = parse_rpa(text)

            if not data["project_number"]:
                logger.warning(f"RPA NOT PARSED: {text}")

            await insert_rpa(message.message_id, data)

        # --- TimeMonitoring ---
        elif "TimeMonitoring" in text:
            items = parse_time_monitoring(text)

            if not items:
                logger.warning(f"TM NOT PARSED: {text}")

            for item in items:
                await insert_jenkins(message.message_id, item)

        # --- Jenkins ---
        elif "Jenkins" in text:
            data = parse_jenkins(text)
            projects = extract_project_stage(text)

            for proj, stage in projects:
                data_copy = data.copy()
                data_copy["project_number"] = proj
                data_copy["stage"] = stage

                await insert_jenkins(message.message_id, data_copy)

        else:
            logger.info("Skipped message")

    except Exception as e:
        logger.error(f"ERROR: {e}")
        logger.error(text)