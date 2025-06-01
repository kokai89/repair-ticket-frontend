import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import L from 'leaflet';

// Fix for default marker icons
const defaultIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Ticket {
  id: number;
  title: string;
  status: string;
  technician: {
    username: string;
  };
  locations: {
    latitude: number;
    longitude: number;
    recordedAt: string;
  }[];
}

const AdminPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/tickets', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTickets(response.data.data || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        工单管理系统
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>工单ID</TableCell>
              <TableCell>标题</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>维修人员</TableCell>
              <TableCell>位置信息</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>{ticket.technician.username}</TableCell>
                <TableCell>
                  {ticket.locations?.length > 0 ? (
                    <Box sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="primary">
                        <LocationOnIcon fontSize="small" /> 位置记录
                      </Typography>
                      <Typography variant="body2">
                        坐标: {ticket.locations[ticket.locations.length - 1].latitude.toFixed(6)}, 
                        {ticket.locations[ticket.locations.length - 1].longitude.toFixed(6)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        时间: {new Date(ticket.locations[ticket.locations.length - 1].recordedAt).toLocaleString()}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<MapIcon />}
                        onClick={() => setSelectedLocation(ticket.locations[ticket.locations.length - 1])}
                        sx={{ mt: 1 }}
                      >
                        在地图上查看
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      无位置信息
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Button size="small">详情</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedLocation && (
        <Dialog 
          open={!!selectedLocation} 
          onClose={() => setSelectedLocation(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>工单位置地图</DialogTitle>
          <DialogContent>
            <Box sx={{ height: '500px', width: '100%' }}>
              <MapContainer 
                center={[selectedLocation.latitude, selectedLocation.longitude]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
                  <Popup>工单位置</Popup>
                </Marker>
              </MapContainer>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default AdminPage;
