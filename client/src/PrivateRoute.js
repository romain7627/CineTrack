import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5002/checkSession', {
          headers: { 'x-access-token': token }
        });

        setIsAuthenticated(response.data.auth);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // ou un spinner de chargement
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
