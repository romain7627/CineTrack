import axios from 'axios';

const API_URL = 'http://localhost:5002'; // Remplacez par l'URL de votre serveur backend

const signup = (name, email, password) => {
  return axios.post(`${API_URL}/signup`, { name, email, password });
};

const login = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password })
    .then(response => response.data);
};

export default {
  signup,
  login
};
