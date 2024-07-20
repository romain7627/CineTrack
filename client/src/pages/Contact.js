import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import './Contact.css';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    let errors = {};
    if (formData.name.length < 4 || formData.name.length > 150) {
      errors.name = 'Le nom doit contenir entre 4 et 150 caractères.';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Veuillez fournir une adresse email valide.';
    }
    if (formData.message.length < 10 || formData.message.length > 500) {
      errors.message = 'Le message doit contenir entre 10 et 500 caractères.';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      try {
        const response = await axios.post('http://localhost:5002/contact', formData);
        setSuccessMessage('Votre message a été envoyé avec succès.');
        setFormData({ name: '', email: '', message: '' });
        window.location.href = '/';
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message de contact:', error);
        setErrors({ submit: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.' });
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Contactez-nous</Typography>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <TextField
          fullWidth
          id="name"
          name="name"
          label="Nom"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          margin="normal"
          variant="outlined"
          required
        />
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          margin="normal"
          variant="outlined"
          required
        />
        <TextField
          fullWidth
          id="message"
          name="message"
          label="Message"
          value={formData.message}
          onChange={handleChange}
          error={!!errors.message}
          helperText={errors.message}
          margin="normal"
          variant="outlined"
          multiline
          rows={4}
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Envoyer
        </Button>
      </Box>
    </Container>
  );
}

export default ContactForm;
