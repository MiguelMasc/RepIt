import {pgTable, text, timestamp, uuid, index} from 'drizzle-orm/pg-core';

export const UserNotesTable = pgTable(
  'user_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: text('user_id').notNull(),
    title: text('title'),
    content: text('content').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    user_idx: index('user_notes_user_idx').on(table.user_id),
  }),
);

export const EmbeddingsTable = pgTable(
  'embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: text('user_id').notNull(),
    source_type: text('source_type').notNull(),
    source_id: uuid('source_id').notNull(),
    // drizzle-orm doesn't have a vector type built-in; store as text for now or use sql`vector`
    // We'll use text to keep compile safe, but the DB column is VECTOR(1536)
    embedding: text('embedding').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    user_idx: index('embeddings_user_idx').on(table.user_id),
  }),
);


