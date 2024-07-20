import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css'; // Réutiliser le même fichier CSS pour les styles

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('http://localhost:5002/forgot-password', { email });
      setMessage('Un lien de réinitialisation du mot de passe a été envoyé à votre adresse email.');
    } catch (err) {
      if (err.response) {
        setError(`Erreur: ${err.response.data}`);
      } else {
        setError('Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="auth-container reverse">
      <div className="auth-content">
        <form onSubmit={handleForgotPassword} className="auth-form">
          <h2>Réinitialiser le mot de passe</h2>
          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}
          <div className="border">
            <div className="form-group">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="auth-button">Envoyer</button>
          </div>
          <p>
            Retour à la <Link to="/login">Connexion</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
