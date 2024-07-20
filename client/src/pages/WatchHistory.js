import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faClock, faHeart, faFilm, faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import TrailerModal from '../components/TrailerModal';
import { Link } from 'react-router-dom';

function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('/uploads/default-profile-picture.png');
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailerKey, setTrailerKey] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserDataAndHistory = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5002/me', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setName(userResponse.data.name);
        if (userResponse.data.profile_picture) {
          setProfilePicture(`http://localhost:5002${userResponse.data.profile_picture}`);
        }

        const historyResponse = await axios.get('http://localhost:5002/watch-history', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setHistory(historyResponse.data);
      } catch (err) {
      }
    };

    fetchUserDataAndHistory();
  }, []);

  const fetchContentDetails = async (contentId, type) => {
    try {
      const contentResponse = await axios.get(`https://api.themoviedb.org/3/${type}/${contentId}`, {
        params: {
          api_key: '561311980ae49b4077e5513c275e8d7c',
          append_to_response: 'videos,credits',
          language: 'fr-FR'
        }
      });
      return contentResponse.data;
    } catch (err) {
      return null;
    }
  };

  const handleContentClick = async (contentId, type) => {
    const contentDetails = await fetchContentDetails(contentId, type);

    if (contentDetails) {
      const trailer = contentDetails.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      setTrailerKey(trailer ? trailer.key : '');

      setSelectedContent(contentDetails);
      setIsModalOpen(true);
    } else {
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
    setTrailerKey('');
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
            <li className="sidebar-item active">
              <Link to="/watch-history">
                <FontAwesomeIcon icon={faClock} className="sidebar-icon" />
                <span>Historique de visionnage</span>
              </Link>
            </li>
            <li className="sidebar-item">
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
        <h2>Historique de visionnage</h2>
        <span id='trier'>Trier par date ajout</span>
        <Carousel responsive={responsive} arrows>
          {history.length > 0 ? (
            history.map(item => (
              <div key={item.movie_id} className="favorite-item" onClick={() => handleContentClick(item.movie_id, item.type === 'film' ? 'movie' : 'tv')}>
                <img src={`https://image.tmdb.org/t/p/w500${item.cover_image_url}`} alt={item.title} />
                <div className="favorite-info">
                  <h3>{item.title}</h3>
                </div>
              </div>
            ))
          ) : (
            <p>Aucun historique de visionnage pour le moment.</p>
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
      {selectedContent && (
        <TrailerModal
          movie={selectedContent}
          trailerKey={trailerKey}
          open={isModalOpen}
          onClose={handleCloseModal}
          isLoggedIn={true}
          isFavoritesPage={false}
        />
      )}
    </div>
  );
}

export default WatchHistory;
