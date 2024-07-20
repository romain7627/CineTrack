// src/pages/ResetPassword.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Signup.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5002/reset-password/${token}`, { password });
      setMessage('Votre mot de passe a été réinitialisé avec succès.');
      setError('');
    } catch (error) {
      setError('Erreur lors de la réinitialisation du mot de passe.');
      setMessage('');
    }
  };

  return (
    <div>
      <Header />
      <div className="signup-page-custom">
        <div className="image-container-custom">
          <img src="/uploads/home-slide.png" alt="CineTrack" />
        </div>
        <div className="signup-container-custom">
          <div className="signup-form-custom">
            <h2>Réinitialiser le mot de passe</h2>
            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleResetPassword}>
              <div className="form-group-custom">
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Réinitialiser le mot de passe</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPassword;
