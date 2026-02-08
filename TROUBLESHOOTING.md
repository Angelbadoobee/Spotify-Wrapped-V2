# Quick Troubleshooting Guide

## World Map Not Showing Countries

### Issue 1: No countries are highlighted at all
**Diagnosis**: MusicBrainz API not returning data
**Solution**:
1. Open browser console (F12)
2. Look for errors related to "MusicBrainz"
3. Test API manually: https://musicbrainz.org/ws/2/artist/?query=drake&fmt=json
4. If MusicBrainz is down, wait a few minutes and reload

### Issue 2: Only some countries are highlighted
**Diagnosis**: Some artists don't have country data in MusicBrainz
**Solution**: This is normal! Not all artists have location data. The map will only show countries for artists where data is available.

### Issue 3: Wrong countries are highlighted
**Diagnosis**: Artist name matching issue
**Solution**: MusicBrainz matches by artist name. If the Spotify data has slight variations in artist names, it might match the wrong artist.

## Vercel Deployment Errors

### Error: "SPOTIFY_CLIENT_ID is not defined"
**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `SPOTIFY_CLIENT_ID` (your ID from Spotify Dashboard)
   - `SPOTIFY_CLIENT_SECRET` (your secret from Spotify Dashboard)
3. Redeploy

### Error: "Build failed - Module not found"
**Solution**:
```bash
# Make sure all deps are installed
npm install
# Commit the lock file
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Error: "Function invocation timeout"
**Solution**:
The MusicBrainz API calls might be timing out. This can happen if you have many artists.
- The app is already configured to batch requests and add delays
- If it persists, you might need to reduce the number of artists queried (currently 30)
- Edit `app/overview/page.tsx` line 62 to reduce from `slice(0, 30)` to `slice(0, 20)`

### Error: "Application error: a client-side exception has occurred"
**Solution**:
1. Check Vercel function logs for the actual error
2. Most common cause: missing environment variables
3. Verify your `.env.local` has the same variables as production

## Local Development Issues

### Map works locally but not in production
**Possible causes**:
1. Environment variables not set in Vercel
2. API timeout in production (Vercel has 10s limit for hobby tier)
3. MusicBrainz rate limiting

**Solutions**:
- Verify environment variables in Vercel
- Check Vercel function logs for timeout errors
- Consider upgrading Vercel plan if using many artists

### How to test the MusicBrainz integration locally

1. Open browser console
2. Navigate to the Overview page
3. Look for console logs like:
   - "No country data found for [Artist Name]" (normal for some artists)
   - "MusicBrainz error for [Artist Name]" (API error)
4. Check Network tab for:
   - Calls to `musicbrainz.org`
   - Response codes (429 = rate limit, 503 = service down)

## Performance Tips

### Map loading slowly
**Cause**: MusicBrainz API is being called for each artist
**Improvements you can make**:

1. **Reduce artist count** (app/overview/page.tsx line 62):
   ```typescript
   const uniqueArtists = Array.from(
     new Set(profile.topArtists.map(a => a.name))
   ).slice(0, 20); // Change from 30 to 20
   ```

2. **Cache results** (future enhancement):
   - Store artist countries in localStorage
   - Only query MusicBrainz for new artists

3. **Use a database** (advanced):
   - Pre-populate a database with common artist countries
   - Fall back to MusicBrainz only for unknown artists

## API Rate Limits

### MusicBrainz Rate Limits
- **Limit**: 1 request per second (we respect this with delays)
- **What we do**: Batch artists in groups of 5, with 100ms delay between each
- **If you hit the limit**: Wait 1 minute and try again

### Spotify API Rate Limits
- **Limit**: Depends on your app's quota
- **Usually**: Very generous for personal use
- **If you hit the limit**: Will see 429 errors in Vercel logs

## Still Having Issues?

1. **Check Vercel Logs**:
   - Go to your project in Vercel
   - Click "Deployments"
   - Click on the latest deployment
   - Click "Functions" tab
   - Look for errors

2. **Test Locally First**:
   ```bash
   npm run build
   npm start
   # If it works here, issue is deployment-specific
   ```

3. **Common Environment Variable Mistakes**:
   - Using wrong Spotify credentials
   - Not setting variables in Vercel (they're separate from local .env)
   - Using development credentials in production

4. **Check Dependencies**:
   ```bash
   npm outdated
   # Update if needed
   npm update
   ```

## Need More Help?

Create a GitHub issue with:
1. Exact error message
2. Vercel deployment logs
3. Browser console errors (F12 → Console tab)
4. Steps to reproduce
