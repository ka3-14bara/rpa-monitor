FROM python:3.11

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем содержимое локальной папки app в текущую директорию контейнера (/app)
# Это позволит избежать структуры app/app
COPY app ./app

# Указываем Python, что корень проекта находится в /app
ENV PYTHONPATH=/app

# Запускаем как модуль. Обратите внимание на точки вместо слешей
CMD ["python", "-m", "app.bot.bot"]
