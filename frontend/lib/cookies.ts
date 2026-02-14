"use client";

export const COOKIE_TOKEN = "pathaunow_token";
export const COOKIE_REFRESH_TOKEN = "pathaunow_refresh_token";
export const COOKIE_USER = "pathaunow_user";

function setCookie(name: string, value: string, days = 7) {
  if (typeof window === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function getCookie(name: string) {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const [k, v] = c.split("=");
    if (k === name) return decodeURIComponent(v || "");
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function setAuthCookies(token: string, refreshToken: string, user: any) {
  setCookie(COOKIE_TOKEN, token, 1); // Access token: 1 day (15 min expiry in token itself)
  setCookie(COOKIE_REFRESH_TOKEN, refreshToken, 7); // Refresh token: 7 days
  setCookie(COOKIE_USER, JSON.stringify(user), 7);
}

export function readAuthFromCookies() {
  const token = getCookie(COOKIE_TOKEN);
  const refreshToken = getCookie(COOKIE_REFRESH_TOKEN);
  const userRaw = getCookie(COOKIE_USER);

  let user: any = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  return { token, refreshToken, user };
}

export function updateAccessToken(token: string) {
  setCookie(COOKIE_TOKEN, token, 1);
}

export function clearAuthCookies() {
  deleteCookie(COOKIE_TOKEN);
  deleteCookie(COOKIE_REFRESH_TOKEN);
  deleteCookie(COOKIE_USER);
}
