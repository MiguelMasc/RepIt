-- Enable pgvector (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Notes table for free-form user content
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_notes_user_idx ON user_notes(user_id);

-- Embeddings table for semantic search
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'note' | 'session' | 'goal' | 'supplement'
  source_id UUID NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, source_type, source_id)
);
CREATE INDEX IF NOT EXISTS embeddings_user_idx ON embeddings(user_id);
-- Approximate index for vector search (cosine distance)
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

