import React, { useState } from 'react';
import './FAQ.css';

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="faq-container">
      <h1>Foire Aux Questions</h1>
      <div className="faq-section">
        <button
          className={`accordion ${activeIndex === 0 ? 'active' : ''}`}
          onClick={() => toggleAccordion(0)}
        >
          Comment puis-je créer un compte sur CineTrack ?
        </button>
        <div className={`panel ${activeIndex === 0 ? 'active' : ''}`}>
          <p>Pour créer un compte, cliquez sur le bouton "Inscription" en haut à droite de la page d'accueil. Remplissez les informations requises et suivez les instructions.</p>
        </div>
      </div>
      <div className="faq-section">
        <button
          className={`accordion ${activeIndex === 1 ? 'active' : ''}`}
          onClick={() => toggleAccordion(1)}
        >
          Comment puis-je réinitialiser mon mot de passe ?
        </button>
        <div className={`panel ${activeIndex === 1 ? 'active' : ''}`}>
          <p>Si vous avez oublié votre mot de passe, cliquez sur le lien "Mot de passe oublié ?" sur la page de connexion. Suivez les instructions pour réinitialiser votre mot de passe.</p>
        </div>
      </div>
      <div className="faq-section">
        <button
          className={`accordion ${activeIndex === 2 ? 'active' : ''}`}
          onClick={() => toggleAccordion(2)}
        >
          Comment puis-je contacter le support client ?
        </button>
        <div className={`panel ${activeIndex === 2 ? 'active' : ''}`}>
          <p>Pour contacter le support client, envoyez-nous un email à support@cinetrack.com. Nous vous répondrons dans les plus brefs délais.</p>
        </div>
      </div>
      <div className="faq-section">
        <button
          className={`accordion ${activeIndex === 3 ? 'active' : ''}`}
          onClick={() => toggleAccordion(3)}
        >
          Quels sont les avantages d'un compte CineTrack ?
        </button>
        <div className={`panel ${activeIndex === 3 ? 'active' : ''}`}>
          <p>Avec un compte CineTrack, vous pouvez suivre vos films préférés, créer des listes de souhaits, et recevoir des recommandations personnalisées.</p>
        </div>
      </div>
      <div className="faq-section">
        <button
          className={`accordion ${activeIndex === 4 ? 'active' : ''}`}
          onClick={() => toggleAccordion(4)}
        >
          Puis-je partager mon compte avec d'autres personnes ?
        </button>
        <div className={`panel ${activeIndex === 4 ? 'active' : ''}`}>
          <p>Non, votre compte CineTrack est personnel et ne doit pas être partagé avec d'autres personnes. Cela permet de garantir la sécurité de vos informations personnelles.</p>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
