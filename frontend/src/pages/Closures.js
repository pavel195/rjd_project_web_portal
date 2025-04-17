import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const Closures = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
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
    } else {
      setTabValue(0);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchClosures();
  }, [tabValue]);

  const fetchClosures = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API с фильтрацией по статусу
      // const response = await api.get('/api/closures/', { params: { status: status } });
      // setClosures(response.data);
      
      // Имитация запроса для демонстрации
      setTimeout(() => {
        const mockData = [
          {
            id: 1,
            railway_crossing: {
              id: 1,
              name: 'Переезд №1 "Северный"',
              latitude: 55.755819,
              longitude: 37.617644,
            },
            created_by: {
              id: 1,
              username: 'rzd_operator',
              first_name: 'Иван',
              last_name: 'Петров',
            },
            start_date: '2025-03-15T08:00:00Z',
            end_date: '2025-03-15T18:00:00Z',
            reason: 'Плановый ремонт путей',
            status: 'pending',
            status_display: 'На согласовании',
            admin_approved: false,
            gibdd_approved: false,
          },
          {
            id: 2,
            railway_crossing: {
              id: 2,
              name: 'Переезд №2 "Южный"',
              latitude: 55.742933,
              longitude: 37.615812,
            },
            created_by: {
              id: 1,
              username: 'rzd_operator',
              first_name: 'Иван',
              last_name: 'Петров',
            },
            start_date: '2025-03-20T10:00:00Z',
            end_date: '2025-03-20T16:00:00Z',
            reason: 'Замена шпал',
            status: 'approved',
            status_display: 'Согласовано',
            admin_approved: true,
            gibdd_approved: true,
          },
          {
            id: 3,
            railway_crossing: {
              id: 3,
              name: 'Переезд №3 "Восточный"',
              latitude: 55.751426,
              longitude: 37.643658,
            },
            created_by: {
              id: 1,
              username: 'rzd_operator',
              first_name: 'Иван',
              last_name: 'Петров',
            },
            start_date: '2025-03-25T09:00:00Z',
            end_date: '2025-03-25T19:00:00Z',
            reason: 'Ремонт переезда',
            status: 'rejected',
            status_display: 'Отклонено',
            admin_approved: false,
            gibdd_approved: false,
          },
          {
            id: 4,
            railway_crossing: {
              id: 1,
              name: 'Переезд №1 "Северный"',
              latitude: 55.755819,
              longitude: 37.617644,
            },
            created_by: {
              id: 1,
              username: 'rzd_operator',
              first_name: 'Иван',
              last_name: 'Петров',
            },
            start_date: '2025-04-05T08:00:00Z',
            end_date: '2025-04-05T18:00:00Z',
            reason: 'Установка автоматических шлагбаумов',
            status: 'draft',
            status_display: 'Черновик',
            admin_approved: false,
            gibdd_approved: false,
          },
        ];

        let filteredData;
        switch (tabValue) {
          case 1:
            filteredData = mockData.filter(item => item.status === 'pending');
            break;
          case 2:
            filteredData = mockData.filter(item => item.status === 'approved');
            break;
          case 3:
            filteredData = mockData.filter(item => item.status === 'rejected');
            break;
          case 4:
            filteredData = mockData.filter(item => item.status === 'draft');
            break;
          default:
            filteredData = mockData;
        }

        setClosures(filteredData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Ошибка при получении списка заявок:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
        </Paper>
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Переезд</TableCell>
                  <TableCell>Дата начала</TableCell>
                  <TableCell>Дата окончания</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Создатель</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {closures.map((closure) => (
                  <TableRow key={closure.id}>
                    <TableCell>{closure.id}</TableCell>
                    <TableCell>{closure.railway_crossing.name}</TableCell>
                    <TableCell>{formatDate(closure.start_date)}</TableCell>
                    <TableCell>{formatDate(closure.end_date)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={closure.status_display} 
                        color={getStatusColor(closure.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {closure.created_by.first_name} {closure.created_by.last_name}
                    </TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/closures/${closure.id}`}
                        variant="outlined"
                        size="small"
                      >
                        Подробнее
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default Closures; 