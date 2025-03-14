#!/bin/bash

# This script sets up environment variables for the migration

# Check if .env.local file exists
if [ -f "../.env.local" ]; then
  echo "Loading environment variables from .env.local..."
  
  # Export variables from .env.local
  export $(grep -v '^#' ../.env.local | xargs)
  
  # Check if the required variables are set
  if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
    exit 1
  fi
  
  # Set the variables needed for the migration script
  export SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
  
  # Ask for the service role key if not already set
  if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Please enter your Supabase service role key:"
    read -s SUPABASE_SERVICE_ROLE_KEY
    export SUPABASE_SERVICE_ROLE_KEY
  fi
  
  echo "Environment variables set successfully!"
  echo "SUPABASE_URL: $SUPABASE_URL"
  echo "SUPABASE_SERVICE_ROLE_KEY: [HIDDEN]"
  
  # Run the migration script
  echo "Running migration script..."
  ./apply-resources-migrations.sh
else
  echo "Error: .env.local file not found in the project root."
  echo "Please create a .env.local file with the following variables:"
  echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
  exit 1
fi 