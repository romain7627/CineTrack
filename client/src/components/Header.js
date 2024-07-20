import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Header.css';

function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageError = (e) => {
    e.target.src = '/uploads/default-profile-picture.png';
  };

  const isLoggedIn = !!user;

  useEffect(() => {
    if (user) {
    }
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="home-header">
      <div className="wrap">
        <div className="logo">
          <Link to="/">
            <img src="/uploads/logo.PNG" alt="CineTrack Logo" />
          </Link>
        </div>
        <div className="burger-menu" onClick={toggleMenu}>
          &#9776;
        </div>
        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/">Accueil</Link>
          <Link to="/faq">Faq</Link>
          {isLoggedIn && (
            <>
              <Link to="/catalogue" className="btn cinetrack-btn">Catalogue</Link>
              <Link to="/dashboard" className="btn cinetrack-btn">Mon CineTrack</Link>
            </>
          )}
        </nav>
        <div className="auth-buttons">
          {isLoggedIn ? (
            <div className="profile-menu">
              <button className="btn profile-btn" onClick={toggleProfileMenu}>
                <img
                  src={user.profile_picture ? `http://localhost:5002${user.profile_picture}` : '/uploads/default-profile-picture.png'}
                  alt="Profile"
                  className="profile-picture"
                  onError={handleImageError}
                />
                <span>{user.name}</span>
              </button>
              {isProfileOpen && (
                <div className="profile-dropdown">
                  <Link to="/profile">Profil</Link>
                  <button className="btn logout-btn" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signup" className="btn signup-btn">Inscription</Link>
              <Link to="/login" className="btn login-btn">Connexion</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
