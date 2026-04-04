// ═══════════════════════════════════════════
//  Spotify API Integration Module
// ═══════════════════════════════════════════

const SPOTIFY_CLIENT_ID = '030425b6f52a4c11968bdf8af42facd8';
const REDIRECT_URI = 'https://ohrainy.github.io/';
const SCOPES = 'user-read-currently-playing user-read-playback-state';
const TOKEN_KEY = 'spotify_token_data';
const npArea = document.getElementById('np-area');
let progressTimer = null;

function generateRandomString(length) { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'; const arr = new Uint8Array(length); crypto.getRandomValues(arr); return Array.from(arr, b => chars[b % chars.length]).join(''); }
async function sha256(plain) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain)); }
function base64encode(input) { const bytes = new Uint8Array(input); let str = ''; bytes.forEach(b => str += String.fromCharCode(b)); return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }

function showConnect() { npArea.innerHTML = `<button class="spotify-connect" onclick="startAuth()"><i class="fa-brands fa-spotify"></i> Connect Spotify</button>`; }

function showIdle(msg) { 
  npArea.innerHTML = `<div class="now-playing">
    <div class="np-art">
      <div class="np-bars paused">
        <div class="np-bar"></div>
        <div class="np-bar"></div>
        <div class="np-bar"></div>
        <div class="np-bar"></div>
      </div>
    </div>
    <div class="np-info">
      <div class="np-label idle-label">
        <span class="np-dot"></span>
        <span>Not listening</span>
      </div>
      <div class="np-idle-text">${msg}</div>
    </div>
    <!-- ✅ PROGRESS BAR CONTAINER (always present!) -->
    <div class="np-progress-wrap">
      <div class="np-progress-bar" id="np-bar" style="width: 0%"></div>
    </div>
  </div>`;
}

function showTrack(song, artist, image, isPlaying, progressMs, durationMs) { 
  const pct = (isPlaying && durationMs > 0) ? Math.min((progressMs / durationMs) * 100, 100) : 0; 
  
  npArea.innerHTML = `
    <div class="now-playing active">
      <div class="np-art">
        ${image 
          ? `<img src="${image}" alt="Album Art">` 
          : `<div class="np-bars ${isPlaying ? '' : 'paused'}">
              <div class="np-bar"></div>
              <div class="np-bar"></div>
              <div class="np-bar"></div>
              <div class="np-bar"></div>
            </div>`
        }
      </div>
      <div class="np-info">
        <div class="np-label">
          <span class="np-dot"></span>
          <span>${isPlaying ? 'Listening to' : 'Paused'}</span>
        </div>
        <div class="np-song">${song}</div>
        <div class="np-artist">${artist}</div>
        
        <!-- ✅ PROGRESS BAR (shows when playing!) -->
        ${isPlaying ? `
          <div class="np-progress-wrap">
            <div class="np-progress-bar" id="np-bar" style="width: ${pct}%"></div>
          </div>
        ` : `
          <div class="np-progress-wrap">
            <div class="np-progress-bar" id="np-bar" style="width: 0%"></div>
          </div>
        `}
      </div>
    </div>
  `;
  
  if (isPlaying) startProgress(progressMs, durationMs);
}

function startProgress(progressMs, durationMs) { 
  if (progressTimer) clearInterval(progressTimer); 
  const bar = document.getElementById('np-bar'); 
  if (!bar) return; 
  
  const startTime = Date.now() - progressMs; 
  
  progressTimer = setInterval(() => { 
    const elapsed = Date.now() - startTime; 
    const pct = Math.min((elapsed / durationMs) * 100, 100); 
    bar.style.width = pct + '%'; 
    
    if (pct >= 100) clearInterval(progressTimer); 
  }, 1000);
}

async function startAuth() { 
  const verifier = generateRandomString(64); 
  sessionStorage.setItem('pkce_verifier', verifier); 
  const challenge = base64encode(await sha256(verifier)); 
  
  const params = new URLSearchParams({ 
    response_type: 'code', 
    client_id: SPOTIFY_CLIENT_ID, 
    scope: SCOPES, 
    code_challenge_method: 'S256', 
    code_challenge: challenge, 
    redirect_uri: REDIRECT_URI 
  }); 
  
  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString(); 
}

async function exchangeCode(code) { 
  const verifier = sessionStorage.getItem('pkce_verifier'); 
  if (!verifier) return null; 
  
  const res = await fetch('https://accounts.spotify.com/api/token', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
    body: new URLSearchParams({ 
      grant_type: 'authorization_code', 
      code: code, 
      redirect_uri: REDIRECT_URI, 
      client_id: SPOTIFY_CLIENT_ID, 
      code_verifier: verifier 
    }) 
  }); 
  
  if (!res.ok) return null; 
  
  const data = await res.json(); 
  data.expires_at = Date.now() + data.expires_in * 1000; 
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data)); 
  sessionStorage.removeItem('pkce_verifier'); 
  
  return data;
}

async function refreshToken() { 
  const stored = JSON.parse(localStorage.getItem(TOKEN_KEY)); 
  if (!stored?.refresh_token) return null; 
  
  const res = await fetch('https://accounts.spotify.com/api/token', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
    body: new URLSearchParams({ 
      grant_type: 'refresh_token', 
      refresh_token: stored.refresh_token, 
      client_id: SPOTIFY_CLIENT_ID 
    }) 
  }); 
  
  if (!res.ok) { 
    localStorage.removeItem(TOKEN_KEY); 
    return null; 
  } 
  
  const data = await res.json(); 
  data.refresh_token = data.refresh_token || stored.refresh_token; 
  data.expires_at = Date.now() + data.expires_in * 1000; 
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data)); 
  
  return data;
}

async function getValidToken() { 
  const stored = JSON.parse(localStorage.getItem(TOKEN_KEY)); 
  
  if (stored?.access_token && stored.expires_at > Date.now()) { 
    return stored.access_token; 
  }
  
  if (stored?.refresh_token) { 
    const r = await refreshToken(); 
    return r?.access_token || null; 
  }
  
  return null;
}

async function fetchNowPlaying() { 
  const token = await getValidToken(); 
  
  if (!token) { 
    showConnect(); 
    return; 
  } 
  
  try { 
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { 
      headers: { 'Authorization': 'Bearer ' + token } 
    }); 
    
    if (res.status === 204) { 
      showIdle('Nothing playing right now'); 
      return; 
    }
    
    if (res.status === 401) { 
      if (await refreshToken()) return fetchNowPlaying(); 
      showConnect(); 
      return; 
    }
    
    if (!res.ok) { 
      showIdle('Could not load track'); 
      return; 
    }
    
    const d = await res.json(); 
    
    showTrack(
      d.item.name, 
      d.item.artists.map(a => a.name).join(', '), 
      d.item.album.images[d.item.album.images.length - 1]?.url || '', 
      d.is_playing, 
      d.progress_ms, 
      d.item.duration_ms
    ); 
    
  } catch (error) { 
    console.error('Spotify error:', error);
    showIdle('Could not connect to Spotify'); 
  }
}

async function initSpotify() { 
  const urlParams = new URLSearchParams(location.search); 
  const code = urlParams.get('code'); 
  
  if (code) { 
    history.replaceState({}, document.title, REDIRECT_URI); 
    await exchangeCode(code); 
  } 
  
  await fetchNowPlaying(); 
  
  // Poll every 5 seconds for updates
  setInterval(fetchNowPlaying, 5000);
}

// Initialize when page loads
initSpotify();
