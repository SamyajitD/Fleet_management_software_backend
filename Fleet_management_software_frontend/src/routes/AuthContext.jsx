// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token); // Debug log

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/auth/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Auth status response:', data); // Debug log

      if (response.ok && data.isAuthenticated) {
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error('Auth check failed');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      resetAuth();
    }
  };

  const resetAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      resetAuth,
      checkAuthStatus // Export this so we can call it after login
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
