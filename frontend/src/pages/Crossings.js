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
  Alert,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

const Crossings = () => {
  const [crossings, setCrossings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [selectedCrossing, setSelectedCrossing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCrossings();
  }, []);

  const fetchCrossings = async () => {
    setLoading(true);
    try {
      // Реальный запрос к API
      const response = await api.get('/crossings/');
      setCrossings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении списка переездов:', error);
      setError('Не удалось загрузить данные о переездах. Пожалуйста, попробуйте позже.');
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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