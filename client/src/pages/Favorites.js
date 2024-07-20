import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faClock, faHeart, faFilm, faSignOutAlt, faTrash, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import TrailerModal from '../components/TrailerModal';
import { Link, useNavigate } from 'react-router-dom';


function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('/uploads/default-profile-picture.png');
  const [filter, setFilter] = useState('films'); // Par défaut, on affiche les films
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserDataAndFavorites = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5002/me', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setName(userResponse.data.name);
        if (userResponse.data.profile_picture) {
          setProfilePicture(`http://localhost:5002${userResponse.data.profile_picture}`);
        }

        const favoritesResponse = await axios.get('http://localhost:5002/favorites', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setFavorites(favoritesResponse.data);
        setFilteredFavorites(favoritesResponse.data.filter(fav => fav.type === 'film'));
      } catch (err) {
      }
    };

    fetchUserDataAndFavorites();
  }, []);

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
    if (filterType === 'films') {
      setFilteredFavorites(favorites.filter(fav => fav.type === 'film'));
    } else {
      setFilteredFavorites(favorites.filter(fav => fav.type === 'serie'));
    }
  };

  const handleMovieClick = async (movieId, type) => {
    try {
      const movieResponse = await axios.get(`https://api.themoviedb.org/3/${type}/${movieId}`, {
        params: {
          api_key: '561311980ae49b4077e5513c275e8d7c',
          append_to_response: 'videos,credits',
          language: 'fr-FR' // Demander les données en français
        }
      });

      const movieData = movieResponse.data;
      const trailer = movieData.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      setTrailerKey(trailer ? trailer.key : '');

      setSelectedMovie(movieData);
      setIsModalOpen(true);
    } catch (err) {
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
    setTrailerKey('');
  };

  const handleDeleteFavorite = async (movieId) => {
    try {
      await axios.delete(`http://localhost:5002/favorites/${movieId}`, {
        headers: { 'x-access-token': localStorage.getItem('token') }
      });
      setFavorites(favorites.filter(fav => fav.movie_id !== movieId));
      setFilteredFavorites(filteredFavorites.filter(fav => fav.movie_id !== movieId));
    } catch (err) {
    }
  };

  const handleMarkAsWatched = async (favorite) => {
    const { movie_id, type } = favorite;
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/${type === 'film' ? 'movie' : 'tv'}/${movie_id}`, {
        params: {
          api_key: '561311980ae49b4077e5513c275e8d7c',
          append_to_response: 'videos,credits',
          language: 'fr-FR'
        }
      });
      const contentDetails = response.data;
  
      const duration = type === 'film' ? contentDetails.runtime : (contentDetails.episode_run_time && contentDetails.episode_run_time[0]) || 0;
      const total_episodes = type === 'serie' ? contentDetails.number_of_episodes : 1;
      const genre = contentDetails.genres.map(g => g.name).join(', ');
  
      const watchHistoryData = {
        movie_id,
        duration,
        total_episodes,
        genre,
        type
      };
  
  
      await axios.post('http://localhost:5002/watch-history', watchHistoryData, {
        headers: { 'x-access-token': localStorage.getItem('token') }
      });
  
      // Supprimer le favori
      await handleDeleteFavorite(movie_id);
      // Rediriger vers la page d'historique de visionnage
      navigate('/watch-history');
    } catch (err) {
    }
  };
  

  const handleIconClick = () => {
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 0);
  };

  const handleUpdateProfilePicture = async (e) => {
    const formData = new FormData();
    if (fileInputRef.current.files[0]) {
      formData.append('profile_picture', fileInputRef.current.files[0]);
    }

    try {
      const response = await axios.put('http://localhost:5002/profile-picture', formData, {
        headers: {
          'x-access-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfilePicture(response.data.profile_picture ? `http://localhost:5002${response.data.profile_picture}` : '/uploads/default-profile-picture.png');
    } catch (err) {
    }
  };

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
      slidesToSlide: 1
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

  return (
    <div className="profile-container">
      <div className="sidebar">
        <div className="profile-picture1">
          <div className="profile-picture-wrapper">
            <img src={profilePicture} alt="Profil" />
            <FontAwesomeIcon icon={faPlus} className="edit-icon" onClick={handleIconClick} />
          </div>
          <p className="profile-name">{name}</p>
          <input
            type="file"
            id="profile_picture"
            name="profile_picture"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleUpdateProfilePicture}
          />
        </div>
        <nav>
          <ul>
            <li className="sidebar-item">
              <Link to="/dashboard">
                <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/profile">
                <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
                <span>Informations personnelles</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/watch-history">
                <FontAwesomeIcon icon={faClock} className="sidebar-icon" />
                <span>Historique de visionnage</span>
              </Link>
            </li>
            <li className="sidebar-item active">
              <Link to="/favorites">
                <FontAwesomeIcon icon={faHeart} className="sidebar-icon" />
                <span>Favoris à voir</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/catalogue">
                <FontAwesomeIcon icon={faFilm} className="sidebar-icon" />
                <span>Catalogue</span>
              </Link>
            </li>
            <li className="sidebar-item" id='logout' onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
              <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" />
              <span>Déconnexion</span>
            </li>
          </ul>
        </nav>
        <div className="notfound-logo1">
          <img src="/uploads/logo.PNG" alt="CineTrack Logo" />
        </div>
      </div>
      <div className="profile-content">
        <h2>Favoris à voir</h2>
        <div className="filter-buttons">
          <button className={filter === 'films' ? 'active' : ''} onClick={() => handleFilterChange('films')}>Films</button>
          <button className={filter === 'series' ? 'active' : ''} onClick={() => handleFilterChange('series')}>Séries</button>
        </div>
        <span id='trier'>Trier par date ajout</span>
        <Carousel responsive={responsive} arrows>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map(favorite => (
              <div key={favorite.movie_id} className="favorite-item" onClick={() => handleMovieClick(favorite.movie_id, favorite.type === 'film' ? 'movie' : 'tv')}>
                <img src={`https://image.tmdb.org/t/p/w500${favorite.cover_image_url}`} alt={favorite.title} />
                <div className="favorite-info">
                  <h3>{favorite.title}</h3>
                  <div className="favorite-actions">
                    <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDeleteFavorite(favorite.movie_id); }}>
                      <FontAwesomeIcon icon={faTrash} /> Supprimer
                    </button>
                    <button className="watch-button" onClick={(e) => { e.stopPropagation(); handleMarkAsWatched(favorite); }}>
                      <FontAwesomeIcon icon={faCheck} /> Terminer
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Aucun favori ajouté pour le moment.</p>
          )}
        </Carousel>
        <div className="welcome-message">
          <p>
            Nous sommes ravis de vous accueillir sur CineTrack, votre nouvel outil indispensable pour suivre vos films, séries et jeux vidéo préférés.
          </p>
          <p>
            Actuellement, vous avez accès à toutes les fonctionnalités de base de l'application, et ce gratuitement ! Restez connecté pour ne rien manquer de l'actualité du monde du cinéma.
          </p>
          <p>
            Nous travaillons activement à l'ajout de nouvelles fonctionnalités pour enrichir votre expérience utilisateur. N'hésitez pas à nous faire part de vos suggestions !
          </p>
        </div>
      </div>
      {selectedMovie && (
        <TrailerModal
          movie={selectedMovie}
          trailerKey={trailerKey}
          open={isModalOpen}
          onClose={handleCloseModal}
          isLoggedIn={true}
          isFavoritesPage={true} // Pass this prop to control the button visibility
        />
      )}
    </div>
  );
}

export default Favorites;
