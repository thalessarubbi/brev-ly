import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const links = pgTable(
  'links',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    originalUrl: text('original_url').notNull(),
    shortUrl: text('short_url').notNull().unique(),
    accessCount: integer('access_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [index('links_created_at_idx').on(table.createdAt)]
)
