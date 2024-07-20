import React, { useState, useEffect } from 'react';
import { getLatestMovies, getPopularMovies, getLatestTVShows, getPopularTVShows, getGenres, getMovieDetails, getTVShowDetails } from '../services/tmdbService';

const MyComponent = () => {
  const [latestMovies, setLatestMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [latestTVShows, setLatestTVShows] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchLatestMovies = async () => {
      const movies = await getLatestMovies();
      setLatestMovies(movies);
    };

    const fetchPopularMovies = async () => {
      const movies = await getPopularMovies();
      setPopularMovies(movies);
    };

    const fetchLatestTVShows = async () => {
      const shows = await getLatestTVShows();
      setLatestTVShows(shows);
    };

    const fetchPopularTVShows = async () => {
      const shows = await getPopularTVShows();
      setPopularTVShows(shows);
    };

    const fetchGenres = async () => {
      const genres = await getGenres();
      setGenres(genres);
    };

    fetchLatestMovies();
    fetchPopularMovies();
    fetchLatestTVShows();
    fetchPopularTVShows();
    fetchGenres();
  }, []);

  const handleMovieClick = async (movieId) => {
    const details = await getMovieDetails(movieId);
    setDetails(details);
  };

  const handleTVShowClick = async (showId) => {
    const details = await getTVShowDetails(showId);
    setDetails(details);
  };

  return (
    <div>
      <h1>Latest Movies</h1>
      <ul>
        {latestMovies.map(movie => (
          <li key={movie.id} onClick={() => handleMovieClick(movie.id)}>
            {movie.title}
          </li>
        ))}
      </ul>

      <h1>Popular Movies</h1>
      <ul>
        {popularMovies.map(movie => (
          <li key={movie.id} onClick={() => handleMovieClick(movie.id)}>
            {movie.title}
          </li>
        ))}
      </ul>

      <h1>Latest TV Shows</h1>
      <ul>
        {latestTVShows.map(show => (
          <li key={show.id} onClick={() => handleTVShowClick(show.id)}>
            {show.name}
          </li>
        ))}
      </ul>

      <h1>Popular TV Shows</h1>
      <ul>
        {popularTVShows.map(show => (
          <li key={show.id} onClick={() => handleTVShowClick(show.id)}>
            {show.name}
          </li>
        ))}
      </ul>

      <h1>Genres</h1>
      <ul>
        {genres.map(genre => (
          <li key={genre.id}>{genre.name}</li>
        ))}
      </ul>

      {details && (
        <div>
          <h1>{details.title || details.name}</h1>
          <p>{details.overview}</p>
          <ul>
            {details.genres.map(genre => (
              <li key={genre.id}>{genre.name}</li>
            ))}
          </ul>
          <h2>Cast</h2>
          <ul>
            {details.credits.cast.map(actor => (
              <li key={actor.id}>{actor.name} as {actor.character}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyComponent;
