import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('http://localhost:5002/me', {
        headers: { 'x-access-token': token }
      });
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des informations utilisateur', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchUserData(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
