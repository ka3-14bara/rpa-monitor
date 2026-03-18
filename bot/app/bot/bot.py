import asyncio
from aiogram import Bot, Dispatcher
from app.config.settings import settings
from app.bot.handlers import router

bot = Bot(token=settings.BOT_TOKEN)
dp = Dispatcher()

dp.include_router(router)

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())