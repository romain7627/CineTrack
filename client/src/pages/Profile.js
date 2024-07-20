import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faClock, faHeart, faFilm, faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('/uploads/default-profile-picture.png');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5002/me', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setName(response.data.name);
        setEmail(response.data.email);
        setProfilePicture(response.data.profile_picture ? `http://localhost:5002${response.data.profile_picture}` : '/uploads/default-profile-picture.png');
      } catch (err) {
        setError('Erreur lors de la récupération des informations de profil');
      }
    };

    fetchUserData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (currentPassword) formData.append('currentPassword', currentPassword);
    if (newPassword) formData.append('newPassword', newPassword);
    if (fileInputRef.current.files[0]) {
      formData.append('profile_picture', fileInputRef.current.files[0]);
    }

    try {
      const response = await axios.put('http://localhost:5002/profile', formData, {
        headers: {
          'x-access-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Mise à jour réussie!');
      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setProfilePicture(response.data.profile_picture ? `http://localhost:5002${response.data.profile_picture}` : '/uploads/default-profile-picture.png');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Mot de passe actuel incorrect');
      } else {
        setError('Erreur lors de la mise à jour des informations. Veuillez réessayer.');
      }
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/uploads/default-profile-picture.png';
  };

  const handleIconClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 0);
  };

  return (
    <div className="profile-container">
      <div className="sidebar">
        <div className="profile-picture1">
          <div className="profile-picture-wrapper">
            <img src={profilePicture} alt="Profil" onError={handleImageError} />
            <FontAwesomeIcon icon={faPlus} className="edit-icon" onClick={handleIconClick} />
          </div>
          <p className="profile-name">{name}</p>
        </div>
        <nav>
          <ul>
            <li className="sidebar-item">
              <Link to="/dashboard">
                <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="sidebar-item active">
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
        <h2>Informations personnelles</h2>
        <form onSubmit={handleUpdate} className="profile-form">
          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}
          <div className="form-group">
            <label htmlFor="name">Pseudo</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!isEditing}
              required
            />
          </div>
          {isEditing && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez le mot de passe actuel"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez le nouveau mot de passe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile_picture">Photo de profil</label>
                <input
                  type="file"
                  id="profile_picture"
                  name="profile_picture"
                  accept="image/*"
                  ref={fileInputRef}
                />
              </div>
            </>
          )}
          {isEditing ? (
            <>
              <div className='infoperso'>
                <button type="submit" className="profile-button">Enregistrer</button>
                <button type="button" className="profile-button" onClick={() => setIsEditing(false)}>Annuler</button>
              </div>
            </>
          ) : (
            <div className='infoperso'>
              <button type="button" className="profile-button" onClick={() => setIsEditing(true)}>Modifier</button>
            </div>
          )}
        </form>
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
    </div>
  );
}

export default Profile;
