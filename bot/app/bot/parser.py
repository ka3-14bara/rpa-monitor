import re

# --- PROJECT PARSER ---
def extract_project_stage(text):
    results = []

    # 018_1P
    matches = re.findall(r'(\d{3})_(\d+[A-Z])', text)
    results.extend(matches)

    # 0231P
    matches = re.findall(r'(\d{3})(\d+[A-Z])', text)
    results.extend(matches)

    # 077_097_1C
    multi = re.search(r'(\d{3})_(\d{3})_(\d+[A-Z])', text)
    if multi:
        p1, p2, stage = multi.groups()
        results.append((p1, stage))
        results.append((p2, stage))

    return list(set(results)) if results else [(None, None)]


# --- RPA ---
def parse_rpa(text):
    def find(pattern):
        m = re.search(pattern, text)
        return m.group(1).strip() if m else None

    proj_stage = extract_project_stage(text)[0]

    return {
        "project_number": proj_stage[0],
        "stage": proj_stage[1],
        "ex_type": find(r'Ex Type: (.+)'),
        "ex_message": find(r'Ex Message: (.+)'),
        "activity_type": find(r'Activity Type: (.+)'),
        "activity_name": find(r'Activity Name: (.+)'),
        "computer_name": find(r'Computer name: (.+)'),
        "component_id": find(r'Component ID: (.+)'),
        "screen_resolution": find(r'resolution.*: (.+)'),
        "tries_count": find(r'Tries count: (.+)')
    }


# --- Jenkins ---
def parse_jenkins(text):
    def find(pattern):
        m = re.search(pattern, text, re.S)
        return m.group(1).strip() if m else None

    return {
        "ex_type": find(r'Ex Type: (.+)'),
        "ex_message": find(r'Ex Message:([\s\S]+?)Activity'),
        "activity_block": find(r'Activity Block: (.+)'),
        "jenkins_node": find(r'Jenkins node: (.+)'),
        "screen_resolution": find(r'resolution.*: (.+)')
    }


# --- TimeMonitoring ---
def parse_time_monitoring(text):
    results = []

    matches = re.findall(r'(\d{3})(\d)([PD])', text)

    for m in matches:
        project = m[0]
        stage = m[1] + m[2]

        line = re.search(rf'{project}{stage}.*', text)

        results.append({
            "project_number": project,
            "stage": stage,
            "ex_type": "Business Exception",
            "ex_message": line.group(0) if line else text,
            "activity_block": "TimeMonitoring",
            "jenkins_node": None,
            "screen_resolution": None
        })

    return results