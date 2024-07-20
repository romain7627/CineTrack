import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './TrailerModal.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '1000px',
  boxShadow: 24,
  outline: 'none',
  background: 'rgba(0, 0, 0, 0.9)',
  borderRadius: '10px',
  overflowY: 'auto',
  maxHeight: '90vh'
};

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};

function TrailerModal({ movie, trailerKey, open, onClose, isLoggedIn, saveMovie, showAddToFavoritesButton }) {
  const [message, setMessage] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (movie && movie.number_of_seasons > 0) {
        const seasonPromises = [];
        for (let i = 1; i <= movie.number_of_seasons; i++) {
          seasonPromises.push(
            fetch(`https://api.themoviedb.org/3/tv/${movie.id}/season/${i}?api_key=561311980ae49b4077e5513c275e8d7c&language=fr-FR`)
              .then(response => response.json())
              .catch(error => {
                console.error('Erreur lors de la récupération des détails de la saison:', error);
                return { episodes: [] }; // Return empty episodes array on error
              })
          );
        }
        const seasonData = await Promise.all(seasonPromises);
        setSeasons(seasonData);

        const totalEpisodesCount = seasonData.reduce((total, season) => total + (season.episodes ? season.episodes.length : 0), 0);
        setTotalEpisodes(totalEpisodesCount);
      }
    };

    fetchSeasonDetails();
  }, [movie]);

  const handleAddToFavorites = async () => {
    const movieData = {
      movie_id: movie.id,
      title: movie.title || movie.name,
      genre: movie.genres.map(genre => genre.name).join(', '),
      release_date: movie.release_date || movie.first_air_date,
      synopsis: movie.overview,
      cover_image_url: movie.poster_path,
      type: movie.title ? 'film' : 'serie'
    };

    try {
      await saveMovie(movieData);
      setMessage('');
      navigate('/favorites'); // Redirection vers la page des favoris
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage('Ce favori existe déjà.');
      } else {
        setMessage('Erreur lors de l\'ajout aux favoris.');
      }
      console.error('Erreur lors de l\'ajout aux favoris:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <div className="modal-container">
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
          {trailerKey ? (
            <iframe
              width="100%"
              height="500px"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Trailer"
              className="trailer-video"
            ></iframe>
          ) : (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title || movie.name}
              className="trailer-video"
            />
          )}
          <div className="modal-info">
            <Typography id="modal-title" variant="h6" component="h2">
              {movie.title || movie.name}
            </Typography>
            {isLoggedIn && showAddToFavoritesButton && (
              <button
                className="favorite-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToFavorites();
                }}
              >
                <FontAwesomeIcon icon={faHeart} /> Ajouter aux favoris
              </button>
            )}
            {message && <Typography variant="body2" className="message">{message}</Typography>}
            <div className="info-container">
              <div className="info-section">
                <Typography variant="body1"><strong>Genre</strong></Typography>
                <Typography variant="body2">{movie.genres.map(genre => genre.name).join(', ') || ''}</Typography>
              </div>
              <div className="info-section">
                <Typography variant="body1"><strong>Date de sortie</strong></Typography>
                <Typography variant="body2">{formatDate(movie.release_date || movie.first_air_date) || ''}</Typography>
              </div>
              <div className="info-section">
                <Typography variant="body1"><strong>Type</strong></Typography>
                <Typography variant="body2">{movie.title ? 'Film' : 'Série'}</Typography>
              </div>
              <div className="info-section">
                <Typography variant="body1"><strong>Durée</strong></Typography>
                <Typography variant="body2">{movie.runtime || (movie.episode_run_time && movie.episode_run_time[0]) ? `${movie.runtime || movie.episode_run_time[0]} min` : ''}</Typography>
              </div>
              {seasons.length > 0 && (
                <div className="info-section">
                  <Typography variant="body1"><strong>Épisodes par saison</strong></Typography>
                  <Typography variant="body2">Total d'épisodes: {totalEpisodes}</Typography>
                  {seasons.map((season, index) => (
                    <Accordion key={index}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                      >
                        <Typography>Saison {season.season_number}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          Nombre d'épisodes: {season.episodes ? season.episodes.length : 'N/A'}
                        </Typography>
                        <ul>
                          {season.episodes && season.episodes.map((episode) => (
                            <li key={episode.id}>{episode.name}</li>
                          ))}
                        </ul>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              )}
              <div className="info-section">
                <Typography variant="body1"><strong>Résumé</strong></Typography>
                <Typography variant="body2">{movie.overview || ''}</Typography>
              </div>
            </div>
            <div className="actors-carousel-container">
              <Typography sx={{ mt: 2 }}><strong>Acteurs</strong></Typography>
              <Carousel responsive={responsive} arrows>
                {movie.credits.cast.map(actor => (
                  actor.profile_path ? (
                    <div className="actor-card" key={actor.id}>
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="actor-image"
                      />
                      <Typography className="actor-name">{actor.name}</Typography>
                      <Typography className="actor-character">{actor.character}</Typography>
                    </div>
                  ) : (
                    <div className="actor-card" key={actor.id}>
                      <Typography className="actor-name">{actor.name}</Typography>
                      <Typography className="actor-character">{actor.character}</Typography>
                    </div>
                  )
                ))}
              </Carousel>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default TrailerModal;
