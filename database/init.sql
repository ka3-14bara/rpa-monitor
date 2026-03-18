-- RAW MESSAGES
CREATE TABLE raw_messages (
    message_id BIGINT PRIMARY KEY,
    text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RPA
CREATE TABLE rpa_errors (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT UNIQUE,

    project_number VARCHAR(3),
    stage VARCHAR(10),

    ex_type TEXT,
    ex_message TEXT,

    activity_type TEXT,
    activity_name TEXT,

    computer_name TEXT,
    component_id TEXT,

    screen_resolution TEXT,
    tries_count TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Jenkins
CREATE TABLE jenkins_errors (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT,

    project_number VARCHAR(3),
    stage VARCHAR(10),

    ex_type TEXT,
    ex_message TEXT,

    activity_block TEXT,
    jenkins_node TEXT,

    screen_resolution TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    UNIQUE (message_id, project_number, stage),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- индексы (ускорят фильтры в Spring)
CREATE INDEX idx_rpa_project ON rpa_errors(project_number);
CREATE INDEX idx_jenkins_project ON jenkins_errors(project_number);