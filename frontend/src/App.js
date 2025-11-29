// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import VenueList from './pages/VenueList';
import VenueDetail from './pages/VenueDetail';
import MyReservations from './pages/MyReservations';
import MyVenues from './pages/MyVenues';
import CreateVenue from './pages/CreateVenue';
import ManageVenue from './pages/ManageVenue';
import OwnerReservations from './pages/OwnerReservations';
import MyPage from './pages/MyPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/" element={<Home />} />
        <Route path="/venues" element={<VenueList />} />
        <Route path="/venues/:venueId" element={<VenueDetail />} />
        
        <Route path="/my-reservations" element={
          <PrivateRoute roles={['customer']}>
            <MyReservations />
          </PrivateRoute>
        } />

        <Route path="/my-venues" element={
          <PrivateRoute roles={['owner']}>
            <MyVenues />
          </PrivateRoute>
        } />
        <Route path="/owner/venues/:venueId/manage" element={
          <PrivateRoute roles={['owner']}>
            <ManageVenue />
          </PrivateRoute>
        } />
        <Route path="/owner/reservations" element={
          <PrivateRoute roles={['owner']}>
            <OwnerReservations />
          </PrivateRoute>
        } />
        <Route path="/mypage" element={
          <PrivateRoute roles={['customer']}>
            <MyPage />
          </PrivateRoute>
        } />

        <Route path="/venues/create" element={
          <PrivateRoute roles={['owner']}>
            <CreateVenue />
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
