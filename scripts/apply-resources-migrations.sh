#!/bin/bash

# Script to apply resource migrations in Supabase

# Check if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set."
  echo "You can find these in your Supabase project settings."
  exit 1
fi

echo "Applying resource migrations..."

# Run the SQL file using PSQL with the SUPABASE connection
PGPASSWORD=$SUPABASE_SERVICE_ROLE_KEY psql -h $(echo $SUPABASE_URL | sed 's|^https\?://||' | sed 's|/.*$||') \
  -U postgres \
  -d postgres \
  -f ./migrations/apply-resources-migrations.sql

if [ $? -eq 0 ]; then
  echo "Resources migrations applied successfully!"
else
  echo "Error applying migrations. Check output for details."
  exit 1
fi 