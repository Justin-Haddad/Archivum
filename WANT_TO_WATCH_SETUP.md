# Backlog Feature Setup

This guide will help you add the "Backlog" feature to your user_library table.

## Overview

Users can mark media items as "Backlog" when adding them to their archive. This allows them to easily filter and view items they plan to consume in the future.

## Database Migration

Add a `want_to_watch` column to your existing `user_library` table:

```sql
-- Add want_to_watch column to user_library table
ALTER TABLE user_library
ADD COLUMN IF NOT EXISTS want_to_watch BOOLEAN DEFAULT false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_library_want_to_watch ON user_library(user_id, want_to_watch) WHERE want_to_watch = true;
```

## Setup Steps

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the SQL above
4. Run the SQL script
5. Verify the column was added in the **Table Editor** (go to `user_library` table and check for `want_to_watch` column)

## Usage

After running the migration:

- Users can mark items as "Backlog" when adding them to their archive
- The Library page will have a filter to view only "Backlog" items
- Users can toggle the "Backlog" status on items they've already added

## Notes

- The `want_to_watch` field defaults to `false` for existing items
- The index helps with fast filtering when viewing backlog items
- Users can have items both in their archive and marked as backlog (they're not mutually exclusive)
- The database column is named `want_to_watch` (internal), but the UI displays it as "Backlog"
