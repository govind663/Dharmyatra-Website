PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- =========================================================
-- DIVYADHARA
-- SQLite Database Schema
-- React + TypeScript + Vite + Node/Express
-- =========================================================


-- =========================================================
-- 1. ROLES
-- =========================================================

CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_system INTEGER NOT NULL DEFAULT 1 CHECK (is_system IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. PERMISSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 3. ROLE PERMISSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (role_id, permission_id),

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    FOREIGN KEY (permission_id)
        REFERENCES permissions(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 4. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    role_id INTEGER NOT NULL,

    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT,

    password_hash TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (
            status IN (
                'pending',
                'active',
                'suspended',
                'rejected',
                'blocked'
            )
        ),

    email_verified_at TEXT,
    phone_verified_at TEXT,

    last_login_at TEXT,

    avatar TEXT,

    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
);


-- =========================================================
-- 5. VISITOR PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS visitor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL UNIQUE,

    preferred_language TEXT,

    date_of_birth TEXT,

    gender TEXT,

    address TEXT,

    pincode TEXT,

    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    marketing_consent INTEGER NOT NULL DEFAULT 0
        CHECK (marketing_consent IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 6. PANDIT PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS pandit_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL UNIQUE,

    slug TEXT NOT NULL UNIQUE,

    display_name TEXT NOT NULL,
    title TEXT,

    photo TEXT,

    experience_years INTEGER NOT NULL DEFAULT 0
        CHECK (experience_years >= 0),

    location TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'India',

    languages_json TEXT NOT NULL DEFAULT '[]',

    specializations_json TEXT NOT NULL DEFAULT '[]',

    puja_types_json TEXT NOT NULL DEFAULT '[]',

    associated_with TEXT,

    about TEXT,

    availability TEXT,

    service_areas_json TEXT NOT NULL DEFAULT '[]',

    profile_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            profile_status IN (
                'draft',
                'pending',
                'approved',
                'rejected',
                'suspended'
            )
        ),

    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            verification_status IN (
                'pending',
                'in_review',
                'verified',
                'rejected',
                'expired'
            )
        ),

    identity_verified INTEGER NOT NULL DEFAULT 0
        CHECK (identity_verified IN (0, 1)),

    profile_verified INTEGER NOT NULL DEFAULT 0
        CHECK (profile_verified IN (0, 1)),

    authorized_contact INTEGER NOT NULL DEFAULT 0
        CHECK (authorized_contact IN (0, 1)),

    verified_at TEXT,
    verification_notes TEXT,

    featured INTEGER NOT NULL DEFAULT 0
        CHECK (featured IN (0, 1)),

    listing_active INTEGER NOT NULL DEFAULT 0
        CHECK (listing_active IN (0, 1)),

    rejection_reason TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 7. PANDIT SERVICE OFFERINGS
-- =========================================================
-- Separate table for actual bookable offerings.
-- This is useful for future filtering, pricing and SEO.

CREATE TABLE IF NOT EXISTS pandit_service_offerings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    pandit_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    price_amount INTEGER,

    currency TEXT NOT NULL DEFAULT 'INR',

    duration_minutes INTEGER,

    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE CASCADE,

    CHECK (
        price_amount IS NULL
        OR price_amount >= 0
    ),

    CHECK (
        duration_minutes IS NULL
        OR duration_minutes > 0
    )
);


-- =========================================================
-- 8. PANDIT VERIFICATION DOCUMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS pandit_verification_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    pandit_id INTEGER NOT NULL,

    document_type TEXT NOT NULL
        CHECK (
            document_type IN (
                'government_id',
                'address_proof',
                'guru_reference',
                'parampara_reference',
                'qualification',
                'video_sample',
                'other'
            )
        ),

    document_name TEXT,

    document_url TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected'
            )
        ),

    reviewer_id INTEGER,

    reviewer_note TEXT,

    reviewed_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reviewer_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 9. TEMPLES
-- =========================================================
-- Dynamic backend temple records.
-- Existing static temple data can later be migrated here.

CREATE TABLE IF NOT EXISTS temples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    slug TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,
    sanskrit_name TEXT,

    deity TEXT,

    summary TEXT,
    description TEXT,

    image TEXT,

    city TEXT,
    district TEXT,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'India',

    address TEXT,

    latitude REAL,
    longitude REAL,

    map_url TEXT,

    tradition TEXT,

    established TEXT,

    trust_name TEXT,

    contact_phone TEXT,
    contact_email TEXT,

    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (
            status IN (
                'draft',
                'pending',
                'published',
                'unpublished'
            )
        ),

    featured INTEGER NOT NULL DEFAULT 0
        CHECK (featured IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 10. TEMPLE MANAGER PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS temple_manager_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL UNIQUE,

    designation TEXT,

    organization_name TEXT,

    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'rejected',
                'suspended'
            )
        ),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 11. TEMPLE MANAGER ASSIGNMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS temple_manager_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    temple_id INTEGER NOT NULL,

    manager_user_id INTEGER NOT NULL,

    assigned_by INTEGER,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (
            status IN (
                'active',
                'inactive',
                'revoked'
            )
        ),

    assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (temple_id)
        REFERENCES temples(id)
        ON DELETE CASCADE,

    FOREIGN KEY (manager_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 12. SUBSCRIPTION PLANS
-- =========================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    code TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL UNIQUE,

    description TEXT,

    price_amount INTEGER NOT NULL
        CHECK (price_amount >= 0),

    currency TEXT NOT NULL DEFAULT 'INR',

    lead_limit INTEGER NOT NULL
        CHECK (lead_limit >= 0),

    duration_days INTEGER NOT NULL DEFAULT 30
        CHECK (duration_days > 0),

    listing_enabled INTEGER NOT NULL DEFAULT 1
        CHECK (listing_enabled IN (0, 1)),

    featured_listing INTEGER NOT NULL DEFAULT 0
        CHECK (featured_listing IN (0, 1)),

    priority_support INTEGER NOT NULL DEFAULT 0
        CHECK (priority_support IN (0, 1)),

    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 13. PANDIT SUBSCRIPTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS pandit_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    pandit_id INTEGER NOT NULL,

    plan_id INTEGER NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'active',
                'expired',
                'cancelled',
                'paused',
                'payment_failed'
            )
        ),

    starts_at TEXT,
    expires_at TEXT,

    lead_limit INTEGER NOT NULL DEFAULT 0
        CHECK (lead_limit >= 0),

    leads_used INTEGER NOT NULL DEFAULT 0
        CHECK (leads_used >= 0),

    auto_renew INTEGER NOT NULL DEFAULT 0
        CHECK (auto_renew IN (0, 1)),

    payment_id INTEGER,

    notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE CASCADE,

    FOREIGN KEY (plan_id)
        REFERENCES subscription_plans(id)
        ON DELETE RESTRICT
);


-- =========================================================
-- Prevent more than one active subscription per Pandit
-- =========================================================

CREATE UNIQUE INDEX IF NOT EXISTS
idx_one_active_subscription_per_pandit
ON pandit_subscriptions(pandit_id)
WHERE status = 'active';


-- =========================================================
-- 14. LEADS
-- =========================================================

CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    lead_number TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,

    phone TEXT,

    email TEXT,

    city TEXT,
    state TEXT,

    service_type TEXT,
    puja_type TEXT,

    temple_id INTEGER,

    requested_pandit_id INTEGER,

    preferred_date TEXT,
    preferred_time TEXT,

    travellers_count INTEGER,

    message TEXT,

    source_type TEXT NOT NULL DEFAULT 'website'
        CHECK (
            source_type IN (
                'website',
                'form',
                'whatsapp',
                'phone',
                'admin',
                'organic_search',
                'social',
                'referral'
            )
        ),

    source_page TEXT,

    source_form TEXT,

    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,

    landing_page TEXT,
    referrer_url TEXT,

    status TEXT NOT NULL DEFAULT 'new'
        CHECK (
            status IN (
                'new',
                'qualified',
                'assigned',
                'contacted',
                'follow_up',
                'converted',
                'lost',
                'closed',
                'spam'
            )
        ),

    priority TEXT NOT NULL DEFAULT 'normal'
        CHECK (
            priority IN (
                'low',
                'normal',
                'high',
                'urgent'
            )
        ),

    owner_user_id INTEGER,

    last_contacted_at TEXT,
    converted_at TEXT,
    closed_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (temple_id)
        REFERENCES temples(id)
        ON DELETE SET NULL,

    FOREIGN KEY (requested_pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE SET NULL,

    FOREIGN KEY (owner_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 15. LEAD ASSIGNMENTS
-- =========================================================
-- Each assignment can consume one Pandit lead credit.
-- This allows the same visitor enquiry to be assigned
-- to more than one suitable Pandit if business rules allow.

CREATE TABLE IF NOT EXISTS lead_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    lead_id INTEGER NOT NULL,

    pandit_id INTEGER,

    assigned_to_user_id INTEGER,

    assigned_by INTEGER,

    assignment_type TEXT NOT NULL DEFAULT 'pandit'
        CHECK (
            assignment_type IN (
                'pandit',
                'sales',
                'temple_manager',
                'admin'
            )
        ),

    status TEXT NOT NULL DEFAULT 'assigned'
        CHECK (
            status IN (
                'assigned',
                'accepted',
                'contacted',
                'follow_up',
                'converted',
                'rejected',
                'expired',
                'closed'
            )
        ),

    lead_credit_used INTEGER NOT NULL DEFAULT 0
        CHECK (lead_credit_used IN (0, 1)),

    assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    contacted_at TEXT,
    converted_at TEXT,
    closed_at TEXT,

    notes TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    FOREIGN KEY (pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE SET NULL,

    FOREIGN KEY (assigned_to_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (assigned_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    UNIQUE (lead_id, pandit_id)
);


-- =========================================================
-- 16. LEAD EVENTS
-- =========================================================
-- CRM history for every lead action.

CREATE TABLE IF NOT EXISTS lead_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    lead_id INTEGER NOT NULL,

    assignment_id INTEGER,

    user_id INTEGER,

    event_type TEXT NOT NULL,

    old_status TEXT,
    new_status TEXT,

    notes TEXT,

    metadata_json TEXT NOT NULL DEFAULT '{}',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE CASCADE,

    FOREIGN KEY (assignment_id)
        REFERENCES lead_assignments(id)
        ON DELETE SET NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 17. PAYMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    payment_number TEXT NOT NULL UNIQUE,

    user_id INTEGER,

    pandit_id INTEGER,

    subscription_id INTEGER,

    amount INTEGER NOT NULL
        CHECK (amount >= 0),

    currency TEXT NOT NULL DEFAULT 'INR',

    provider TEXT,

    provider_order_id TEXT,

    provider_payment_id TEXT,

    provider_signature TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'authorized',
                'paid',
                'failed',
                'refunded',
                'cancelled'
            )
        ),

    payment_method TEXT,

    paid_at TEXT,

    failure_reason TEXT,

    metadata_json TEXT NOT NULL DEFAULT '{}',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE SET NULL,

    FOREIGN KEY (subscription_id)
        REFERENCES pandit_subscriptions(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 18. SESSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TEXT NOT NULL,

    ip_address TEXT,

    user_agent TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_activity_at TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 19. PASSWORD RESET TOKENS
-- =========================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TEXT NOT NULL,

    used_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 20. EMAIL / PHONE VERIFICATION TOKENS
-- =========================================================

CREATE TABLE IF NOT EXISTS verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    purpose TEXT NOT NULL
        CHECK (
            purpose IN (
                'email_verification',
                'phone_verification'
            )
        ),

    expires_at TEXT NOT NULL,

    verified_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 21. NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    type TEXT NOT NULL DEFAULT 'system',

    title TEXT NOT NULL,

    message TEXT NOT NULL,

    action_url TEXT,

    is_read INTEGER NOT NULL DEFAULT 0
        CHECK (is_read IN (0, 1)),

    read_at TEXT,

    metadata_json TEXT NOT NULL DEFAULT '{}',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 22. SAVED TEMPLES
-- =========================================================

CREATE TABLE IF NOT EXISTS saved_temples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    temple_id INTEGER NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (temple_id)
        REFERENCES temples(id)
        ON DELETE CASCADE,

    UNIQUE (user_id, temple_id)
);


-- =========================================================
-- 23. SAVED PLACES
-- =========================================================
-- Generic place slug can later be connected to a places table.

CREATE TABLE IF NOT EXISTS saved_places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    place_slug TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (user_id, place_slug)
);


-- =========================================================
-- 24. BOOKINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    booking_number TEXT NOT NULL UNIQUE,

    user_id INTEGER,

    lead_id INTEGER,

    pandit_id INTEGER,

    temple_id INTEGER,

    kind TEXT NOT NULL,

    title TEXT NOT NULL,

    date TEXT,

    status TEXT NOT NULL DEFAULT 'received'
        CHECK (
            status IN (
                'received',
                'confirmed',
                'in_progress',
                'completed',
                'cancelled',
                'rejected'
            )
        ),

    detail TEXT,

    amount INTEGER,

    currency TEXT NOT NULL DEFAULT 'INR',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE SET NULL,

    FOREIGN KEY (pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE SET NULL,

    FOREIGN KEY (temple_id)
        REFERENCES temples(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 25. SALES ACTIVITIES
-- =========================================================

CREATE TABLE IF NOT EXISTS sales_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    sales_user_id INTEGER NOT NULL,

    lead_id INTEGER,

    pandit_id INTEGER,

    activity_type TEXT NOT NULL
        CHECK (
            activity_type IN (
                'call',
                'whatsapp',
                'email',
                'meeting',
                'follow_up',
                'note',
                'package_discussion',
                'renewal'
            )
        ),

    outcome TEXT,

    notes TEXT,

    next_follow_up_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sales_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (lead_id)
        REFERENCES leads(id)
        ON DELETE SET NULL,

    FOREIGN KEY (pandit_id)
        REFERENCES pandit_profiles(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 26. AUDIT LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER,

    action TEXT NOT NULL,

    entity_type TEXT,

    entity_id INTEGER,

    old_data_json TEXT,
    new_data_json TEXT,

    ip_address TEXT,
    user_agent TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 27. SYSTEM SETTINGS
-- =========================================================

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    setting_key TEXT NOT NULL UNIQUE,

    setting_value TEXT,

    setting_type TEXT NOT NULL DEFAULT 'string'
        CHECK (
            setting_type IN (
                'string',
                'number',
                'boolean',
                'json'
            )
        ),

    description TEXT,

    is_public INTEGER NOT NULL DEFAULT 0
        CHECK (is_public IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 28. SEO PAGE SETTINGS
-- =========================================================
-- Optional backend-controlled SEO metadata for dynamic pages.

CREATE TABLE IF NOT EXISTS seo_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    page_type TEXT NOT NULL,

    entity_id INTEGER,

    path TEXT NOT NULL UNIQUE,

    seo_title TEXT,
    meta_description TEXT,

    canonical_url TEXT,

    og_title TEXT,
    og_description TEXT,
    og_image TEXT,

    robots TEXT NOT NULL DEFAULT 'index,follow',

    schema_json TEXT,

    is_indexable INTEGER NOT NULL DEFAULT 1
        CHECK (is_indexable IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- INDEXES
-- =========================================================

-- USERS

CREATE INDEX IF NOT EXISTS idx_users_role_id
ON users(role_id);

CREATE INDEX IF NOT EXISTS idx_users_status
ON users(status);

CREATE INDEX IF NOT EXISTS idx_users_phone
ON users(phone);

CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users(created_at);


-- PANDITS

CREATE INDEX IF NOT EXISTS idx_pandits_profile_status
ON pandit_profiles(profile_status);

CREATE INDEX IF NOT EXISTS idx_pandits_verification_status
ON pandit_profiles(verification_status);

CREATE INDEX IF NOT EXISTS idx_pandits_listing_active
ON pandit_profiles(listing_active);

CREATE INDEX IF NOT EXISTS idx_pandits_featured
ON pandit_profiles(featured);

CREATE INDEX IF NOT EXISTS idx_pandits_city
ON pandit_profiles(city);

CREATE INDEX IF NOT EXISTS idx_pandits_state
ON pandit_profiles(state);

CREATE INDEX IF NOT EXISTS idx_pandits_location
ON pandit_profiles(location);


-- PANDIT SERVICES

CREATE INDEX IF NOT EXISTS idx_pandit_services_pandit
ON pandit_service_offerings(pandit_id);

CREATE INDEX IF NOT EXISTS idx_pandit_services_active
ON pandit_service_offerings(is_active);


-- TEMPLES

CREATE INDEX IF NOT EXISTS idx_temples_status
ON temples(status);

CREATE INDEX IF NOT EXISTS idx_temples_city
ON temples(city);

CREATE INDEX IF NOT EXISTS idx_temples_state
ON temples(state);

CREATE INDEX IF NOT EXISTS idx_temples_featured
ON temples(featured);


-- TEMPLE MANAGERS

CREATE INDEX IF NOT EXISTS idx_temple_manager_assignments_temple
ON temple_manager_assignments(temple_id);

CREATE INDEX IF NOT EXISTS idx_temple_manager_assignments_manager
ON temple_manager_assignments(manager_user_id);

CREATE INDEX IF NOT EXISTS idx_temple_manager_assignments_status
ON temple_manager_assignments(status);


-- SUBSCRIPTIONS

CREATE INDEX IF NOT EXISTS idx_subscriptions_pandit
ON pandit_subscriptions(pandit_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan
ON pandit_subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
ON pandit_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry
ON pandit_subscriptions(expires_at);


-- LEADS

CREATE INDEX IF NOT EXISTS idx_leads_status
ON leads(status);

CREATE INDEX IF NOT EXISTS idx_leads_priority
ON leads(priority);

CREATE INDEX IF NOT EXISTS idx_leads_city
ON leads(city);

CREATE INDEX IF NOT EXISTS idx_leads_service_type
ON leads(service_type);

CREATE INDEX IF NOT EXISTS idx_leads_puja_type
ON leads(puja_type);

CREATE INDEX IF NOT EXISTS idx_leads_temple
ON leads(temple_id);

CREATE INDEX IF NOT EXISTS idx_leads_requested_pandit
ON leads(requested_pandit_id);

CREATE INDEX IF NOT EXISTS idx_leads_owner
ON leads(owner_user_id);

CREATE INDEX IF NOT EXISTS idx_leads_created
ON leads(created_at);


-- LEAD ASSIGNMENTS

CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead
ON lead_assignments(lead_id);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_pandit
ON lead_assignments(pandit_id);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_status
ON lead_assignments(status);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_assigned_at
ON lead_assignments(assigned_at);


-- LEAD EVENTS

CREATE INDEX IF NOT EXISTS idx_lead_events_lead
ON lead_events(lead_id);

CREATE INDEX IF NOT EXISTS idx_lead_events_created
ON lead_events(created_at);


-- PAYMENTS

CREATE INDEX IF NOT EXISTS idx_payments_user
ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_pandit
ON payments(pandit_id);

CREATE INDEX IF NOT EXISTS idx_payments_subscription
ON payments(subscription_id);

CREATE INDEX IF NOT EXISTS idx_payments_status
ON payments(status);

CREATE INDEX IF NOT EXISTS idx_payments_created
ON payments(created_at);


-- SESSIONS

CREATE INDEX IF NOT EXISTS idx_sessions_user
ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expiry
ON sessions(expires_at);


-- NOTIFICATIONS

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
ON notifications(user_id, is_read);


-- BOOKINGS

CREATE INDEX IF NOT EXISTS idx_bookings_user
ON bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_pandit
ON bookings(pandit_id);

CREATE INDEX IF NOT EXISTS idx_bookings_temple
ON bookings(temple_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings(status);


-- SALES

CREATE INDEX IF NOT EXISTS idx_sales_activities_sales_user
ON sales_activities(sales_user_id);

CREATE INDEX IF NOT EXISTS idx_sales_activities_lead
ON sales_activities(lead_id);

CREATE INDEX IF NOT EXISTS idx_sales_activities_pandit
ON sales_activities(pandit_id);

CREATE INDEX IF NOT EXISTS idx_sales_activities_followup
ON sales_activities(next_follow_up_at);


-- AUDIT

CREATE INDEX IF NOT EXISTS idx_audit_user
ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_entity
ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_created
ON audit_logs(created_at);


-- SEO

CREATE INDEX IF NOT EXISTS idx_seo_pages_page_type
ON seo_pages(page_type);

CREATE INDEX IF NOT EXISTS idx_seo_pages_entity
ON seo_pages(entity_id);

CREATE INDEX IF NOT EXISTS idx_seo_pages_indexable
ON seo_pages(is_indexable);


-- =========================================================
-- SEED ROLES
-- =========================================================

INSERT OR IGNORE INTO roles
    (code, name, description)
VALUES
    (
        'visitor',
        'Visitor',
        'Regular DivyaDhara visitor/devotee account'
    ),
    (
        'pandit',
        'Pandit',
        'Pandit/acharya account for listings and lead management'
    ),
    (
        'temple_manager',
        'Temple Manager',
        'Temple representative/manager account'
    ),
    (
        'sales',
        'Sales',
        'Sales and Pandit onboarding team account'
    ),
    (
        'super_admin',
        'Super Admin',
        'Full system administration account'
    );


-- =========================================================
-- SEED PERMISSIONS
-- =========================================================

INSERT OR IGNORE INTO permissions
    (code, name, description, module)
VALUES

    -- AUTH
    (
        'auth.view_profile',
        'View Own Profile',
        'View own account profile',
        'auth'
    ),
    (
        'auth.edit_profile',
        'Edit Own Profile',
        'Edit own account profile',
        'auth'
    ),

    -- PANDIT
    (
        'pandit.view_listing',
        'View Pandit Listing',
        'View public Pandit listings',
        'pandit'
    ),
    (
        'pandit.manage_own_profile',
        'Manage Own Pandit Profile',
        'Create and manage own Pandit profile',
        'pandit'
    ),
    (
        'pandit.view_own_leads',
        'View Own Leads',
        'View leads assigned to own Pandit profile',
        'pandit'
    ),
    (
        'pandit.update_own_leads',
        'Update Own Leads',
        'Update status and notes on own leads',
        'pandit'
    ),
    (
        'pandit.manage_subscription',
        'Manage Own Subscription',
        'View and purchase Pandit subscription',
        'pandit'
    ),

    -- TEMPLE
    (
        'temple.view',
        'View Temples',
        'View temple information',
        'temple'
    ),
    (
        'temple.manage_assigned',
        'Manage Assigned Temples',
        'Edit assigned temple information',
        'temple'
    ),
    (
        'temple.view_leads',
        'View Temple Leads',
        'View leads related to assigned temples',
        'temple'
    ),

    -- SALES
    (
        'sales.view_leads',
        'View Sales Leads',
        'View assigned sales leads',
        'sales'
    ),
    (
        'sales.manage_leads',
        'Manage Sales Leads',
        'Manage sales lead pipeline',
        'sales'
    ),
    (
        'sales.view_pandits',
        'View Pandits',
        'View Pandit onboarding information',
        'sales'
    ),
    (
        'sales.manage_followups',
        'Manage Follow Ups',
        'Manage sales follow-up activities',
        'sales'
    ),

    -- ADMIN
    (
        'admin.view_dashboard',
        'View Admin Dashboard',
        'View administration dashboard',
        'admin'
    ),
    (
        'admin.manage_users',
        'Manage Users',
        'Create/update/suspend users',
        'admin'
    ),
    (
        'admin.manage_pandits',
        'Manage Pandits',
        'Approve and manage Pandit profiles',
        'admin'
    ),
    (
        'admin.verify_pandits',
        'Verify Pandits',
        'Review and verify Pandit documents',
        'admin'
    ),
    (
        'admin.manage_temples',
        'Manage Temples',
        'Create and manage temples',
        'admin'
    ),
    (
        'admin.manage_temple_managers',
        'Manage Temple Managers',
        'Assign Temple Managers',
        'admin'
    ),
    (
        'admin.manage_leads',
        'Manage All Leads',
        'View and manage all leads',
        'admin'
    ),
    (
        'admin.assign_leads',
        'Assign Leads',
        'Assign leads to Pandits/Sales/Managers',
        'admin'
    ),
    (
        'admin.manage_plans',
        'Manage Subscription Plans',
        'Create and change subscription plans',
        'admin'
    ),
    (
        'admin.manage_payments',
        'Manage Payments',
        'View and manage payments',
        'admin'
    ),
    (
        'admin.view_reports',
        'View Reports',
        'View business reports and analytics',
        'admin'
    ),
    (
        'admin.manage_seo',
        'Manage SEO',
        'Manage dynamic SEO settings',
        'admin'
    ),
    (
        'admin.view_audit_logs',
        'View Audit Logs',
        'View system activity logs',
        'admin'
    ),
    (
        'admin.manage_settings',
        'Manage Settings',
        'Manage system settings',
        'admin'
    );


-- =========================================================
-- ROLE PERMISSIONS: VISITOR
-- =========================================================

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'visitor'
AND p.code IN (
    'auth.view_profile',
    'auth.edit_profile',
    'pandit.view_listing',
    'temple.view'
);


-- =========================================================
-- ROLE PERMISSIONS: PANDIT
-- =========================================================

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'pandit'
AND p.code IN (
    'auth.view_profile',
    'auth.edit_profile',
    'pandit.view_listing',
    'pandit.manage_own_profile',
    'pandit.view_own_leads',
    'pandit.update_own_leads',
    'pandit.manage_subscription',
    'temple.view'
);


-- =========================================================
-- ROLE PERMISSIONS: TEMPLE MANAGER
-- =========================================================

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'temple_manager'
AND p.code IN (
    'auth.view_profile',
    'auth.edit_profile',
    'temple.view',
    'temple.manage_assigned',
    'temple.view_leads'
);


-- =========================================================
-- ROLE PERMISSIONS: SALES
-- =========================================================

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'sales'
AND p.code IN (
    'auth.view_profile',
    'auth.edit_profile',
    'pandit.view_listing',
    'sales.view_leads',
    'sales.manage_leads',
    'sales.view_pandits',
    'sales.manage_followups',
    'temple.view'
);


-- =========================================================
-- ROLE PERMISSIONS: SUPER ADMIN
-- =========================================================

INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
JOIN permissions p
WHERE r.code = 'super_admin';


-- =========================================================
-- SEED PANDIT PACKAGES
-- =========================================================

INSERT OR IGNORE INTO subscription_plans
(
    code,
    name,
    description,
    price_amount,
    currency,
    lead_limit,
    duration_days,
    listing_enabled,
    featured_listing,
    priority_support,
    is_active,
    sort_order
)
VALUES
(
    'pandit_starter',
    'Starter',
    'Basic Pandit listing with 5 leads per month.',
    99,
    'INR',
    5,
    30,
    1,
    0,
    0,
    1,
    1
),
(
    'pandit_growth',
    'Growth',
    'Enhanced Pandit listing with 10 leads per month.',
    199,
    'INR',
    10,
    30,
    1,
    0,
    0,
    1,
    2
),
(
    'pandit_pro',
    'Pro',
    'Premium Pandit listing with 15 leads per month.',
    499,
    'INR',
    15,
    30,
    1,
    1,
    1,
    1,
    3
);


-- =========================================================
-- DEFAULT SYSTEM SETTINGS
-- =========================================================

INSERT OR IGNORE INTO settings
(
    setting_key,
    setting_value,
    setting_type,
    description,
    is_public
)
VALUES

(
    'site_name',
    'DivyaDhara',
    'string',
    'Website/application name',
    1
),

(
    'default_country',
    'India',
    'string',
    'Default country',
    1
),

(
    'pandit_lead_assignment_mode',
    'subscription_quota',
    'string',
    'Controls how Pandit lead assignment is handled',
    0
),

(
    'lead_definition',
    'A lead is counted when an enquiry is successfully assigned to a Pandit and lead credit is consumed.',
    'string',
    'Definition of a billable Pandit lead',
    1
),

(
    'pandit_registration_requires_approval',
    'true',
    'boolean',
    'Pandit registrations require admin verification before listing',
    0
),

(
    'temple_manager_registration_requires_approval',
    'true',
    'boolean',
    'Temple Manager registrations require approval/assignment',
    0
),

(
    'sales_public_registration',
    'false',
    'boolean',
    'Sales users cannot register publicly',
    0
),

(
    'super_admin_public_registration',
    'false',
    'boolean',
    'Super Admin cannot register publicly',
    0
);


COMMIT;