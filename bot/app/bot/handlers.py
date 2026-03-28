from aiogram import Router, types
from app.services.error_service import process_message

router = Router()

@router.channel_post()
async def handle_channel_post(message: types.Message):
    await process_message(message)

@router.message()
async def handle_message(message: types.Message):
    await process_message(message)
