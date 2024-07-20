import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound-container">
        <div className='background'>
      <h1>404</h1>
      <p>La page que vous demandez n'existe pas</p>
      <Link to="/" className="notfound-button">Retour à l'accueil</Link>
      <div className="notfound-logo">
        <img src="/uploads/logo.PNG" alt="CineTrack Logo" />
      </div>
      </div>
    </div>
  );
}

export default NotFound;
