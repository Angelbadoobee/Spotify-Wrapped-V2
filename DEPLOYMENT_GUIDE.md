# Vercel Deployment Guide

## Issues Fixed

### 1. World Map Fix
- **Problem**: The world map wasn't showing countries properly because it relied on hardcoded artist-to-country mappings
- **Solution**: Integrated MusicBrainz API (a free, reputable music database) to fetch real artist origin data
- **How it works**: When you upload your Spotify data, the app now queries MusicBrainz for each artist to get their actual country of origin

### 2. Vercel Deployment Fix
The deployment likely failed due to one or more of these issues:

#### Missing Environment Variables
You need to add these in your Vercel project settings:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

**How to get these:**
1. Go to https://developer.spotify.com/dashboard
2. Create a new app (or use an existing one)
3. Copy the Client ID and Client Secret
4. Add them to Vercel: Project Settings → Environment Variables

#### Build Configuration
Added `vercel.json` to ensure proper build settings.

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with fixes"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   
3. **Add Environment Variables**
   - In the import screen, expand "Environment Variables"
   - Add:
     - `SPOTIFY_CLIENT_ID` = your client ID
     - `SPOTIFY_CLIENT_SECRET` = your client secret
   
4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd your-project-directory
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add SPOTIFY_CLIENT_ID
   vercel env add SPOTIFY_CLIENT_SECRET
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

## Common Deployment Errors and Fixes

### Error: "Module not found"
**Fix**: Make sure all dependencies are in `package.json`
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Error: "Build failed"
**Fix**: Check the build logs in Vercel. Usually it's:
- Missing environment variables
- TypeScript errors (run `npm run type-check` locally first)
- Missing dependencies

### Error: "Function invocation timeout"
**Fix**: The MusicBrainz API calls might be slow. Consider:
- Reducing the number of artists fetched (already set to 30)
- Adding caching (future enhancement)

## Testing Locally Before Deployment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env.local` file**
   ```
   SPOTIFY_CLIENT_ID=your_id_here
   SPOTIFY_CLIENT_SECRET=your_secret_here
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Test the build**
   ```bash
   npm run build
   npm start
   ```

If it works locally, it should work on Vercel!

## What Changed

### app/api/spotify/images/route.ts
- Added `fetchArtistCountryFromMusicBrainz()` function
- Queries MusicBrainz API for each artist
- Maps country codes to ISO numeric format for the world map
- Implements rate limiting to respect API limits
- Falls back gracefully when country data isn't available

### vercel.json (New File)
- Ensures proper build configuration
- Specifies Next.js framework
- Sets region for optimal performance

## Troubleshooting

### Map Still Not Showing Countries

1. **Check browser console** for errors
2. **Verify MusicBrainz is responding**:
   - Open: https://musicbrainz.org/ws/2/artist/?query=drake&fmt=json
   - Should return JSON data
3. **Check if artists are being found**:
   - Look in Vercel logs for "No country data found for [artist]"

### Deployment Still Failing

1. **Check Vercel deployment logs**:
   - Go to your project in Vercel
   - Click on the failed deployment
   - Read the error message
   
2. **Common fixes**:
   - Add environment variables
   - Check Node.js version (should be 18.x or higher)
   - Verify all files are committed to Git

## Future Enhancements

1. **Caching**: Store MusicBrainz responses to reduce API calls
2. **Fallback Database**: Create a local artist-to-country mapping for common artists
3. **Better Error Handling**: Show which artists failed to fetch
4. **Alternative APIs**: Add fallback to other music databases if MusicBrainz is down

## Need Help?

If you're still having issues:
1. Share the Vercel deployment error logs
2. Check if environment variables are set correctly
3. Verify your Spotify API credentials are valid
4. Test locally first to isolate the issue
