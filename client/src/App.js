import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/SignUp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import FAQ from './pages/FAQ';
import Profile from './pages/Profile';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './PrivateRoute';
import Favorites from './pages/Favorites';
import WatchHistory from './pages/WatchHistory';
import Dashboard from './pages/Dashboard';
import Catalogue from './pages/Catalogue';
import Contact from './pages/Contact';
import { AuthProvider } from './AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/faq" element={<FAQ />} />
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/watch-history" element={<WatchHistory />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/catalogue" element={<Catalogue />} />
            </Route>
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
