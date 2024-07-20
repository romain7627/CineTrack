import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="home-footer">
      <div className="footer-wrap">
      <div className="footer-logo">
      <Link to="/">
            <img src="/uploads/logo.PNG" alt="CineTrack Logo" />
          </Link>        </div>
        <nav className="footer-nav">
          <Link to="/">Accueil</Link>
          <Link to="/faq">Faq</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Politique de confidentialité</Link>
          <Link to="/terms-of-service">Conditions d'utilisations</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
