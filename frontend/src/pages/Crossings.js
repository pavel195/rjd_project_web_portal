import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

const Crossings = () => {
  const [crossings, setCrossings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [selectedCrossing, setSelectedCrossing] = useState(null);

  useEffect(() => {
    fetchCrossings();
  }, []);

  const fetchCrossings = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // api.get('/api/crossings/')
      
      // Имитация запроса для демонстрации
      setTimeout(() => {
        setCrossings([
          {
            id: 1,
            name: 'Переезд №1 "Северный"',
            latitude: 55.755819,
            longitude: 37.617644,
            description: 'Железнодорожный переезд на севере города',
          },
          {
            id: 2,
            name: 'Переезд №2 "Южный"',
            latitude: 55.742933,
            longitude: 37.615812,
            description: 'Железнодорожный переезд на юге города',
          },
          {
            id: 3,
            name: 'Переезд №3 "Восточный"',
            latitude: 55.751426,
            longitude: 37.643658,
            description: 'Железнодорожный переезд на востоке города',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Ошибка при получении списка переездов:', error);
      setLoading(false);
    }
  };

  const handleOpenMap = (crossing) => {
    setSelectedCrossing(crossing);
    setOpenMapDialog(true);
  };

  const handleCloseMap = () => {
    setOpenMapDialog(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Железнодорожные переезды
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Список всех железнодорожных переездов в системе
        </Typography>
      </Box>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Широта</TableCell>
                <TableCell>Долгота</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {crossings.map((crossing) => (
                <TableRow key={crossing.id}>
                  <TableCell>{crossing.name}</TableCell>
                  <TableCell>{crossing.latitude}</TableCell>
                  <TableCell>{crossing.longitude}</TableCell>
                  <TableCell>{crossing.description}</TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => handleOpenMap(crossing)}>
                      Показать на карте
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openMapDialog}
        onClose={handleCloseMap}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCrossing?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Широта"
                value={selectedCrossing?.latitude || ''}
                margin="normal"
                disabled
              />
              <TextField
                fullWidth
                label="Долгота"
                value={selectedCrossing?.longitude || ''}
                margin="normal"
                disabled
              />
              <TextField
                fullWidth
                label="Описание"
                value={selectedCrossing?.description || ''}
                margin="normal"
                multiline
                rows={4}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              {selectedCrossing && (
                <Box mt={2} height="300px">
                  <MapContainer
                    center={[selectedCrossing.latitude, selectedCrossing.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[selectedCrossing.latitude, selectedCrossing.longitude]}>
                      <Popup>{selectedCrossing.name}</Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMap}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Crossings; 