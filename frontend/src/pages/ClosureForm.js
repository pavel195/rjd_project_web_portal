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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [action, setAction] = useState('save'); // 'save' или 'submit'

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
      const response = await api.get('/crossings/');
      setCrossings(response.data);
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
      const response = await api.get(`/closures/${id}/`);
      const closure = response.data;

      setFormData({
        railway_crossing: closure.railway_crossing,
        start_date: new Date(closure.start_date),
        end_date: new Date(closure.end_date),
        reason: closure.reason,
      });
      setLoading(false);
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

  const handleSave = () => {
    setAction('save');
    if (validateForm()) {
      setConfirmDialogOpen(true);
    }
  };

  const handleSubmit = () => {
    setAction('submit');
    if (validateForm()) {
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    setConfirmDialogOpen(false);
    setSubmitting(true);

    try {
      let response;
      const dataToSend = {
        railway_crossing: formData.railway_crossing,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
        reason: formData.reason,
      };

      if (isEditMode) {
        response = await api.put(`/closures/${id}/`, dataToSend);
      } else {
        response = await api.post('/closures/', dataToSend);
      }

      if (action === 'submit' && response.data && response.data.id) {
        const closureId = isEditMode ? id : response.data.id;
        await api.post(`/closures/${closureId}/send_for_approval/`);
      }

      setSubmitting(false);
      
      if (isEditMode) {
        navigate(`/closures/${id}`);
      } else {
        navigate('/closures');
      }
      
    } catch (error) {
      console.error('Ошибка при сохранении заявки:', error);
      setAlert({
        type: 'error',
        message: 'Не удалось сохранить заявку. Проверьте данные и попробуйте снова.',
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
        <form>
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
                disabled={submitting}
              >
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
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.start_date}
                      helperText={errors.start_date}
                      disabled={submitting}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DateTimePicker
                  label="Дата и время окончания"
                  value={formData.end_date}
                  onChange={(value) => handleDateChange('end_date', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.end_date}
                      helperText={errors.end_date}
                      disabled={submitting}
                    />
                  )}
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
                helperText={errors.reason}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12}>
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button 
                  component={Link} 
                  to="/closures" 
                  variant="outlined" 
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleSave}
                    disabled={submitting}
                    sx={{ mr: 2 }}
                  >
                    Сохранить как черновик
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Отправить на согласование'
                    )}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          {action === 'submit' ? 'Отправить на согласование?' : 'Сохранить заявку?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {action === 'submit' 
              ? 'Заявка будет отправлена на согласование в администрацию и ГИБДД. После отправки изменение данных будет невозможно.' 
              : 'Заявка будет сохранена как черновик. Вы сможете редактировать её позже и отправить на согласование.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmAction} color="primary" variant="contained">
            {action === 'submit' ? 'Отправить' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClosureForm; 