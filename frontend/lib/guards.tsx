"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readAuthFromCookies } from './cookies';

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    const { token } = readAuthFromCookies();
    if (!token) router.replace('/login');
  }, [router]);
}

export function useRequireAdmin() {
  const router = useRouter();
  useEffect(() => {
    const { token, user } = readAuthFromCookies();
    if (!token) return router.replace('/login');
    if (!user || user.role !== 'admin') return router.replace('/');
  }, [router]);
}
