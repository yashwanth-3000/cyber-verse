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

3. Deploy!

## Troubleshooting

If you encounter any issues with the `.next/routes-manifest.json` file, try the following:

1. Delete your local `.next` folder
2. Run `npm run build` again
3. Make sure the `scripts/prepare-vercel.js` is included in your repository

## Features

- Interactive cybersecurity labs
- CTF challenges
- Web security training
- Network defense challenges
- And more! 