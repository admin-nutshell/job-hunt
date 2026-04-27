-- ============================================================
-- haytham-job-hunt · Migration 0001 · Initial Schema
-- SQLite / Cloudflare D1 dialect
-- Apply locally:  npx wrangler d1 execute job-hunt-db --local --file=migrations/0001_init.sql
-- Apply remote:   npx wrangler d1 execute job-hunt-db --remote --file=migrations/0001_init.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1. applications
--    Core tracking record for every job Haytham considers.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  company          TEXT    NOT NULL,
  role_title       TEXT    NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'Wishlist'
                     CHECK (status IN (
                       'Wishlist','Applied','Phone Screen',
                       'Interview','Offer','Rejected','Withdrawn'
                     )),
  date_applied     TEXT,                  -- ISO-8601 date string, nullable until actually applied
  job_url          TEXT,
  salary_min       INTEGER,               -- stored as whole units (e.g. 80000)
  salary_max       INTEGER,
  salary_currency  TEXT    NOT NULL DEFAULT 'CAD',
  location         TEXT,
  work_type        TEXT    NOT NULL DEFAULT 'Remote'
                     CHECK (work_type IN ('Remote','Hybrid','Onsite')),
  notes            TEXT,
  job_description  TEXT,
  created_at       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: keep updated_at current on every row update
CREATE TRIGGER IF NOT EXISTS applications_updated_at
  AFTER UPDATE ON applications
  FOR EACH ROW
BEGIN
  UPDATE applications SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ------------------------------------------------------------
-- 2. contacts
--    People Haytham has reached out to, linked to an application.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id  INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  name            TEXT    NOT NULL,
  company         TEXT,
  role            TEXT,
  email           TEXT,
  linkedin_url    TEXT,
  notes           TEXT,
  created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 3. tasks
--    Follow-up items and reminders tied to an application.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id  INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  description     TEXT    NOT NULL,
  due_date        TEXT,                   -- ISO-8601 date string
  done            INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
  created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 4. resume
--    Singleton table — always exactly one row (Haytham's live resume).
--    Enforce single-row constraint via a CHECK on the fixed id.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resume (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  content    TEXT    NOT NULL DEFAULT '',
  updated_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: keep updated_at current on resume update
CREATE TRIGGER IF NOT EXISTS resume_updated_at
  AFTER UPDATE ON resume
  FOR EACH ROW
BEGIN
  UPDATE resume SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Seed the single resume row so it always exists
INSERT OR IGNORE INTO resume (id, content) VALUES (1, '');

-- ------------------------------------------------------------
-- 5. answer_bank
--    Q&A pairs capturing experience gaps found during AI job matching.
--    Can be linked to a specific application or kept generic (application_id NULL).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer_bank (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  question        TEXT    NOT NULL,
  answer          TEXT    NOT NULL DEFAULT '',
  application_id  INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS answer_bank_updated_at
  AFTER UPDATE ON answer_bank
  FOR EACH ROW
BEGIN
  UPDATE answer_bank SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ------------------------------------------------------------
-- 6. voice_profile
--    Singleton table — stores Haytham's writing tone/style guide
--    used when AI generates cover letters.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS voice_profile (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  tone_description TEXT    NOT NULL DEFAULT '',
  updated_at       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS voice_profile_updated_at
  AFTER UPDATE ON voice_profile
  FOR EACH ROW
BEGIN
  UPDATE voice_profile SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Seed the single voice_profile row so it always exists
INSERT OR IGNORE INTO voice_profile (id, tone_description) VALUES (1, '');

-- ------------------------------------------------------------
-- 7. cover_letters
--    AI-generated cover letters linked to a specific application.
--    approved = 1 means Haytham has signed off on this version.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cover_letters (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id  INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  content         TEXT    NOT NULL DEFAULT '',
  approved        INTEGER NOT NULL DEFAULT 0 CHECK (approved IN (0, 1)),
  created_at      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
