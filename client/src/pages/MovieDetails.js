import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MovieDetails.css';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '561311980ae49b4077e5513c275e8d7c';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
          params: {
            api_key: API_KEY,
            language: 'fr-FR',
          },
        });
        setMovie(response.data);
      } catch (error) {
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (!movie) return <div>Chargement...</div>;


}

export default MovieDetails;
