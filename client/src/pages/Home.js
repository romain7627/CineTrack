import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { getPopularMovies, getGenres, getMovieDetails, getLatestMovies, getPopularSeries, getLatestSeries, getSeriesDetails } from '../services/tmdbService';
import TrailerModal from '../components/TrailerModal';
import './Home.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

function Home() {
  const [popularContent, setPopularContent] = useState([]);
  const [latestContent, setLatestContent] = useState([]);
  const [genres, setGenres] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [favoriteMessages, setFavoriteMessages] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchContentAndGenres = async () => {
      try {
        const [popularMovies, latestMovies, popularSeries, latestSeries, genresData] = await Promise.all([
          getPopularMovies(),
          getLatestMovies(),
          getPopularSeries(),
          getLatestSeries(),
          getGenres()
        ]);

        const genresMap = {};
        genresData.forEach(genre => {
          genresMap[genre.id] = genre.name;
        });

        setPopularContent([...popularMovies, ...popularSeries]);
        setLatestContent([...latestMovies, ...latestSeries]);
        setGenres(genresMap);
      } catch (error) {
      }
    };

    fetchContentAndGenres();
  }, []);

  const handleContentClick = async (contentId, isMovie) => {
    try {
      const contentDetails = isMovie ? await getMovieDetails(contentId) : await getSeriesDetails(contentId);
      const trailer = contentDetails.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
      setSelectedContent(contentDetails);
      setTrailerKey(trailer ? trailer.key : null);
      setModalIsOpen(true);
    } catch (error) {
    }
  };

  const handleCloseModal = () => {
    setSelectedContent(null);
    setTrailerKey(null);
    setModalIsOpen(false);
  };

  const handleAddToFavorites = async (contentData) => {
    try {
      await axios.post('http://localhost:5002/favorites', contentData, {
        headers: { 'x-access-token': localStorage.getItem('token') }
      });
      setFavoriteMessages((prevMessages) => ({
        ...prevMessages,
        [contentData.movie_id]: 'Favori ajouté avec succès'
      }));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setFavoriteMessages((prevMessages) => ({
          ...prevMessages,
          [contentData.movie_id]: 'Ce favori existe déjà.'
        }));
      } else {
        setFavoriteMessages((prevMessages) => ({
          ...prevMessages,
          [contentData.movie_id]: 'Erreur lors de l\'ajout aux favoris.'
        }));
      }
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: <button className="slick-arrow slick-next">›</button>,
    prevArrow: <button className="slick-arrow slick-prev">‹</button>,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      }, 
      {
        breakpoint: 460,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="home">
      <section className="hero">
        <img src="/uploads/banniere.webp" alt="Bannière" className="hero-image" />
        <div className="hero-content">
          <h1>Bienvenue chez CineTrack</h1>
          <button id='button1' onClick={() => navigate('/signup')}>S'inscrire</button>
          <button onClick={() => navigate('/login')}>Se connecter</button>
          <div className="backgroundOpacity">
            <p>Notre catalogue de films et séries</p>
            <div className="logos">
              <img src="/uploads/netflix.webp" alt="Netflix" />
              <img src="/uploads/prime.webp" alt="Prime Video" />
              <img src="/uploads/disney.webp" alt="Disney+" />
              <img src="/uploads/atv.webp" alt="HBO" />
              <img src="/uploads/rakuten.webp" alt="HBO" />
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="text-container">
          <h1>Gardez une trace de ce que vous regardez</h1>
          <p>
            CineTrack est une application conçue pour les amateurs de films et de séries souhaitant organiser et suivre facilement leurs visionnages.
            Avec une interface intuitive et des fonctionnalités robustes, CineTrack offre une solution complète pour gérer votre collection de contenus multimédias.
          </p>
        </div>
        <div className="image-container">
          <img src="uploads/home.png" alt="CineTrack Banner"></img>
        </div>
      </div>

      <div className="section-title">
        <h2>Populaires</h2>
        <div className="line"></div>
      </div>

      <div className="popular-movies-container">
        <Slider {...settings}>
          {popularContent.map((content) => (
            <div
              key={content.id}
              className="movie"
              onClick={() => handleContentClick(content.id, content.title ? true : false)}
            >
              <img src={`https://image.tmdb.org/t/p/w500${content.poster_path}`} alt={content.title || content.name} />
              <div className="movie-info">
                <h3>{content.title || content.name}</h3>
                <p>{genres[content.genre_ids[0]]}</p>
                {localStorage.getItem('token') && (
                  <>
                    <button
                      className="favorite-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFavorites({
                          movie_id: content.id,
                          title: content.title || content.name,
                          genre: genres[content.genre_ids[0]],
                          release_date: content.release_date,
                          synopsis: content.overview,
                          cover_image_url: content.poster_path,
                          type: content.title ? 'film' : 'serie'
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faHeart} /> Ajouter aux favoris
                    </button>
                    {favoriteMessages[content.id] && <p>{favoriteMessages[content.id]}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div className="section-title">
        <h2>Nouveautés</h2>
        <div className="line"></div>
      </div>

      <div className="latest-movies-container">
        <Slider {...settings}>
          {latestContent.map((content) => (
            <div
              key={content.id}
              className="movie"
              onClick={() => handleContentClick(content.id, content.title ? true : false)}
            >
              <img src={`https://image.tmdb.org/t/p/w500${content.poster_path}`} alt={content.title || content.name} />
              <div className="movie-info">
                <h3>{content.title || content.name}</h3>
                <p>{genres[content.genre_ids[0]]}</p>
                {localStorage.getItem('token') && (
                  <>
                    <button
                      className="favorite-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFavorites({
                          movie_id: content.id,
                          title: content.title || content.name,
                          genre: genres[content.genre_ids[0]],
                          release_date: content.release_date,
                          synopsis: content.overview,
                          cover_image_url: content.poster_path,
                          type: content.title ? 'film' : 'serie'
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faHeart} /> Ajouter aux favoris
                    </button>
                    {favoriteMessages[content.id] && <p>{favoriteMessages[content.id]}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {selectedContent && (
        <TrailerModal
          movie={selectedContent}
          trailerKey={trailerKey}
          open={modalIsOpen}
          onClose={handleCloseModal}
          isLoggedIn={!!localStorage.getItem('token')}
          saveMovie={handleAddToFavorites}
          showAddToFavoritesButton={true} // Show the button
        />
      )}
    </div>
  );
}

export default Home;
