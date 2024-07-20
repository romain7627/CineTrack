import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPopularMovies, getLatestMovies, getPopularSeries,
  getLatestSeries, getGenres, getMovieDetails, getSeriesDetails,
  getDocumentaries, getKidsMovies, getComedyMovies, getFrenchMovies, getFrenchSeries, getActionMovies
} from '../services/tmdbService';
import TrailerModal from '../components/TrailerModal';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Catalogue.css';

function Catalogue() {
  const [content, setContent] = useState([]);
  const [genres, setGenres] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [favoriteMessages, setFavoriteMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState([]);
  const [filterGenre, setFilterGenre] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContentAndGenres = async () => {
      try {
        const [
          popularMoviesData, latestMoviesData, popularSeriesData,
          latestSeriesData, genresData, documentariesData,
          kidsMoviesData, comediesData, frenchMoviesData,
          frenchSeriesData, actionMoviesData
        ] = await Promise.all([
          getPopularMovies(), getLatestMovies(), getPopularSeries(),
          getLatestSeries(), getGenres(), getDocumentaries(),
          getKidsMovies(), getComedyMovies(), getFrenchMovies(),
          getFrenchSeries(), getActionMovies()
        ]);

        const allContent = [
          ...popularMoviesData,
          ...latestMoviesData,
          ...popularSeriesData,
          ...latestSeriesData,
          ...documentariesData,
          ...kidsMoviesData,
          ...comediesData,
          ...frenchMoviesData,
          ...frenchSeriesData,
          ...actionMoviesData
        ];

        const genresMap = {};
        genresData.forEach(genre => {
          genresMap[genre.id] = genre.name;
        });

        setContent(allContent);
        setGenres(genresMap);
        setFilteredContent(allContent);
      } catch (error) {
      }
    };

    fetchContentAndGenres();
  }, []);

  const deduplicateContent = (contentArray) => {
    const uniqueContent = {};
    contentArray.forEach(content => {
      uniqueContent[content.id] = content;
    });
    return Object.values(uniqueContent);
  };

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

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = deduplicateContent(content.filter(c =>
      (c.title || c.name).toLowerCase().includes(query)
    ));
    setFilteredContent(filtered);
  };

  const handleFilterChange = (e) => {
    const genre = e.target.value;
    setFilterGenre(genre);

    const filtered = deduplicateContent(content.filter(c =>
      c.genre_ids.includes(parseInt(genre))
    ));
    setFilteredContent(filtered);
  };

  return (
    <div className="custom-catalogue">
      <div className="custom-catalogue-header">
        <h1>Catalogue</h1>
        <button className="custom-back-button" onClick={() => navigate('/dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Retour au dashboard
        </button>
      </div>

      <div className="custom-filter-search-container">
        <div className="custom-filter-container">
          <label htmlFor="genreFilter">Filtrer par genre: </label>
          <select id="genreFilter" value={filterGenre} onChange={handleFilterChange}>
            <option value="">Tous</option>
            {Object.keys(genres).map(genreId => (
              <option key={genreId} value={genreId}>{genres[genreId]}</option>
            ))}
          </select>
        </div>

        <div className="custom-search-container">
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {searchQuery || filterGenre ? (
        <div>
          <h2>Résultats de la recherche et du filtre</h2>
          {filteredContent.length > 0 ? (
            <CarouselSection
              content={filteredContent}
              handleContentClick={handleContentClick}
              genres={genres}
              handleAddToFavorites={handleAddToFavorites}
              favoriteMessages={favoriteMessages}
            />
          ) : (
            <p>Il n'y a rien qui correspond à ce genre ou titre.</p>
          )}
        </div>
      ) : (
        <>
          <div className="custom-section-title">
            <h2>Populaires</h2>
            <div className="custom-line"></div>
          </div>
          <CarouselSection content={deduplicateContent(content.filter(c => c.popularity > 7.5))} handleContentClick={handleContentClick} genres={genres} handleAddToFavorites={handleAddToFavorites} favoriteMessages={favoriteMessages} />

          <div className="custom-section-title">
            <h2>Nouveautés</h2>
            <div className="custom-line"></div>
          </div>
          <CarouselSection content={deduplicateContent(content.filter(c => new Date(c.release_date) > new Date().setMonth(new Date().getMonth() - 3)))} handleContentClick={handleContentClick} genres={genres} handleAddToFavorites={handleAddToFavorites} favoriteMessages={favoriteMessages} />

          <div className="custom-section-title">
            <h2>Documentaires</h2>
            <div className="custom-line"></div>
          </div>
          <CarouselSection content={deduplicateContent(content.filter(c => c.genre_ids.includes(99)))} handleContentClick={handleContentClick} genres={genres} handleAddToFavorites={handleAddToFavorites} favoriteMessages={favoriteMessages} />

          <div className="custom-section-title">
            <h2>Films pour enfants</h2>
            <div className="custom-line"></div>
          </div>
          <CarouselSection content={deduplicateContent(content.filter(c => c.genre_ids.includes(16)))} handleContentClick={handleContentClick} genres={genres} handleAddToFavorites={handleAddToFavorites} favoriteMessages={favoriteMessages} />

          <div className="custom-section-title">
            <h2>Comédies</h2>
            <div className="custom-line"></div>
          </div>
          <CarouselSection content={deduplicateContent(content.filter(c => c.genre_ids.includes(35)))} handleContentClick={handleContentClick} genres={genres} handleAddToFavorites={handleAddToFavorites} favoriteMessages={favoriteMessages} />
        </>
      )}

      {selectedContent && (
        <TrailerModal
          movie={selectedContent}
          trailerKey={trailerKey}
          open={modalIsOpen}
          onClose={handleCloseModal}
          isLoggedIn={!!localStorage.getItem('token')}
          saveMovie={handleAddToFavorites}
          showAddToFavoritesButton={true}
        />
      )}
    </div>
  );
}

const CarouselSection = ({ content, handleContentClick, genres, handleAddToFavorites, favoriteMessages }) => {
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const startScroll = () => {
      intervalRef.current = setInterval(() => {
        if (carouselRef.current) {
          const maxScrollLeft = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
          if (carouselRef.current.scrollLeft >= maxScrollLeft) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
          }
        }
      }, 2000);
    };

    startScroll();

    return () => clearInterval(intervalRef.current);
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="custom-carousel-section">
      <button className="custom-carousel-arrow left" onClick={scrollLeft}>‹</button>
      <div className="custom-carousel" ref={carouselRef}>
        {content.map((content) => (
          <div
            key={content.id}
            className="custom-movie"
            onClick={() => handleContentClick(content.id, content.title ? true : false)}
          >
            <img src={`https://image.tmdb.org/t/p/w500${content.poster_path}`} alt={content.title || content.name} />
            <div className="custom-movie-info">
              <h3>{content.title || content.name}</h3>
              <p>{genres[content.genre_ids[0]]}</p>
              {localStorage.getItem('token') && (
                <>
                  <button
                    className="custom-favorite-button"
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
      </div>
      <button className="custom-carousel-arrow right" onClick={scrollRight}>›</button>
    </div>
  );
};

export default Catalogue;
