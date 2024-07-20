import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faClock, faHeart, faFilm, faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Profile.css';

function Dashboard() {
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('/uploads/default-profile-picture.png');
  const [statistics, setStatistics] = useState({
    totalMovies: 0,
    totalSeries: 0,
    totalDuration: 0,
    favoriteGenre: 'N/A'
  });
  const [genreDistribution, setGenreDistribution] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5002/me', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setName(response.data.name);
        if (response.data.profile_picture) {
          setProfilePicture(`http://localhost:5002${response.data.profile_picture}`);
        }
      } catch (err) {
      }
    };

    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:5002/statistics', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setStatistics(response.data);
      } catch (err) {
      }
    };

    const fetchGenreDistribution = async () => {
      try {
        const response = await axios.get('http://localhost:5002/genre-distribution', {
          headers: { 'x-access-token': localStorage.getItem('token') }
        });
        setGenreDistribution(response.data);
      } catch (err) {
      }
    };

    fetchUserData();
    fetchStatistics();
    fetchGenreDistribution();
  }, []);

  const handleImageError = (e) => {
    e.target.src = '/uploads/default-profile-picture.png';
  };

  const handleIconClick = () => {
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 0);
  };

  const handleUpdateProfilePicture = async (e) => {
    const formData = new FormData();
    if (fileInputRef.current.files[0]) {
      formData.append('profile_picture', fileInputRef.current.files[0]);
    }

    try {
      const response = await axios.put('http://localhost:5002/profile-picture', formData, {
        headers: {
          'x-access-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfilePicture(response.data.profile_picture ? `http://localhost:5002${response.data.profile_picture}` : '/uploads/default-profile-picture.png');
    } catch (err) {
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const genreLabels = genreDistribution.map(genre => genre.genre);
  const genreData = genreDistribution.map(genre => genre.count);

  const genreChartData = {
    labels: genreLabels,
    datasets: [
      {
        label: 'Répartition des genres',
        data: genreData,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FFCD56',
          '#4BC0C0',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FFCD56',
          '#4BC0C0',
        ],
      },
    ],
  };

  return (
    <div className="profile-container">
      <div className="sidebar">
        <div className="profile-picture1">
          <div className="profile-picture-wrapper">
            <img src={profilePicture} alt="Profil" onError={handleImageError} />
            <FontAwesomeIcon icon={faPlus} className="edit-icon" onClick={handleIconClick} />
          </div>
          <p className="profile-name">{name}</p>
          <input
            type="file"
            id="profile_picture"
            name="profile_picture"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleUpdateProfilePicture}
          />
        </div>
        <nav>
          <ul>
            <li className="sidebar-item active">
              <Link to="/dashboard">
                <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/profile">
                <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
                <span>Informations personnelles</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/watch-history">
                <FontAwesomeIcon icon={faClock} className="sidebar-icon" />
                <span>Historique de visionnage</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/favorites">
                <FontAwesomeIcon icon={faHeart} className="sidebar-icon" />
                <span>Favoris à voir</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/catalogue">
                <FontAwesomeIcon icon={faFilm} className="sidebar-icon" />
                <span>Catalogue</span>
              </Link>
            </li>
            <li className="sidebar-item" id='logout' onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>
              <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" />
              <span>Déconnexion</span>
            </li>
          </ul>
        </nav>
        <div className="notfound-logo1">
          <img src="/uploads/logo.PNG" alt="CineTrack Logo" />
        </div>
      </div>
      <div className="profile-content">
        <h2>Bienvenue sur votre tableau de bord</h2>
        <div className="statistics-container">
          <div className="statistic">
            <h3>Films regardés</h3>
            <p>{statistics.totalMovies}</p>
          </div>
          <div className="statistic">
            <h3>Séries regardées</h3>
            <p>{statistics.totalSeries}</p>
          </div>
          <div className="statistic">
            <h3>Durée totale de visionnage</h3>
            <p>{formatDuration(statistics.totalDuration)}</p>
          </div>
          <div className="statistic">
            <h3>Genre le plus regardé</h3>
            <p>{statistics.favoriteGenre}</p>
          </div>
        </div>
        <div className="chart-container">
          <h3>Répartition des genres</h3>
          <Pie data={genreChartData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
