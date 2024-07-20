import axios from 'axios';

const API_KEY = '561311980ae49b4077e5513c275e8d7c';
const BASE_URL = 'https://api.themoviedb.org/3';

export const getLatestMovies = async () => {
  const response = await axios.get(`${BASE_URL}/movie/now_playing`, {
    params: {
      api_key: API_KEY,
      language: 'fr-FR',
      page: 1
    }
  });
  return response.data.results;
};

export const getPopularMovies = async () => {
  const response = await axios.get(`${BASE_URL}/movie/popular`, {
    params: {
      api_key: API_KEY,
      language: 'fr-FR'
    }
  });
  return response.data.results;
};

export const getGenres = async () => {
  const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
    params: {
      api_key: API_KEY,
      language: 'fr-FR'
    }
  });
  return response.data.genres;
};

export const getMovieDetails = async (movieId) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
    params: {
      api_key: API_KEY,
      append_to_response: 'videos,credits',
      language: 'fr-FR'
    }
  });
  return response.data;
};

export const getSeriesDetails = async (seriesId) => {
  const response = await axios.get(`${BASE_URL}/tv/${seriesId}`, {
    params: {
      api_key: API_KEY,
      append_to_response: 'videos,credits',
      language: 'fr-FR'
    }
  });
  return response.data;
};

export const getPopularSeries = async () => {
  const response = await axios.get(`${BASE_URL}/tv/popular`, {
    params: {
      api_key: API_KEY,
      language: 'fr-FR'
    }
  });
  return response.data.results;
};

export const getLatestSeries = async () => {
  const response = await axios.get(`${BASE_URL}/tv/airing_today`, {
    params: {
      api_key: API_KEY,
      language: 'fr-FR'
    }
  });
  return response.data.results;
};



export const getFrenchMovies = async () => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      with_original_language: 'fr',
      language: 'fr-FR'

    }
  });
  return response.data.results;
};

export const getFrenchSeries = async () => {
  const response = await axios.get(`${BASE_URL}/discover/tv`, {
    params: {
      api_key: API_KEY,
      with_original_language: 'fr',
      language: 'fr-FR'

    }
  });
  return response.data.results;
};

export const getActionMovies = async () => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      with_genres: 28,      language: 'fr-FR'

    }
  });
  return response.data.results;
};

export const getComedyMovies = async () => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      with_genres: 35,
      language: 'fr-FR'

    }
  });
  return response.data.results;
};

export const getKidsMovies = async () => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      certification_country: 'US',
      certification: 'G',
      language: 'fr-FR'

    }
  });
  return response.data.results;
};

export const getDocumentaries = async () => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      with_genres: 99,
      language: 'fr-FR'

    }
  });
  return response.data.results;
};
