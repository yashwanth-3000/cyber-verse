# Minimalist Homepage

A sleek, minimalist homepage for cybersecurity resources with a modern UI and Supabase integration.

## Features

- 🔒 User authentication with Google login
- 📚 Browse and search cybersecurity resources
- 🏷️ Filter resources by tags
- 👍 Upvote resources
- 💬 Comment on resources
- 🔍 Search functionality
- 📱 Responsive design
- 🌙 Dark mode

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/minimalist-homepage.git
cd minimalist-homepage
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the Supabase database:

- Run the SQL script in `scripts/schema.sql` in the Supabase SQL Editor to create the database schema
- Run the SQL script in `scripts/insert-dummy-data.sql` to insert some dummy data

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following database schema:

### Tables

- **profiles**: User profiles linked to auth.users
- **resources**: The main resources/links shared by users
- **tags**: Categories for resources
- **resource_tags**: Junction table linking resources to tags
- **upvotes**: User upvotes on resources
- **comments**: User comments on resources

### Views

- **resources_with_stats**: A view that combines resources with their associated tags, upvotes count, and comments count

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Set the environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 