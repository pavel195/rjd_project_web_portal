import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const Closures = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [closures, setClosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get('status');

  useEffect(() => {
    if (statusFilter === 'pending') {
      setTabValue(1);
    } else if (statusFilter === 'approved') {
      setTabValue(2);
    } else if (statusFilter === 'rejected') {
      setTabValue(3);
    } else if (statusFilter === 'draft') {
      setTabValue(4);
    } else {
      setTabValue(0);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchClosures();
  }, [tabValue]);

  const fetchClosures = async () => {
    setLoading(true);
    try {
      // Получаем статус для фильтрации на основе выбранной вкладки
      let statusParam = '';
      switch (tabValue) {
        case 1:
          statusParam = 'pending';
          break;
        case 2:
          statusParam = 'approved';
          break;
        case 3:
          statusParam = 'rejected';
          break;
        case 4:
          statusParam = 'draft';
          break;
        default:
          statusParam = '';
      }

      const params = statusParam ? { status: statusParam } : {};
      const response = await api.get('/closures/', { params });
      console.log('Получены данные о заявках:', response.data);
      setClosures(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении списка заявок:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Обновляем URL для сохранения состояния вкладки
    const newStatus = ['', 'pending', 'approved', 'rejected', 'draft'][newValue];
    if (newStatus) {
      navigate(`?status=${newStatus}`);
    } else {
      navigate('');
    }
  };

  const handleSendForApproval = async (id) => {
    try {
      await api.post(`/closures/${id}/send_for_approval/`);
      // Обновляем список после успешной отправки
      fetchClosures();
    } catch (error) {
      console.error('Ошибка при отправке заявки на согласование:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy HH:mm', { locale: ru });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Функция для определения, может ли пользователь редактировать заявку
  const canEdit = (closure) => {
    // Только оператор РЖД может редактировать свои черновики
    return user?.role === 'railway_operator' && 
           closure.status === 'draft' && 
           closure.created_by.id === user.id;
  };

  // Функция для определения, может ли пользователь отправить заявку на согласование
  const canSendForApproval = (closure) => {
    // Только оператор РЖД может отправить свои черновики на согласование
    return user?.role === 'railway_operator' && 
           closure.status === 'draft' && 
           closure.created_by.id === user.id;
  };

  return (
    <Container>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          Заявки на закрытие переездов
        </Typography>
        {user?.role === 'railway_operator' && (
          <Button
            component={Link}
            to="/closures/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Создать заявку
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Все" />
          <Tab label="На согласовании" />
          <Tab label="Согласованные" />
          <Tab label="Отклоненные" />
          {user?.role === 'railway_operator' && <Tab label="Черновики" />}
        </Tabs>
      </Paper>

      {closures.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Заявок не найдено
          </Typography>
          {user?.role === 'railway_operator' && tabValue === 4 && (
            <Button
              component={Link}
              to="/closures/new"
              variant="contained"
              sx={{ mt: 2 }}
              startIcon={<AddIcon />}
            >
              Создать новую заявку
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Переезд</TableCell>
                <TableCell>Период закрытия</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Согласование</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {closures.map((closure) => (
                <TableRow key={closure.id} hover>
                  <TableCell>
                    <Typography variant="body1">
                      {closure.railway_crossing_detail?.name || 'Переезд не указан'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(closure.start_date)} - {formatDate(closure.end_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={closure.status_display}
                      color={getStatusColor(closure.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Tooltip title="Администрация">
                        {closure.admin_approved ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <CancelIcon color="disabled" fontSize="small" />
                        )}
                      </Tooltip>
                      <Tooltip title="ГИБДД">
                        {closure.gibdd_approved ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <CancelIcon color="disabled" fontSize="small" />
                        )}
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        component={Link}
                        to={`/closures/${closure.id}`}
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                      >
                        Просмотр
                      </Button>
                      
                      {canEdit(closure) && (
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            component={Link}
                            to={`/closures/${closure.id}/edit`}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {canSendForApproval(closure) && (
                        <Tooltip title="Отправить на согласование">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleSendForApproval(closure.id)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Closures; 