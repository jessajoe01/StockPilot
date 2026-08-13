import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// AuthContext lets any page/component in the app check:
// "Is someone logged in right now?" and "Who are they?"
// without passing that data down manually through every component.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if a token+user were already saved from a previous session
  useEffect(() => {
    const savedUser = localStorage.getItem('stockpilot_user');
    const savedToken = localStorage.getItem('stockpilot_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Called after a successful login API call
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;

    localStorage.setItem('stockpilot_token', access_token);
    localStorage.setItem('stockpilot_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // Called after a successful register API call
  const register = async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  };

  // Clears saved login data
  const logout = () => {
    localStorage.removeItem('stockpilot_token');
    localStorage.removeItem('stockpilot_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so pages can just write: const { user, login } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}