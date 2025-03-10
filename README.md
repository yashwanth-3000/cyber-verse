# CyberVerse

CyberVerse is an interactive cybersecurity learning platform featuring labs, challenges, and training modules.

## Deployment Instructions

### Local Development

1. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

### Deploying to Vercel

1. Connect your GitHub repository to Vercel.

2. Configure the following build settings in Vercel:
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`

3. Add the following Environment Variables in your Vercel project settings:
   ```
   NEXT_PUBLIC_SITE_URL=https://cyber-verse-psi.vercel.app
   NEXT_PUBLIC_VERCEL_URL=https://cyber-verse-psi.vercel.app
   AUTH_REDIRECT_URL=https://cyber-verse-psi.vercel.app/auth/callback
   ```

4. Update your Supabase authentication settings:
   - Go to your Supabase dashboard > Authentication > URL Configuration
   - Set Site URL to: `https://cyber-verse-psi.vercel.app`
   - Add Redirect URLs: `https://cyber-verse-psi.vercel.app/auth/callback`
   - Save the changes

5. Deploy!

## Troubleshooting

If you encounter any issues with the `.next/routes-manifest.json` file, try the following:

1. Delete your local `.next` folder
2. Run `npm run build` again
3. Make sure the `scripts/prepare-vercel.js` is included in your repository

If you encounter redirect issues with authentication:

1. Check that your environment variables are set correctly in Vercel
2. Ensure your Supabase authentication settings match your production URL
3. Clear your browser cookies and try logging in again

## Features

- Interactive cybersecurity labs
- CTF challenges
- Web security training
- Network defense challenges
- And more! 