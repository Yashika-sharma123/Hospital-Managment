import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // step 1: request an OTP for a phone number
  const requestOtp = async (phone) => {
    const { data } = await api.post('/auth/request-otp', { phone });
    return data.data; // { phone, expiresInMinutes, devOtp? }
  };

  // step 2: verify the code, completes login
  const verifyOtp = async (phone, code) => {
    const { data } = await api.post('/auth/verify-otp', { phone, code });
    const { user: loggedInUser, accessToken, refreshToken } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, requestOtp, verifyOtp, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
