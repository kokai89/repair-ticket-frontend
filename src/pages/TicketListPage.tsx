import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

interface Location {
  id: number;
  latitude: number;
  longitude: number;
  recordedAt: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  locations: Location[];
}

const TicketListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        console.log('Fetching tickets with token:', token);
        console.log('Current time:', new Date().toISOString());
        const api = axios.create({
          baseURL: 'http://localhost:3001/api',
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        });
        
        const response = await api.get('/tickets', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          params: {
            _: Date.now()
          }
        });
        
        console.log('Tickets response:', response);
        console.log('Response headers:', response.headers);
        console.log('Received tickets count:', response.data?.data?.length || 0);
        
        if (!response.data?.data) {
          console.error('No tickets data received');
          return;
        }
        
        setTickets(response.data.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        {localStorage.getItem('role') === 'admin' ? '所有工单' : '我的工单'}
      </Typography>
      <Paper elevation={3}>
        <List>
          {tickets.map((ticket) => (
            <ListItem 
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              secondaryAction={
                <Chip 
                  label={ticket.status.replace('_', ' ')} 
                  color={getStatusColor(ticket.status)}
                  sx={{ textTransform: 'capitalize' }}
                />
              }
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText
                primary={ticket.title}
                secondary={
                  <>
                    <Chip 
                      label={ticket.priority} 
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {new Date(ticket.createdAt).toLocaleString()}
                    {ticket.locations && ticket.locations.length > 0 && (
                      <Box component="span" sx={{ ml: 1 }}>
                        <Chip 
                          label="位置已记录" 
                          color="info"
                          size="small"
                        />
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      {localStorage.getItem('role') === 'admin' && (
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/tickets/new')}
        >
          创建新工单
        </Button>
      )}
    </Box>
  );
};

export default TicketListPage;
