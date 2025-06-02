import React from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketCreatePage from './pages/TicketCreatePage';
import AdminLayout from './pages/AdminLayout';
import PrivateRoute from './components/PrivateRoute';
import UserManagementPage from './pages/UserManagementPage';
import TicketManagementPage from './pages/TicketManagementPage';

// 配置API基础URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://8.138.248.160:3001';
axios.defaults.withCredentials = true;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              {localStorage.getItem('role') === 'admin' ? (
                <Navigate to="/admin/tickets" replace />
              ) : (
                <Navigate to="/technician/tickets" replace />
              )}
            </PrivateRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin/users" 
            element={
              <PrivateRoute adminOnly>
                <AdminLayout>
                  <UserManagementPage />
                </AdminLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/technician/tickets" 
            element={
              <PrivateRoute>
                <TicketManagementPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/tickets" 
            element={
              <PrivateRoute adminOnly>
                <AdminLayout>
                  <TicketManagementPage />
                </AdminLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tickets/new" 
            element={
              <PrivateRoute>
                <TicketCreatePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/tickets/:id" 
            element={
              <PrivateRoute adminOnly>
                <AdminLayout>
                  <TicketDetailPage />
                </AdminLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/technician/tickets/:id" 
            element={
              <PrivateRoute>
                <TicketDetailPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
