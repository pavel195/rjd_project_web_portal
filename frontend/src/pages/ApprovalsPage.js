import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const ApprovalsPage = () => {
  const { user } = useContext(AuthContext);
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const isAdmin = user?.role === 'administration';
  const isTrafficPolice = user?.role === 'traffic_police';

  // Загружаем только заявки на согласовании
  useEffect(() => {
    fetchClosures();
  }, []);

  const fetchClosures = async () => {
    try {
      const response = await api.get('/closures/', {
        params: { status: 'pending' }
      });
      console.log('Получены заявки на согласование:', response.data);
      setClosures(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении заявок на согласование:', error);
      setError('Не удалось загрузить заявки на согласование');
      setLoading(false);
    }
  };

  const handleApprove = async (closureId, type) => {
    try {
      setLoading(true);
      let endpoint = '';
      
      if (type === 'admin') {
        endpoint = `/closures/${closureId}/approve_administration/`;
      } else if (type === 'gibdd') {
        endpoint = `/closures/${closureId}/approve_gibdd/`;
      }
      
      const response = await api.post(endpoint);
      console.log('Заявка согласована:', response.data);
      
      setAlert({
        type: 'success',
        message: 'Заявка успешно согласована'
      });
      
      // Обновляем список заявок
      fetchClosures();
    } catch (error) {
      console.error('Ошибка при согласовании заявки:', error);
      setAlert({
        type: 'error',
        message: 'Не удалось согласовать заявку'
      });
      setLoading(false);
    }
  };

  const handleReject = async (closureId) => {
    try {
      setLoading(true);
      const response = await api.post(`/closures/${closureId}/reject/`);
      console.log('Заявка отклонена:', response.data);
      
      setAlert({
        type: 'success',
        message: 'Заявка отклонена'
      });
      
      // Обновляем список заявок
      fetchClosures();
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
      setAlert({
        type: 'error',
        message: 'Не удалось отклонить заявку'
      });
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy HH:mm', { locale: ru });
  };

  const getApprovalStatus = (closure) => {
    const adminStatus = closure.admin_approved ? 'Согласовано' : 'Не согласовано';
    const gibddStatus = closure.gibdd_approved ? 'Согласовано' : 'Не согласовано';
    
    return {
      admin: adminStatus,
      gibdd: gibddStatus,
      adminColor: closure.admin_approved ? 'success' : 'default',
      gibddColor: closure.gibdd_approved ? 'success' : 'default'
    };
  };

  // Фильтруем заявки в зависимости от выбранной вкладки
  const filteredClosures = tabValue === 0 
    ? closures
    : closures.filter(closure => {
        if (tabValue === 1) return !closure.admin_approved; // Требуют согласования администрации
        if (tabValue === 2) return closure.admin_approved && !closure.gibdd_approved; // Требуют согласования ГИБДД
        return false;
      });

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
          Согласование заявок на закрытие переездов
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {isAdmin 
            ? 'Здесь вы можете рассмотреть заявки операторов РЖД и согласовать их от имени администрации региона. После вашего согласования заявки будут направлены на рассмотрение в ГИБДД.'
            : 'Здесь вы можете рассмотреть заявки, согласованные администрацией региона, и принять окончательное решение от имени ГИБДД. После вашего согласования заявка считается полностью утвержденной.'}
        </Typography>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="approval tabs">
          <Tab label="Все заявки" />
          <Tab label="Требуют согласования администрации" disabled={!isAdmin} />
          <Tab label="Требуют согласования ГИБДД" disabled={!isTrafficPolice} />
        </Tabs>
      </Box>

      {isAdmin && tabValue === 1 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для согласования заявки от имени администрации региона, проверьте документы, приложенные к заявке, 
          и нажмите кнопку "Согласовать". После вашего согласования заявка будет доступна для рассмотрения в ГИБДД.
        </Alert>
      )}

      {isTrafficPolice && tabValue === 2 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Для окончательного согласования заявки от имени ГИБДД, проверьте документы, приложенные к заявке,
          и нажмите кнопку "Согласовать". После вашего согласования заявка будет считаться полностью утвержденной.
        </Alert>
      )}

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredClosures.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" textAlign="center">
            Нет заявок, требующих согласования
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№ заявки</TableCell>
                <TableCell>Переезд</TableCell>
                <TableCell>Период закрытия</TableCell>
                <TableCell>Создана</TableCell>
                <TableCell>Согласование администрации</TableCell>
                <TableCell>Согласование ГИБДД</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClosures.map((closure) => {
                const status = getApprovalStatus(closure);
                return (
                  <TableRow key={closure.id}>
                    <TableCell>{closure.id}</TableCell>
                    <TableCell>{closure.railway_crossing_detail.name}</TableCell>
                    <TableCell>
                      {formatDate(closure.start_date)} - {formatDate(closure.end_date)}
                    </TableCell>
                    <TableCell>
                      {formatDate(closure.created_at)}
                      <Typography variant="caption" display="block">
                        {closure.created_by.first_name} {closure.created_by.last_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={status.admin} 
                        color={status.adminColor}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={status.gibdd} 
                        color={status.gibddColor}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/closures/${closure.id}`}
                          startIcon={<VisibilityIcon />}
                        >
                          Просмотр
                        </Button>
                        
                        {isAdmin && !closure.admin_approved && closure.status === 'pending' && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleApprove(closure.id, 'admin')}
                            >
                              Согласовать
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleReject(closure.id)}
                            >
                              Отклонить
                            </Button>
                          </>
                        )}
                        
                        {isTrafficPolice && !closure.gibdd_approved && closure.admin_approved && closure.status === 'pending' && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleApprove(closure.id, 'gibdd')}
                            >
                              Согласовать
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleReject(closure.id)}
                            >
                              Отклонить
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ApprovalsPage; 