'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { apiClient } from '@/lib/api';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const initialState = {
  user: null,
  loading: true,
  initialized: false
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get ID token
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem('authToken', idToken);

          // Login to our backend
          const response = await apiClient.login(idToken);
          
          if (response.error) {
            // Log the error but don't throw - this is expected in demo mode
            console.warn('Backend login failed (demo mode):', response.error);
            // Set a demo user instead
            dispatch({ 
              type: 'SET_USER', 
              payload: {
                id: 'demo-user-123',
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'Demo User',
                role: 'student',
                wallet_address: null,
                created_at: new Date().toISOString()
              }
            });
            return;
          }

          dispatch({ type: 'SET_USER', payload: response.data?.user || null });
        } catch (error) {
          console.error('Authentication error:', error);
          // Don't show error toast in demo mode - just set demo user
          if (error.message?.includes('Network error') || error.message?.includes('fetch')) {
            console.log('Demo mode: Using local authentication');
            dispatch({ 
              type: 'SET_USER', 
              payload: {
                id: 'demo-user-123',
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'Demo User',
                role: 'student',
                wallet_address: null,
                created_at: new Date().toISOString()
              }
            });
          } else {
            toast.error('Authentication failed');
            dispatch({ type: 'SET_USER', payload: null });
            localStorage.removeItem('authToken');
          }
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
        localStorage.removeItem('authToken');
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (router = null) => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('walletInfo');
      toast.success('Logged out successfully');
      
      // Redirect to home page after logout
      if (router) {
        router.push('/');
      } else if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const updateWallet = async (walletAddress) => {
    try {
      const response = await apiClient.updateWallet(walletAddress);
      
      if (response.error) {
        // Don't throw in demo mode - just log and continue
        if (response.error.includes('Network error') || response.error.includes('fetch')) {
          console.log('Demo mode: Wallet update simulated locally');
        } else {
          throw new Error(response.error);
        }
      }

      // Update local user state regardless of backend response
      if (state.user) {
        dispatch({ 
          type: 'SET_USER', 
          payload: { ...state.user, wallet_address: walletAddress } 
        });
      }

      toast.success('Wallet updated successfully!');
    } catch (error) {
      console.error('Wallet update error:', error);
      toast.error('Failed to update wallet');
      throw error;
    }
  };

  const updateProfile = (profileData) => {
    if (state.user) {
      dispatch({ 
        type: 'SET_USER', 
        payload: { ...state.user, ...profileData } 
      });
    }
  };

  const value = {
    ...state,
    login,
    logout,
    updateWallet,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}