-- Form submissions from contact, hire-us, newsletter and job forms
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form TEXT NOT NULL CHECK (form IN ('contact', 'hire', 'newsletter', 'job')),
  name TEXT,
  email TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  email_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_submissions_ip_time ON submissions (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_form_time ON submissions (form, created_at);

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  unsubscribed_at TEXT
);
