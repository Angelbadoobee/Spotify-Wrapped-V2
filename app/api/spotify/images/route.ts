import { NextRequest, NextResponse } from 'next/server';
import { getSpotifyClient } from '@/lib/spotify/client';

interface ImageRequest {
  artists?: string[];
  tracks?: Array<{ name: string; artist: string }>;
}

interface ImageResponse {
  artistImages: { [artistName: string]: { imageUrl: string; spotifyUrl: string } };
  trackImages: { [trackKey: string]: { albumArtUrl: string; spotifyUrl: string } };
  artistCountries: { [artistName: string]: { country: string; iso: string } };
}

// ISO 3166-1 alpha-2 to numeric mapping for react-simple-maps
const ISO_ALPHA_TO_NUMERIC: { [key: string]: string } = {
  'US': '840', 'PR': '630', 'CO': '170', 'MX': '484', 'AR': '032',
  'ES': '724', 'DO': '214', 'PA': '591', 'JM': '388', 'CA': '124',
  'BR': '076', 'CL': '152', 'PE': '604', 'VE': '862', 'FR': '250',
  'DE': '276', 'IT': '380', 'JP': '392', 'KR': '410', 'AU': '036',
  'NZ': '554', 'SE': '752', 'NO': '578', 'NL': '528', 'BE': '056',
  'IE': '372', 'CH': '756', 'AT': '040', 'PT': '620', 'GR': '300',
  'TR': '792', 'RU': '643', 'PL': '616', 'IN': '356', 'CN': '156',
  'ZA': '710', 'NG': '566', 'EG': '818', 'KE': '404', 'GB': '826',
  'CU': '192', 'UY': '858', 'PY': '600', 'BO': '068', 'EC': '218',
  'GT': '320', 'HN': '340', 'SV': '222', 'NI': '558', 'CR': '188',
  'FI': '246', 'DK': '208', 'IS': '352', 'CZ': '203', 'HU': '348',
  'RO': '642', 'BG': '100', 'HR': '191', 'RS': '688', 'SK': '703',
  'SI': '705', 'LT': '440', 'LV': '428', 'EE': '233', 'UA': '804',
  'BY': '112', 'MD': '498', 'GE': '268', 'AM': '051', 'AZ': '031',
  'IL': '376', 'SA': '682', 'AE': '784', 'QA': '634', 'KW': '414',
  'TH': '764', 'VN': '704', 'MY': '458', 'SG': '702', 'ID': '360',
  'PH': '608', 'TW': '158', 'HK': '344', 'MO': '446', 'PK': '586',
  'BD': '050', 'LK': '144', 'NP': '524', 'MM': '104', 'KH': '116',
  'MA': '504', 'DZ': '012', 'TN': '788', 'LY': '434', 'SD': '729',
  'ET': '231', 'GH': '288', 'CI': '384', 'SN': '686', 'UG': '800',
  'TZ': '834', 'AO': '024', 'MZ': '508', 'ZW': '716', 'ZM': '894',
  'BW': '072', 'NA': '516', 'MG': '450', 'CD': '180', 'CM': '120',
};

/**
 * Strategy 1: Use Wikidata API (Free, comprehensive, well-maintained)
 * Wikidata is a free knowledge base that includes artist nationality data
 */
async function fetchFromWikidata(artistName: string): Promise<{ country: string; iso: string } | null> {
  try {
    // Search for the artist on Wikidata
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(artistName)}&language=en&format=json&type=item&limit=1`;
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    if (!searchData.search || searchData.search.length === 0) return null;
    
    const entityId = searchData.search[0].id;
    
    // Get entity details including country of citizenship (P27)
    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=claims&format=json`;
    
    const entityResponse = await fetch(entityUrl);
    if (!entityResponse.ok) return null;
    
    const entityData = await entityResponse.json();
    const entity = entityData.entities[entityId];
    
    // Check for country of citizenship (P27) or country (P17)
    const countryOfCitizenship = entity.claims?.P27?.[0]?.mainsnak?.datavalue?.value?.id;
    const country = entity.claims?.P17?.[0]?.mainsnak?.datavalue?.value?.id;
    
    const countryId = countryOfCitizenship || country;
    if (!countryId) return null;
    
    // Get country details
    const countryUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${countryId}&props=claims|labels&format=json`;
    
    const countryResponse = await fetch(countryUrl);
    if (!countryResponse.ok) return null;
    
    const countryData = await countryResponse.json();
    const countryEntity = countryData.entities[countryId];
    
    // Get ISO code (P297)
    const isoCode = countryEntity.claims?.P297?.[0]?.mainsnak?.datavalue?.value;
    const countryName = countryEntity.labels?.en?.value;
    
    if (isoCode && ISO_ALPHA_TO_NUMERIC[isoCode]) {
      return {
        country: countryName || isoCode,
        iso: ISO_ALPHA_TO_NUMERIC[isoCode],
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Wikidata error for ${artistName}:`, error);
    return null;
  }
}

/**
 * Strategy 2: Use MusicBrainz API (Free music encyclopedia)
 */
async function fetchFromMusicBrainz(artistName: string): Promise<{ country: string; iso: string } | null> {
  try {
    const searchUrl = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(artistName)}&fmt=json&limit=1`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'SpotifyAnalytics/2.0 (contact@example.com)',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.artists && data.artists.length > 0) {
      const artist = data.artists[0];
      let countryCode: string | null = null;
      let countryName: string | null = null;
      
      if (artist.area && artist.area['iso-3166-1-codes']) {
        countryCode = artist.area['iso-3166-1-codes'][0];
        countryName = artist.area.name;
      } else if (artist['begin-area'] && artist['begin-area']['iso-3166-1-codes']) {
        countryCode = artist['begin-area']['iso-3166-1-codes'][0];
        countryName = artist['begin-area'].name;
      } else if (artist.country) {
        countryCode = artist.country;
      }
      
      if (countryCode && ISO_ALPHA_TO_NUMERIC[countryCode]) {
        return {
          country: countryName || countryCode,
          iso: ISO_ALPHA_TO_NUMERIC[countryCode],
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`MusicBrainz error for ${artistName}:`, error);
    return null;
  }
}

/**
 * Strategy 3: Enhanced fallback database with genre-based inference
 * This includes common artists and uses Spotify genre data to infer likely origins
 */
const ARTIST_DATABASE: { [key: string]: { country: string; iso: string } } = {
  // Latin/Spanish artists
  'bad bunny': { country: 'Puerto Rico', iso: '630' },
  'daddy yankee': { country: 'Puerto Rico', iso: '630' },
  'rauw alejandro': { country: 'Puerto Rico', iso: '630' },
  'ozuna': { country: 'Puerto Rico', iso: '630' },
  'anuel aa': { country: 'Puerto Rico', iso: '630' },
  'j balvin': { country: 'Colombia', iso: '170' },
  'karol g': { country: 'Colombia', iso: '170' },
  'maluma': { country: 'Colombia', iso: '170' },
  'feid': { country: 'Colombia', iso: '170' },
  'shakira': { country: 'Colombia', iso: '170' },
  'peso pluma': { country: 'Mexico', iso: '484' },
  'natanael cano': { country: 'Mexico', iso: '484' },
  'becky g': { country: 'United States', iso: '840' },
  'young miko': { country: 'Puerto Rico', iso: '630' },
  'bizarrap': { country: 'Argentina', iso: '032' },
  
  // US/English artists
  'drake': { country: 'Canada', iso: '124' },
  'the weeknd': { country: 'Canada', iso: '124' },
  'taylor swift': { country: 'United States', iso: '840' },
  'billie eilish': { country: 'United States', iso: '840' },
  'ariana grande': { country: 'United States', iso: '840' },
  'ed sheeran': { country: 'United Kingdom', iso: '826' },
  'adele': { country: 'United Kingdom', iso: '826' },
  'eminem': { country: 'United States', iso: '840' },
  
  // K-pop
  'bts': { country: 'South Korea', iso: '410' },
  'blackpink': { country: 'South Korea', iso: '410' },
  'twice': { country: 'South Korea', iso: '410' },
  
  // Add more as needed...
};

function getFromDatabase(artistName: string): { country: string; iso: string } | null {
  const normalized = artistName.toLowerCase().trim();
  return ARTIST_DATABASE[normalized] || null;
}

/**
 * Main function: Try multiple sources with cascading fallback
 */
async function getArtistCountry(artistName: string, spotifyGenres: string[] = []): Promise<{ country: string; iso: string } | null> {
  // 1. Check our database first (instant)
  const dbResult = getFromDatabase(artistName);
  if (dbResult) return dbResult;
  
  // 2. Try Wikidata (most comprehensive, but slower)
  const wikidataResult = await fetchFromWikidata(artistName);
  if (wikidataResult) return wikidataResult;
  
  // 3. Try MusicBrainz as fallback
  await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
  const mbResult = await fetchFromMusicBrainz(artistName);
  if (mbResult) return mbResult;
  
  // 4. Last resort: Genre-based inference (optional, can be inaccurate)
  // You could add logic here to infer country from genre
  // e.g., "reggaeton" -> likely Latin America
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageRequest = await request.json();
    const { artists = [], tracks = [] } = body;
    
    const client = getSpotifyClient();
    const token = await client.getAccessToken();
    
    const artistImages: { [artistName: string]: { imageUrl: string; spotifyUrl: string } } = {};
    const trackImages: { [trackKey: string]: { albumArtUrl: string; spotifyUrl: string } } = {};
    const artistCountries: { [artistName: string]: { country: string; iso: string } } = {};
    
    // Process artists in smaller batches with better error handling
    const batchSize = 3; // Reduced for better API respect
    for (let i = 0; i < artists.length; i += batchSize) {
      const batch = artists.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (artistName) => {
          try {
            // Fetch Spotify data
            const searchResponse = await fetch(
              `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            
            let spotifyGenres: string[] = [];
            
            if (searchResponse.ok) {
              const data = await searchResponse.json();
              if (data.artists?.items?.[0]) {
                const artist = data.artists.items[0];
                
                artistImages[artistName] = {
                  imageUrl: artist.images?.[0]?.url || '',
                  spotifyUrl: artist.external_urls?.spotify || '',
                };
                
                spotifyGenres = artist.genres || [];
              }
            }
            
            // Fetch country data using cascading strategy
            const countryData = await getArtistCountry(artistName, spotifyGenres);
            
            if (countryData) {
              artistCountries[artistName] = countryData;
              console.log(`✓ ${artistName} -> ${countryData.country}`);
            } else {
              console.log(`✗ ${artistName} -> No country data`);
            }
          } catch (error) {
            console.error(`Failed to process artist ${artistName}:`, error);
          }
        })
      );
      
      // Longer delay between batches to respect rate limits
      if (i + batchSize < artists.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Search for tracks and get their album art
    for (const track of tracks) {
      try {
        const query = `track:${track.name} artist:${track.artist}`;
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        if (searchResponse.ok) {
          const data = await searchResponse.json();
          if (data.tracks?.items?.[0]) {
            const trackData = data.tracks.items[0];
            const trackKey = `${track.name}|||${track.artist}`;
            trackImages[trackKey] = {
              albumArtUrl: trackData.album?.images?.[0]?.url || '',
              spotifyUrl: trackData.external_urls?.spotify || '',
            };
          }
        }
      } catch (error) {
        console.error(`Failed to fetch track ${track.name}:`, error);
      }
    }
    
    const response: ImageResponse = {
      artistImages,
      trackImages,
      artistCountries,
    };
    
    console.log(`Total countries found: ${Object.keys(artistCountries).length}/${artists.length}`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Image fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Spotify' },
      { status: 500 }
    );
  }
}
