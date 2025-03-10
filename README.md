# CyberVerse

CyberVerse is an interactive cybersecurity learning platform featuring labs, challenges, and training modules.

## Deployment Instructions

### Local Development

1. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

2. Setup environment variables:
   - Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_VERCEL_URL=http://localhost:3000
   AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
   NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

### Deploying to Vercel

1. Connect your GitHub repository to Vercel.

2. Configure the following build settings in Vercel:
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
   - Install Command: `npm install --legacy-peer-deps`

3. **IMPORTANT:** Add ALL the following Environment Variables in your Vercel project settings:
   ```
   NEXT_PUBLIC_SITE_URL=https://cyber-verse-psi.vercel.app
   NEXT_PUBLIC_VERCEL_URL=https://cyber-verse-psi.vercel.app
   AUTH_REDIRECT_URL=https://cyber-verse-psi.vercel.app/auth/callback
   
   # Add your actual Supabase values here - REQUIRED!
   NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. Update your Supabase authentication settings:
   - Go to your Supabase dashboard > Authentication > URL Configuration
   - Set Site URL to: `https://cyber-verse-psi.vercel.app`
   - Add Redirect URLs: `https://cyber-verse-psi.vercel.app/auth/callback`
   - Save the changes

5. Deploy!

## Troubleshooting

### Missing Supabase Environment Variables
If you see errors related to `process.env.NEXT_PUBLIC_SUPABASE_URL`, it means your Supabase environment variables are not set correctly:

1. Verify that the environment variables are properly added in Vercel
2. Make sure you use the exact variable names shown above
3. Ensure you're using your actual Supabase credentials, not placeholder values
4. After adding or changing environment variables, redeploy your application

### Authentication Redirect Issues
If you encounter redirect issues with authentication:

1. Check that the redirect URLs are correctly set in Supabase
2. Ensure your environment variables match your production URL
3. Clear your browser cookies and try logging in again

### Localhost Redirect in Production
If you're getting redirected to localhost even in production:

1. **Redeploy after setting environment variables**: After setting environment variables in Vercel, redeploy the application to ensure they're properly included in the build.

2. **Check browser console for errors**: There might be client-side errors that provide clues about the redirect issue.

3. **Clear browser cache and cookies**: Previous authentication sessions might be causing the redirect issue.

4. **Check Supabase Auth Settings**: Make sure your Supabase project has the correct Site URL and Redirect URLs.

5. **Force Rebuild without Cache**:
   - In Vercel dashboard, go to your project
   - Click on "Deployments"
   - Find your latest deployment
   - Click the three dots menu (...)
   - Select "Redeploy" and check "Clear Cache and Redeploy"

6. **Verify that your Vercel deployment is using these environment variables**:
   - Go to your Vercel project
   - Click on "Settings" -> "Environment Variables"
   - Verify all variables are set correctly for "Production" environment

## Features

- Interactive cybersecurity labs
- CTF challenges
- Web security training
- Network defense challenges
- And more! 