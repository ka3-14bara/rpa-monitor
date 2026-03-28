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

    UNIQUE (message_id, project_number, stage),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 

    is_read BOOLEAN DEFAULT FALSE,
);

-- USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token TEXT,
    username VARCHAR(255),
    expiry_date TIMESTAMP
);

-- USER PROJECTS
CREATE TABLE user_projects (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255),
    project_number VARCHAR(10)
);

-- индексы (ускорят фильтры в Spring)
CREATE INDEX idx_rpa_project ON rpa_errors(project_number);
CREATE INDEX idx_jenkins_project ON jenkins_errors(project_number);