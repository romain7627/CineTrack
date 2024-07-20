import axios from 'axios';

const API_URL = 'http://localhost:5002';

const getMovies = (token) => {
  return axios.get(`${API_URL}/movies`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const saveFavorite = (movie_id, token) => {
  return axios.post(`${API_URL}/favorites`, { movie_id }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export default {
  getMovies,
  saveFavorite
};
