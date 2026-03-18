import asyncpg
from app.config.settings import settings

async def get_connection():
    return await asyncpg.connect(settings.DB_URL)