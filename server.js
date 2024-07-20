const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');


dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Contact schema and model
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(403).send('Token non fourni');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send('Échec de l\'authentification du token');
    }
    req.userId = decoded.id;
    next();
  });
}

app.get('/checkSession', verifyToken, (req, res) => {
  res.status(200).send({ auth: true, message: 'Session active' });
});

app.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT name, email, profile_picture FROM users WHERE user_id = $1', [req.userId]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (!user.profile_picture) {
        user.profile_picture = '/uploads/default-profile-picture.png';
      }
      res.json(user);
    } else {
      res.status(404).send('Utilisateur non trouvé');
    }
  } catch (err) {
    res.status(500).send('Erreur du serveur');
  }
});

app.put('/profile', verifyToken, upload.single('profile_picture'), async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query('SELECT password_hash, profile_picture FROM users WHERE user_id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).send('Utilisateur non trouvé');
    }
    const user = result.rows[0];

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).send('Mot de passe actuel requis pour changer le mot de passe');
      }
      const passwordIsValid = bcrypt.compareSync(currentPassword, user.password_hash);
      if (!passwordIsValid) {
        return res.status(401).send('Mot de passe actuel incorrect');
      }
    }

    const updateData = {
      name,
      email,
      profile_picture: profilePicture || user.profile_picture,
    };
    if (newPassword) {
      updateData.password_hash = bcrypt.hashSync(newPassword, 8);
    }

    await pool.query(
      'UPDATE users SET name = $1, email = $2, password_hash = COALESCE($3, password_hash), profile_picture = $4 WHERE user_id = $5',
      [updateData.name, updateData.email, updateData.password_hash, updateData.profile_picture, req.userId]
    );

    res.send({ message: 'Mise à jour réussie!', profile_picture: updateData.profile_picture });
  } catch (err) {
    res.status(500).send('Erreur du serveur');
  }
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, name, email, created_at',
      [name, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).send('Email déjà utilisé');
    } else {
      res.status(500).send('Erreur du serveur');
    }
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).send('Utilisateur non trouvé');
    }

    const user = result.rows[0];

    const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordIsValid) {
      return res.status(401).send('Mot de passe incorrect');
    }

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: 86400 });

    res.status(200).send({ auth: true, token });
  } catch (err) {
    res.status(500).send('Erreur du serveur');
  }
});

app.post('/favorites', verifyToken, async (req, res) => {
  const { movie_id, title, genre, release_date, synopsis, cover_image_url, type } = req.body;

  if (!movie_id || !title || !type) {
    return res.status(400).send('movie_id, title, and type are required');
  }

  try {
    const userId = req.userId;

    const existingFavorite = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND movie_id = $2 AND type = $3',
      [userId, movie_id, type]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).send('Ce favori existe déjà.');
    }

    await pool.query(
      `INSERT INTO movies (movie_id, title, genre, release_date, synopsis, cover_image_url, type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (movie_id) DO NOTHING`,
      [movie_id, title, genre, release_date, synopsis, cover_image_url, type]
    );

    await pool.query(
      'INSERT INTO favorites (user_id, movie_id, type, added_at) VALUES ($1, $2, $3, NOW())',
      [userId, movie_id, type]
    );

    res.status(201).send('Favori ajouté avec succès');
  } catch (error) {
    res.status(500).send('Erreur du serveur');
  }
});

app.get('/favorites', verifyToken, async (req, res) => {
  const user_id = req.userId;

  try {
    const result = await pool.query(
      `SELECT movies.movie_id, movies.title, movies.release_date, movies.synopsis, movies.cover_image_url, favorites.type
      FROM favorites
      JOIN movies ON favorites.movie_id = movies.movie_id
      WHERE favorites.user_id = $1
      ORDER BY favorites.added_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des favoris.');
  }
});

app.delete('/favorites/:movie_id', verifyToken, async (req, res) => {
  const { movie_id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2',
      [req.userId, movie_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Favori non trouvé');
    }

    res.status(200).send('Favori supprimé avec succès');
  } catch (error) {
    res.status(500).send('Erreur du serveur');
  }
});

app.get('/movie/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM movies WHERE movie_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Film/Série non trouvé');
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send('Erreur du serveur');
  }
});

app.get('/watch-history', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT movies.movie_id, movies.title, movies.genre, movies.release_date, movies.synopsis, movies.cover_image_url, user_watch_history.watched_at, user_watch_history.type
       FROM user_watch_history
       JOIN movies ON user_watch_history.movie_id = movies.movie_id
       WHERE user_watch_history.user_id = $1
       ORDER BY user_watch_history.watched_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Erreur du serveur');
  }
});

app.post('/watch-history', verifyToken, async (req, res) => {
  const { movie_id, duration, total_episodes, genre, type } = req.body;

  if (!movie_id || !type) {
    return res.status(400).send('movie_id and type are required');
  }

  try {
    await pool.query(
      'INSERT INTO user_watch_history (user_id, movie_id, watched_at, duration, total_episodes, genre, type) VALUES ($1, $2, NOW(), $3, $4, $5, $6) ON CONFLICT (user_id, movie_id) DO NOTHING',
      [req.userId, movie_id, duration, total_episodes, genre, type]
    );
    res.status(201).send('Film/Série marqué comme terminé avec succès');
  } catch (err) {
    res.status(500).send('Erreur du serveur');
  }
});

app.get('/details/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        append_to_response: 'videos,credits',
        language: 'fr-FR'
      }
    });

    if (movieResponse.data) {
      return res.json({ type: 'film', data: movieResponse.data });
    }
  } catch (err) {
  }

  try {
    const seriesResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        append_to_response: 'videos,credits',
        language: 'fr-FR'
      }
    });

    if (seriesResponse.data) {
      return res.json({ type: 'tv', data: seriesResponse.data });
    }
  } catch (err) {
  }

  res.status(404).send('Film ou Série non trouvé');
});

app.get('/', (req, res) => {
  res.send('Bienvenue sur CineTrack!');
});

app.use((err, req, res, next) => {
  res.status(500).send('Erreur du serveur');
});

const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Le serveur tourne sur http://localhost:${port}`);
});

app.get('/statistics', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const totalMoviesQuery = `SELECT COUNT(*) FROM user_watch_history WHERE user_id = $1 AND type = 'film'`;
    const totalSeriesQuery = `SELECT COUNT(*) FROM user_watch_history WHERE user_id = $1 AND type = 'serie'`;
    const totalEpisodesQuery = `SELECT SUM(total_episodes) AS total_episodes FROM user_watch_history WHERE user_id = $1`;
    const totalDurationQuery = `
      SELECT SUM(duration * COALESCE(total_episodes, 1)) AS total_duration 
      FROM user_watch_history 
      WHERE user_id = $1
    `;
    const averageDurationQuery = `
      SELECT AVG(duration * COALESCE(total_episodes, 1)) AS average_duration 
      FROM user_watch_history 
      WHERE user_id = $1
    `;
    const favoriteGenresQuery = `
      SELECT genre, COUNT(*) as count 
      FROM user_watch_history 
      WHERE user_id = $1 
      GROUP BY genre 
      ORDER BY count DESC 
      LIMIT 1
    `;
    const leastFavoriteGenresQuery = `
      SELECT genre, COUNT(*) as count 
      FROM user_watch_history 
      WHERE user_id = $1 
      GROUP BY genre 
      ORDER BY count ASC 
      LIMIT 1
    `;
    const totalFavoritesQuery = `SELECT COUNT(*) FROM favorites WHERE user_id = $1`;

    const [
      totalMoviesResult,
      totalSeriesResult,
      totalEpisodesResult,
      totalDurationResult,
      averageDurationResult,
      favoriteGenresResult,
      leastFavoriteGenresResult,
      totalFavoritesResult
    ] = await Promise.all([
      pool.query(totalMoviesQuery, [userId]),
      pool.query(totalSeriesQuery, [userId]),
      pool.query(totalEpisodesQuery, [userId]),
      pool.query(totalDurationQuery, [userId]),
      pool.query(averageDurationQuery, [userId]),
      pool.query(favoriteGenresQuery, [userId]),
      pool.query(leastFavoriteGenresQuery, [userId]),
      pool.query(totalFavoritesQuery, [userId])
    ]);

    const totalMovies = totalMoviesResult.rows[0].count || 0;
    const totalSeries = totalSeriesResult.rows[0].count || 0;
    const totalEpisodes = totalEpisodesResult.rows[0].total_episodes || 0;
    const totalDuration = totalDurationResult.rows[0].total_duration || 0;
    const averageDuration = averageDurationResult.rows[0].average_duration || 0;
    const favoriteGenre = favoriteGenresResult.rows[0]?.genre || 'N/A';
    const leastFavoriteGenre = leastFavoriteGenresResult.rows[0]?.genre || 'N/A';
    const totalFavorites = totalFavoritesResult.rows[0].count || 0;

    res.json({
      totalMovies,
      totalSeries,
      totalEpisodes,
      totalDuration,
      averageDuration,
      favoriteGenre,
      leastFavoriteGenre,
      totalFavorites
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).send('Erreur du serveur');
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const remainingMinutes = Math.floor(minutes % 60); // Floor to remove decimals
  
    if (days > 0) {
      return `${days}j ${remainingHours}h ${remainingMinutes}min`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  };
  
});

;




app.get('/genre-distribution', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const genreDistributionQuery = `
      SELECT genre, COUNT(*) as count 
      FROM user_watch_history 
      WHERE user_id = $1 
      GROUP BY genre 
      ORDER BY count DESC
    `;

    const genreDistributionResult = await pool.query(genreDistributionQuery, [userId]);
    res.json(genreDistributionResult.rows);
  } catch (err) {
    res.status(500).send('Erreur du serveur');
  }
});

// Contact route
app.post('/contact',
  [
    check('name').isLength({ min: 4, max: 150 }).withMessage('Le nom doit contenir entre 4 et 150 caractères.'),
    check('email').isEmail().withMessage('Veuillez fournir une adresse email valide.'),
    check('message').isLength({ min: 10, max: 500 }).withMessage('Le message doit contenir entre 10 et 500 caractères.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      message,
    });

    try {
      await newContact.save();
      res.status(201).send('Message reçu avec succès');
    } catch (error) {
      res.status(500).send('Erreur du serveur');
    }
  }
);
