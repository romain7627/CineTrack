import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css'; // Importez le fichier CSS pour les styles

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 6;
    const maxLength = 20;
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    // Optionally, you can add more checks like special characters
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength || password.length > maxLength) {
      return `Le mot de passe doit contenir entre ${minLength} et ${maxLength} caractères.`;
    }
    if (!hasNumber.test(password) || !hasLetter.test(password)) {
      return 'Le mot de passe doit contenir des lettres et des chiffres.';
    }
    // Optionally, add the special character check
    // if (!hasSpecialChar.test(password)) {
    //   return 'Le mot de passe doit contenir au moins un caractère spécial.';
    // }
    return '';
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5002/signup', { name, email, password });
      setMessage('Inscription réussie! Vous allez être redirigé vers la page de connexion.');
      setTimeout(() => {
        navigate('/login'); // Redirection après 3 secondes
      }, 3000);
    } catch (err) {
      if (err.response) {
        setError(`Erreur: ${err.response.data}`);
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <img src="/uploads/home-slide.png" alt="Background" className="auth-background-image" />
      </div>
      <div className="auth-content">
        <form onSubmit={handleSignup} className="auth-form">
          <h2>S'inscrire</h2>
          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}
          <div className='border'>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Pseudo" 
                value={name} 
                onChange={(e) => setName(e.target.value.replace(/[<>]/g, ''))} 
                required 
              />
            </div>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value.replace(/[<>]/g, ''))} 
                required 
              />
            </div>
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/[<>]/g, ''))}
                required
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            <button type="submit" className="auth-button">S'inscrire</button>
          </div>
          <p>
            Je souhaite me connecter ? <Link to="/login">Connexion</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
