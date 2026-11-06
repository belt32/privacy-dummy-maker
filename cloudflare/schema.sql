CREATE TABLE IF NOT EXISTS counter_browsers (
  token_hash TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS counter_totals (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total INTEGER NOT NULL CHECK (total >= 0)
);
INSERT OR IGNORE INTO counter_totals (id, total)
SELECT 1, COUNT(*) FROM counter_browsers;
CREATE TRIGGER IF NOT EXISTS count_new_browser
AFTER INSERT ON counter_browsers
BEGIN
  UPDATE counter_totals SET total = total + 1 WHERE id = 1;
END;
