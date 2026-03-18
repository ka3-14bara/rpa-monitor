from datetime import datetime
from app.db.database import get_connection

# --- RAW ---
async def save_raw(message_id, text):
    conn = await get_connection()

    await conn.execute("""
        INSERT INTO raw_messages (message_id, text, created_at)
        VALUES ($1,$2,$3)
        ON CONFLICT (message_id) DO NOTHING
    """, message_id, text, datetime.now())

    await conn.close()


# --- RPA ---
async def insert_rpa(message_id, data):
    conn = await get_connection()

    await conn.execute("""
        INSERT INTO rpa_errors (
            message_id, project_number, stage,
            ex_type, ex_message,
            activity_type, activity_name,
            computer_name, component_id,
            screen_resolution, tries_count, created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (message_id) DO NOTHING
    """,
        message_id,
        data.get("project_number"),
        data.get("stage"),
        data.get("ex_type"),
        data.get("ex_message"),
        data.get("activity_type"),
        data.get("activity_name"),
        data.get("computer_name"),
        data.get("component_id"),
        data.get("screen_resolution"),
        data.get("tries_count"),
        datetime.now(),
        False
    )

    await conn.close()


# --- Jenkins ---
async def insert_jenkins(message_id, data):
    conn = await get_connection()

    await conn.execute("""
        INSERT INTO jenkins_errors (
            message_id, project_number, stage,
            ex_type, ex_message,
            activity_block, jenkins_node,
            screen_resolution, created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (message_id, project_number, stage) DO NOTHING
    """,
        message_id,
        data.get("project_number"),
        data.get("stage"),
        data.get("ex_type"),
        data.get("ex_message"),
        data.get("activity_block"),
        data.get("jenkins_node"),
        data.get("screen_resolution"),
        datetime.now(),
        False
    )

    await conn.close()