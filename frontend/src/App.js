import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SearchPage from './pages/Search/SearchPage';
import BookDetailsPage from './pages/BookDetails/BookDetailsPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard/LibrarianDashboard';
import Registration from './pages/LibraryRegistration/Registration.js';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/book/:id" element={<BookDetailsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/librarian" element={<LibrarianDashboard />}/>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/registration" element={<Registration />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
