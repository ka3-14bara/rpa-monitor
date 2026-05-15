import re

# --- PROJECT PARSER ---
def extract_project_stage(text):
    """Извлекает номер проекта и стадию из текста сообщения (строгая пара строк)."""
    # Поиск паттернов вида 068_1P, 236_1P, 144_CBR_1P
    matches = re.findall(r'(\d{3})(?:_[A-Z]+)?_(\d+[A-Z])', text)
    if matches:
        return matches[0][0], matches[0][1]  # Возвращаем строго (проект, стадия)
    
    # Поиск слитных паттернов вида 2641P, 0090P, 0421P
    matches = re.findall(r'(\d{3})(\d+[A-Z])', text)
    if matches:
        return matches[0][0], matches[0][1]  # Возвращаем строго (проект, стадия)
        
    return None, None


def clean_log_text(text):
    """Удаляет из начала текста временные метки логирования Python/ТГ."""
    return re.sub(r'^(?:\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2},\d{3}\s*\|\s*[A-Z]+\s*\|\s*)+', '', text).strip()


def find_field(text, pattern, flag=0):
    """Утилита для безопасного поиска полей."""
    m = re.search(pattern, text, flag)
    return m.group(1).strip() if m else None


def get_ex_message(text):
    """Безопасно извлекает Ex Message до следующего ключевого блока."""
    return find_field(text, r'Ex Message:\s*(.*?)(?:Activity|Jenkins node|The primary|Computer name|Component ID|$)', re.S)


# --- RPA ---
def parse_rpa(text):
    text = clean_log_text(text)
    proj_num, stage = extract_project_stage(text)

    return {
        "project_number": proj_num,
        "stage": stage,
        "ex_type": find_field(text, r'Ex Type:\s*(.+)'),
        "ex_message": get_ex_message(text),
        "activity_type": find_field(text, r'Activity Type:\s*(.+)'),
        "activity_name": find_field(text, r'Activity Name:\s*(.+)'),
        "computer_name": find_field(text, r'Computer name:\s*(.+)'),
        "component_id": find_field(text, r'Component ID:\s*(.+)'),
        "screen_resolution": find_field(text, r'resolution.*:\s*(.+)', re.I),
        "tries_count": find_field(text, r'Tries count:\s*(.+)')
    }


# --- Jenkins ---
def parse_jenkins(text):
    text = clean_log_text(text)
    proj_num, stage = extract_project_stage(text)

    return {
        "project_number": proj_num,
        "stage": stage,
        "ex_type": find_field(text, r'Ex Type:\s*(.+)'),
        "ex_message": get_ex_message(text),
        "activity_block": find_field(text, r'Activity Block:\s*(.+)'),
        "jenkins_node": find_field(text, r'Jenkins node:\s*(.+)'),
        "screen_resolution": find_field(text, r'resolution.*:\s*(.+)', re.I)
    }


# --- TimeMonitoring ---
def parse_time_monitoring(text):
    text = clean_log_text(text)
    results = []

    ex_type = find_field(text, r'Ex Type:\s*(.+)')
    ex_message = get_ex_message(text)
    activity_block = find_field(text, r'Activity Block:\s*(.+)') or "TimeMonitoring"
    jenkins_node = find_field(text, r'Jenkins node:\s*(.+)')
    resolution = find_field(text, r'resolution.*:\s*(.+)', re.I)

    # Находим всех роботов внутри Ex Message (например, 2232P, 0062P)
    time_matches = re.findall(r'(\d{3})(\d+[A-Z])\s+работает', text)

    for project, stage in time_matches:
        results.append({
            "project_number": project,
            "stage": stage,
            "ex_type": ex_type,
            "ex_message": ex_message,
            "activity_block": activity_block,
            "jenkins_node": jenkins_node,
            "screen_resolution": resolution
        })

    if not results:
        results.append({
            "project_number": None, "stage": None, "ex_type": ex_type, "ex_message": ex_message,
            "activity_block": activity_block, "jenkins_node": jenkins_node, "screen_resolution": resolution
        })

    return results
