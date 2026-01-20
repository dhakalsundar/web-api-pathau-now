"use client";

export const COOKIE_TOKEN = "pathaunow_token";
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

export function setAuthCookies(token: string, user: any) {
  setCookie(COOKIE_TOKEN, token);
  setCookie(COOKIE_USER, JSON.stringify(user));
}

export function readAuthFromCookies() {
  const token = getCookie(COOKIE_TOKEN);
  const userRaw = getCookie(COOKIE_USER);

  let user: any = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  return { token, user };
}

export function clearAuthCookies() {
  deleteCookie(COOKIE_TOKEN);
  deleteCookie(COOKIE_USER);
}
