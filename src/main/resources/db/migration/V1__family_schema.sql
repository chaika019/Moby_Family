CREATE TABLE family_account (
    event_sequence BIGINT NOT NULL DEFAULT 0,
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    family_name VARCHAR(255) NOT NULL,
    parent_main_balance NUMERIC(19,2) NOT NULL,
    held_balance NUMERIC(19,2) NOT NULL,
    cashback_accumulated NUMERIC(19,2) NOT NULL,
    subscription_active BOOLEAN NOT NULL,
    subscription_fee NUMERIC(19,2) NOT NULL,
    insurance_active BOOLEAN NOT NULL,
    next_subscription_date DATE NOT NULL
);

CREATE TABLE child_profile (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    family_id UUID NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    card_balance NUMERIC(19,2) NOT NULL,
    moby_coins INTEGER NOT NULL,
    card_frozen BOOLEAN NOT NULL,
    privacy_mode BOOLEAN NOT NULL,
    active_mascot_skin VARCHAR(255) NOT NULL,
    active_pay_sound VARCHAR(255) NOT NULL,
    active_card_skin VARCHAR(255) NOT NULL,
    daily_limit NUMERIC(19,2) NOT NULL,
    monthly_limit NUMERIC(19,2) NOT NULL,
    spent_today NUMERIC(19,2) NOT NULL,
    spent_month NUMERIC(19,2) NOT NULL,
    spending_date DATE NOT NULL,
    spending_month DATE NOT NULL,
    online_payments_allowed BOOLEAN NOT NULL,
    belarus_only BOOLEAN NOT NULL,
    transfers_allowed BOOLEAN NOT NULL,
    notifications_enabled BOOLEAN NOT NULL,
    card_type VARCHAR(255) NOT NULL,
    card_last_four VARCHAR(255) NOT NULL
);

CREATE TABLE app_user (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    family_id UUID NOT NULL,
    child_id UUID,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(255) NOT NULL
);

CREATE TABLE spending_rule (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    category_code VARCHAR(255) NOT NULL,
    blocked BOOLEAN NOT NULL
);

CREATE TABLE transaction_record (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    merchant_name VARCHAR(255) NOT NULL,
    mcc_category VARCHAR(255) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    cashback_earned NUMERIC(19,2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    secret_gift_mode BOOLEAN NOT NULL,
    receipt_items_json TEXT NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE sos_checkout_request (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    missing_amount NUMERIC(19,2) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    country_code VARCHAR(255) NOT NULL,
    online BOOLEAN NOT NULL
);

CREATE TABLE chore_task (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    reward_byn NUMERIC(19,2) NOT NULL,
    reward_coins INTEGER NOT NULL,
    status VARCHAR(255) NOT NULL,
    photo_proof_url VARCHAR(255)
);

CREATE TABLE piggy_bank (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_amount NUMERIC(19,2) NOT NULL,
    current_amount NUMERIC(19,2) NOT NULL,
    parent_match_percent INTEGER NOT NULL,
    battle BOOLEAN NOT NULL,
    opponent_name VARCHAR(255),
    opponent_progress NUMERIC(19,2) NOT NULL
);

CREATE TABLE long_term_deposit (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    plan_type VARCHAR(255) NOT NULL,
    initial_deposit NUMERIC(19,2) NOT NULL,
    current_balance NUMERIC(19,2) NOT NULL,
    buffer_balance NUMERIC(19,2) NOT NULL,
    monthly_auto_pay_parent1 NUMERIC(19,2) NOT NULL,
    monthly_auto_pay_parent2 NUMERIC(19,2) NOT NULL,
    interest_rate NUMERIC(19,2) NOT NULL,
    opened_on DATE NOT NULL,
    next_accrual_date DATE NOT NULL,
    next_rollover_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    projected_final_amount NUMERIC(19,2) NOT NULL,
    consecutive_months INTEGER NOT NULL,
    grant_eligible BOOLEAN NOT NULL,
    grant_paid BOOLEAN NOT NULL,
    adult_package_accepted BOOLEAN NOT NULL,
    status VARCHAR(255) NOT NULL,
    gift_token VARCHAR(255) NOT NULL
);

CREATE TABLE split_bill (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    payer_child_id UUID,
    friend_name VARCHAR(255) NOT NULL,
    item_title VARCHAR(255) NOT NULL,
    share_amount NUMERIC(19,2) NOT NULL,
    paid BOOLEAN NOT NULL,
    debtor_meme_badge VARCHAR(255) NOT NULL
);

CREATE TABLE reward_shop_item (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    family_id UUID,
    item_type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    asset_code VARCHAR(255) NOT NULL,
    cost_coins INTEGER NOT NULL,
    rarity VARCHAR(255) NOT NULL
);

CREATE TABLE reward_ownership (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    item_id UUID NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE quiz_completion (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    quiz_id VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE qr_login_token (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL
);

CREATE TABLE allowance_schedule (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    child_id UUID NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    day_of_month INTEGER NOT NULL,
    next_payment_date DATE NOT NULL,
    active BOOLEAN NOT NULL,
    last_status VARCHAR(255) NOT NULL
);

CREATE TABLE idempotency_record (
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    user_id UUID NOT NULL,
    request_key VARCHAR(255) NOT NULL,
    fingerprint VARCHAR(255) NOT NULL,
    response_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE family_event (
    event_sequence BIGINT NOT NULL,
    id UUID PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    family_id UUID NOT NULL,
    child_id UUID,
    event_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE app_user ADD CONSTRAINT uq_user_email UNIQUE (email);
ALTER TABLE app_user ADD CONSTRAINT uq_user_child UNIQUE (child_id);
ALTER TABLE spending_rule ADD CONSTRAINT uq_rule UNIQUE (child_id, category_code);
ALTER TABLE long_term_deposit ADD CONSTRAINT uq_deposit_child UNIQUE (child_id);
ALTER TABLE long_term_deposit ADD CONSTRAINT uq_gift_token UNIQUE (gift_token);
ALTER TABLE sos_checkout_request ADD CONSTRAINT uq_sos_transaction UNIQUE (transaction_id);
ALTER TABLE reward_ownership ADD CONSTRAINT uq_owned UNIQUE (child_id, item_id);
ALTER TABLE quiz_completion ADD CONSTRAINT uq_quiz UNIQUE (child_id, quiz_id);
ALTER TABLE qr_login_token ADD CONSTRAINT uq_qr_token UNIQUE (token_hash);
ALTER TABLE idempotency_record ADD CONSTRAINT uq_idempotency UNIQUE (user_id, request_key);
ALTER TABLE family_account ADD CONSTRAINT ck_parent_balances CHECK (parent_main_balance >= 0 AND held_balance >= 0 AND parent_main_balance >= held_balance);
ALTER TABLE child_profile ADD CONSTRAINT ck_child_balances CHECK (card_balance >= 0 AND moby_coins >= 0 AND spent_today >= 0 AND spent_month >= 0);
ALTER TABLE piggy_bank ADD CONSTRAINT ck_piggy_amounts CHECK (current_amount >= 0 AND target_amount > 0 AND parent_match_percent BETWEEN 0 AND 100);
ALTER TABLE long_term_deposit ADD CONSTRAINT ck_deposit_amounts CHECK (current_balance >= 0 AND buffer_balance >= 0);
ALTER TABLE child_profile ADD CONSTRAINT fk_child_profile_family_id FOREIGN KEY (family_id) REFERENCES family_account(id);
CREATE INDEX idx_child_profile_family_id ON child_profile (family_id);
ALTER TABLE app_user ADD CONSTRAINT fk_app_user_family_id FOREIGN KEY (family_id) REFERENCES family_account(id);
CREATE INDEX idx_app_user_family_id ON app_user (family_id);
ALTER TABLE app_user ADD CONSTRAINT fk_app_user_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_app_user_child_id ON app_user (child_id);
ALTER TABLE spending_rule ADD CONSTRAINT fk_spending_rule_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_spending_rule_child_id ON spending_rule (child_id);
ALTER TABLE transaction_record ADD CONSTRAINT fk_transaction_record_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_transaction_record_child_id ON transaction_record (child_id);
ALTER TABLE sos_checkout_request ADD CONSTRAINT fk_sos_checkout_request_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_sos_checkout_request_child_id ON sos_checkout_request (child_id);
ALTER TABLE sos_checkout_request ADD CONSTRAINT fk_sos_checkout_request_transaction_id FOREIGN KEY (transaction_id) REFERENCES transaction_record(id);
CREATE INDEX idx_sos_checkout_request_transaction_id ON sos_checkout_request (transaction_id);
ALTER TABLE chore_task ADD CONSTRAINT fk_chore_task_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_chore_task_child_id ON chore_task (child_id);
ALTER TABLE piggy_bank ADD CONSTRAINT fk_piggy_bank_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_piggy_bank_child_id ON piggy_bank (child_id);
ALTER TABLE long_term_deposit ADD CONSTRAINT fk_long_term_deposit_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_long_term_deposit_child_id ON long_term_deposit (child_id);
ALTER TABLE split_bill ADD CONSTRAINT fk_split_bill_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_split_bill_child_id ON split_bill (child_id);
ALTER TABLE split_bill ADD CONSTRAINT fk_split_bill_payer_child_id FOREIGN KEY (payer_child_id) REFERENCES child_profile(id);
CREATE INDEX idx_split_bill_payer_child_id ON split_bill (payer_child_id);
ALTER TABLE reward_shop_item ADD CONSTRAINT fk_reward_shop_item_family_id FOREIGN KEY (family_id) REFERENCES family_account(id);
CREATE INDEX idx_reward_shop_item_family_id ON reward_shop_item (family_id);
ALTER TABLE reward_ownership ADD CONSTRAINT fk_reward_ownership_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_reward_ownership_child_id ON reward_ownership (child_id);
ALTER TABLE reward_ownership ADD CONSTRAINT fk_reward_ownership_item_id FOREIGN KEY (item_id) REFERENCES reward_shop_item(id);
CREATE INDEX idx_reward_ownership_item_id ON reward_ownership (item_id);
ALTER TABLE quiz_completion ADD CONSTRAINT fk_quiz_completion_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_quiz_completion_child_id ON quiz_completion (child_id);
ALTER TABLE qr_login_token ADD CONSTRAINT fk_qr_login_token_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_qr_login_token_child_id ON qr_login_token (child_id);
ALTER TABLE allowance_schedule ADD CONSTRAINT fk_allowance_schedule_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_allowance_schedule_child_id ON allowance_schedule (child_id);
ALTER TABLE idempotency_record ADD CONSTRAINT fk_idempotency_record_user_id FOREIGN KEY (user_id) REFERENCES app_user(id);
CREATE INDEX idx_idempotency_record_user_id ON idempotency_record (user_id);
ALTER TABLE family_event ADD CONSTRAINT fk_family_event_family_id FOREIGN KEY (family_id) REFERENCES family_account(id);
CREATE INDEX idx_family_event_family_id ON family_event (family_id);
ALTER TABLE family_event ADD CONSTRAINT fk_family_event_child_id FOREIGN KEY (child_id) REFERENCES child_profile(id);
CREATE INDEX idx_family_event_child_id ON family_event (child_id);
CREATE INDEX idx_family_event_time ON family_event (family_id, created_at);
CREATE INDEX idx_transaction_time ON transaction_record (child_id, created_at);

CREATE UNIQUE INDEX uq_family_event_sequence ON family_event (family_id, event_sequence);
