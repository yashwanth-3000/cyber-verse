# Database Migration Scripts

This directory contains scripts for managing database migrations for the Cyber-Verse application.

## Available Scripts

### `setup-env.sh`

This script sets up the necessary environment variables for running migrations. It reads from your `.env.local` file and prompts for any missing variables.

```bash
./setup-env.sh
```

### `apply-resources-migrations.sh`

This script applies the resources schema migrations to your Supabase database. It requires the `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables to be set.

```bash
./apply-resources-migrations.sh
```

## Running Migrations

To run migrations, follow these steps:

1. Make sure you have a `.env.local` file in the project root with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run the setup script:
   ```bash
   ./setup-env.sh
   ```

3. When prompted, enter your Supabase service role key.

4. The script will automatically run the migrations.

## Migration Files

The actual SQL migration files are located in the `migrations` directory:

- `resources-schema.sql`: Contains the schema definitions for resources, tags, upvotes, and comments.
- `resources-functions.sql`: Contains the SQL functions for interacting with resources.
- `apply-resources-migrations.sql`: A combined file that applies all migrations in the correct order.

## Troubleshooting

If you encounter errors during migration:

1. Check that your Supabase credentials are correct.
2. Ensure you have the necessary permissions to run migrations.
3. Check the SQL syntax in the migration files.
4. If a view or function cannot be dropped due to dependencies, you may need to use the `CASCADE` option. 