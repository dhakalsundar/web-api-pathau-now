'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/app/lib/services';
import { clearAuthCookies, getAuthToken, getUserDetails, setAuthCookies } from '@/lib/cookies';

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
 * Persists user data and token in cookies
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication from cookies on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getAuthToken();
        const cookieUser = getUserDetails();

        if (token && cookieUser) {
          console.log(' [AUTH] Token and user found in cookies');
          setUser(cookieUser);
        } else if (token && !cookieUser) {
          console.warn(' [AUTH] Token found but user cookie missing');
          setUser(null);
        } else {
          console.warn(' [AUTH] No auth cookies found');
          setUser(null);
        }
      } catch (error) {
        console.error(' [AUTH] Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle user login
   *  authService.login() already saves token and user to cookies
   */
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      console.log(' [AUTH] Attempting login for:', email);
      const response = await authService.login(email, password);

      // Response structure: { success, message, data: { user, tokens } }
      if (response?.data?.user) {
        const userData = response.data.user;
        console.log(' [AUTH] Login successful for user:', userData.id);
        
        // Update context
        setUser(userData);

        // Ensure cookie payload is updated if needed
        const token = getAuthToken();
        if (token) {
          setAuthCookies(token, userData);
        }
        
        return userData;
      }

      throw new Error('Login failed: Invalid response structure');
    } catch (error) {
      console.error(' [AUTH] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   * Clears all auth data: cookies and context state
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log(' [AUTH] Initiating logout...');
      await authService.logout();
      setUser(null);
      console.log(' [AUTH] Logout successful - all auth data cleared');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error(' [AUTH] Logout error:', error);
      // Clear local state even if logout fails
      setUser(null);
      clearAuthCookies();
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
      const token = getAuthToken();
      if (token) {
        setAuthCookies(token, updatedUser);
      }
      console.log(' [AUTH] User data updated');
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
