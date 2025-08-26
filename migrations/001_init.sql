-- Execution Table SCHEMA to manage history, input, output
CREATE TABLE IF NOT EXISTS executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  stdin TEXT,
  args TEXT[],
  status TEXT NOT NULL,
  exit_code INT,
  stdout TEXT,
  stderr TEXT,
  error TEXT,
  duration_ms BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);