import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import './Signup.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5002/login', { email, password });
      await login(response.data.token);
      navigate('/');
    } catch (err) {
      if (err.response) {
        setError(`Erreur: ${err.response.data}`);
      } else {
        setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    }
  };

  return (
    <div className="auth-container reverse">
      <div className="auth-content">
        <form onSubmit={handleLogin} className="auth-form">
          <h2>Connexion</h2>
          {error && <p className="error">{error}</p>}
          <div className="border">
            <div className="form-group">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            <button type="submit" className="auth-button">Connexion</button>
          </div>
          <p>
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
          </p>
        </form>
        <p className='register'>
          Je souhaite m'inscrire ? <Link to="/signup">Inscription</Link>
        </p>
      </div>
      <div className="auth-background">
        <img src="/uploads/home-slide.png" alt="Background" className="auth-background-image" />
      </div>
    </div>
  );
}

export default Login;
