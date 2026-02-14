'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/app/lib/services';
import { readAuthFromCookies } from '@/lib/cookies';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'RIDER';
  avatar?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * Provides authentication context to the entire application
 * Persists user data in localStorage and tokens in cookies
 * 
 * ⚠️ IMPORTANT: Tokens are stored in cookies via authService.login()
 * This context ensures user data is also synced to localStorage for quick access
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication from cookies and localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // First, try to read user from localStorage (faster)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // Verify token exists in cookies
            const { token } = readAuthFromCookies();
            if (!token) {
              console.warn('⚠️ [AUTH] User in localStorage but no token in cookies - clearing user');
              localStorage.removeItem('user');
              setUser(null);
            } else {
              console.log('✅ [AUTH] User and token restored from storage');
            }
          } catch (parseError) {
            console.error('Failed to parse stored user:', parseError);
            localStorage.removeItem('user');
          }
        } else {
          // Check if there's a token in cookies (user may have been cleared from localStorage)
          const { token, user: cookieUser } = readAuthFromCookies();
          if (token && cookieUser) {
            console.log('✅ [AUTH] Token found in cookies, restoring user');
            setUser(cookieUser);
            localStorage.setItem('user', JSON.stringify(cookieUser));
          }
        }
      } catch (error) {
        console.error('❌ [AUTH] Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user login
   * ✅ authService.login() already saves tokens to cookies via setAuthCookies()
   * This function ensures user data is also saved to localStorage
   */
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      console.log('🔐 [AUTH] Attempting login for:', email);
      const response = await authService.login(email, password);

      // Response structure: { success, message, data: { user, tokens } }
      if (response?.data?.user) {
        const userData = response.data.user;
        console.log('✅ [AUTH] Login successful for user:', userData.id);
        
        // Update context
        setUser(userData);
        
        // Ensure user is in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Verify token is in cookies (authService already set it)
        const { token } = readAuthFromCookies();
        if (token) {
          console.log('✅ [AUTH] Token confirmed in cookies');
        } else {
          console.warn('⚠️ [AUTH] Token not found in cookies after login!');
        }
        
        return userData;
      }

      throw new Error('Login failed: Invalid response structure');
    } catch (error) {
      console.error('❌ [AUTH] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔓 [AUTH] Logging out user');
      await authService.logout();
      setUser(null);
      localStorage.removeItem('user');
      console.log('✅ [AUTH] Logout successful, all auth data cleared');
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      // Clear local state even if logout fails
      setUser(null);
      localStorage.removeItem('user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user data (used after profile updates)
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ [AUTH] User data updated');
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the AuthContext
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
