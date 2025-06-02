import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import axios, { AxiosError } from 'axios';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending login request with:', { username, password });
      const response = await axios.post(`/api/auth/login`, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = response.data;
      
      if (response.status !== 200) {
        throw new Error(responseData.error || 'Login failed');
      }

      console.log('Received response:', responseData);
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('role', responseData.role);
      
      try {
        const redirectPath = responseData.role === 'admin' ? '/admin/tickets' : '/technician/tickets';
        navigate(redirectPath);
      } catch (error) {
        console.error('Navigation error:', error);
        const redirectPath = responseData.role === 'admin' ? '/admin/tickets' : '/technician/tickets';
        window.location.href = redirectPath; // 备用导航方式
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        console.error('Login error details:', axiosError.response?.data || axiosError.message);
        setError('Invalid credentials');
        if (axiosError.response) {
          console.log('Response data:', axiosError.response.data);
          console.log('Response status:', axiosError.response.status);
          console.log('Response headers:', axiosError.response.headers);
        }
      } else {
        console.error('Unexpected error:', err);
        setError('Login failed');
      }
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Repair Ticket System
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          Technician Login
        </Typography>
        {error && <Typography color="error" align="center">{error}</Typography>}
        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
