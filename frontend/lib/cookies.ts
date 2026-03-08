"use client";

export const COOKIE_TOKEN = "auth_token";
export const COOKIE_USER = "user_data";

function setCookie(name: string, value: string, days = 7) {
  if (typeof window === "undefined") {
    console.warn(` [Cookies] Cannot set cookie '${name}' - window is undefined`);
    return;
  }

  if (!value) {
    console.error(` [Cookies] Cannot set cookie '${name}' - value is empty`);
    return;
  }

  const maxAge = days * 24 * 60 * 60;
  const encodedValue = encodeURIComponent(value);
  const cookieValue = `${name}=${encodedValue}; path=/; max-age=${maxAge}; samesite=lax`;
  
  try {
    document.cookie = cookieValue;
    console.log(` [Cookies] Set cookie '${name}' (${value.length} chars, expires in ${days} days)`);
    
    // Verify cookie was set
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const found = cookies.find(c => c.startsWith(name + "="));
    if (found) {
      console.log(` [Cookies] Verified cookie '${name}' exists in document.cookie`);
    } else {
      console.error(` [Cookies] Failed to verify cookie '${name}' in document.cookie`);
    }
  } catch (error) {
    console.error(` [Cookies] Error setting cookie '${name}':`, error);
  }
}

function getCookie(name: string) {
  if (typeof window === "undefined") {
    console.warn(` [Cookies] Cannot get cookie '${name}' - SSR context (window undefined)`);
    return null;
  }

  try {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    console.log(` [Cookies] Looking for '${name}' in ${cookies.length} cookies`);
    
    for (const c of cookies) {
      const [k, v] = c.split("=");
      if (k === name) {
        const value = decodeURIComponent(v || "");
        console.log(` [Cookies] Retrieved '${name}' (${value.length} chars)`);
        return value;
      }
    }
    
    console.warn(` [Cookies] Cookie '${name}' not found. Available: [${cookies.map(c => c.split("=")[0]).join(", ")}]`);
    return null;
  } catch (error) {
    console.error(` [Cookies] Error reading '${name}':`, error);
    return null;
  }
}

function deleteCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function setAuthCookies(token: string, user: any) {
  console.log(' [AuthCookies] Starting to set auth cookies...');

  if (!token) {
    console.error(' [AuthCookies] Cannot set cookies - token is empty');
    return;
  }

  const userPayload = user
    ? {
        id: user.id || user._id || null,
        email: user.email || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        role: user.role || null,
        avatar: user.avatar || null,
        phoneNumber: user.phoneNumber || null,
        createdAt: user.createdAt || null,
      }
    : null;

  console.log(`[AuthCookies] Setting:
    - Token: ${token.length} chars
    - User: ${userPayload?.id || 'no user'}`);

  setCookie(COOKIE_TOKEN, token, 7); // Token: 7 days
  if (userPayload) {
    setCookie(COOKIE_USER, JSON.stringify(userPayload), 7);
  }

  console.log(' [AuthCookies] All auth cookies set');
}

export function getAuthToken() {
  return getCookie(COOKIE_TOKEN);
}

export function getUserDetails() {
  const userRaw = getCookie(COOKIE_USER);
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw);
  } catch (error) {
    console.error(' [AuthCookies] Failed to parse user cookie:', error);
    return null;
  }
}

export function readAuthFromCookies() {
  console.log(' [AuthCookies] Reading auth from cookies...');
  
  try {
    const token = getAuthToken();
    const user = getUserDetails();

    if (token && user) {
      console.log(` [AuthCookies] Auth complete - User: ${user.id}, Role: ${user.role}, Token: ${token.substring(0, 10)}...`);
    } else if (token) {
      console.warn(` [AuthCookies] Partial auth - Token present but missing user`);
    } else {
      console.warn(` [AuthCookies] No auth found in cookies`);
    }

    return { token, user };
  } catch (error) {
    console.error(' [AuthCookies] Error reading auth:', error);
    return { token: null, user: null };
  }
}

export function updateAccessToken(token: string) {
  setCookie(COOKIE_TOKEN, token, 7);
}

export function clearAuthCookies() {
  console.log(' [AuthCookies] Clearing all authentication cookies...');
  
  try {
    // Log what we're about to delete
    const tokenExists = getCookie(COOKIE_TOKEN) !== null;
    const userExists = getCookie(COOKIE_USER) !== null;
    
    console.log(`[AuthCookies] Before cleanup:
    - Token cookie: ${tokenExists ? ' exists' : ' not found'}
    - User cookie: ${userExists ? ' exists' : ' not found'}`);
    
    // Delete cookies
    deleteCookie(COOKIE_TOKEN);
    deleteCookie(COOKIE_USER);
    
    // Verify deletion
    const tokenAfter = getCookie(COOKIE_TOKEN) !== null;
    const userAfter = getCookie(COOKIE_USER) !== null;
    
    console.log(`[AuthCookies] After cleanup:
    - Token cookie: ${tokenAfter ? ' still exists (FAILED)' : ' deleted'}
    - User cookie: ${userAfter ? ' still exists (FAILED)' : ' deleted'}`);
    
    if (!tokenAfter && !userAfter) {
      console.log(' [AuthCookies] All auth cookies successfully cleared');
    } else {
      console.error(' [AuthCookies] Some cookies failed to clear');
    }
  } catch (error) {
    console.error(' [AuthCookies] Error clearing cookies:', error);
  }
}
