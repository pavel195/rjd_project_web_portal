import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const ClosureForm = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    railway_crossing: '',
    start_date: null,
    end_date: null,
    reason: '',
  });
  const [crossings, setCrossings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchCrossings();
    if (isEditMode) {
      fetchClosureDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchCrossings = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // const response = await api.get('/api/crossings/');
      // setCrossings(response.data);
      
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
      }, 500);
    } catch (error) {
      console.error('Ошибка при получении списка переездов:', error);
      setAlert({
        type: 'error',
        message: 'Не удалось загрузить список переездов',
      });
    }
  };

  const fetchClosureDetails = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // const response = await api.get(`/api/closures/${id}/`);
      // const closure = response.data;
      
      // Имитация запроса для демонстрации
      setTimeout(() => {
        const mockClosure = {
          id: parseInt(id),
          railway_crossing: 1,
          start_date: new Date('2025-03-15T08:00:00Z'),
          end_date: new Date('2025-03-15T18:00:00Z'),
          reason: 'Плановый ремонт путей. Необходимо заменить рельсы и шпалы на участке длиной 200 метров.',
          status: 'draft',
        };

        setFormData({
          railway_crossing: mockClosure.railway_crossing,
          start_date: mockClosure.start_date,
          end_date: mockClosure.end_date,
          reason: mockClosure.reason,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Ошибка при получении данных заявки:', error);
      setAlert({
        type: 'error',
        message: 'Не удалось загрузить данные заявки',
      });
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.railway_crossing) {
      newErrors.railway_crossing = 'Выберите переезд';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Укажите дату и время начала';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Укажите дату и время окончания';
    } else if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) {
      newErrors.end_date = 'Дата окончания должна быть позже даты начала';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Укажите причину закрытия';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Причина закрытия должна содержать не менее 10 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // В реальном приложении здесь был бы запрос к API
      if (isEditMode) {
        // await api.put(`/api/closures/${id}/`, formData);
      } else {
        // await api.post('/api/closures/', formData);
      }
      
      // Имитация запроса для демонстрации
      setTimeout(() => {
        setSubmitting(false);
        navigate(isEditMode ? `/closures/${id}` : '/closures');
      }, 1000);
    } catch (error) {
      console.error('Ошибка при сохранении заявки:', error);
      setAlert({
        type: 'error',
        message: 'Не удалось сохранить заявку',
      });
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
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
          {isEditMode ? 'Редактирование заявки' : 'Создание новой заявки'}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {isEditMode 
            ? 'Измените данные заявки на закрытие переезда' 
            : 'Заполните форму для создания новой заявки на закрытие переезда'}
        </Typography>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                name="railway_crossing"
                label="Железнодорожный переезд"
                value={formData.railway_crossing}
                onChange={handleChange}
                error={!!errors.railway_crossing}
                helperText={errors.railway_crossing}
                disabled={submitting || isEditMode}
                required
              >
                <MenuItem value="">Выберите переезд</MenuItem>
                {crossings.map((crossing) => (
                  <MenuItem key={crossing.id} value={crossing.id}>
                    {crossing.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DateTimePicker
                  label="Дата и время начала"
                  value={formData.start_date}
                  onChange={(value) => handleDateChange('start_date', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.start_date,
                      helperText: errors.start_date,
                      disabled: submitting,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DateTimePicker
                  label="Дата и время окончания"
                  value={formData.end_date}
                  onChange={(value) => handleDateChange('end_date', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.end_date,
                      helperText: errors.end_date,
                      disabled: submitting,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="reason"
                label="Причина закрытия"
                value={formData.reason}
                onChange={handleChange}
                error={!!errors.reason}
                helperText={errors.reason || 'Подробно опишите причину и характер работ'}
                disabled={submitting}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  component={Link}
                  to={isEditMode ? `/closures/${id}` : '/closures'}
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                >
                  {submitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ClosureForm; 