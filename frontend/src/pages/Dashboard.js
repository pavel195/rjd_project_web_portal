import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalCrossings: 0,
    pendingClosures: 0,
    approvedClosures: 0,
    rejectedClosures: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activitiesError, setActivitiesError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Получение количества переездов
        const crossingsResponse = await api.get('/crossings/');
        
        // Получение заявок на закрытие с разными статусами
        const pendingResponse = await api.get('/closures/?status=pending');
        const approvedResponse = await api.get('/closures/?status=approved');
        const rejectedResponse = await api.get('/closures/?status=rejected');
        
        setStats({
          totalCrossings: crossingsResponse.data.length,
          pendingClosures: pendingResponse.data.length,
          approvedClosures: approvedResponse.data.length,
          rejectedClosures: rejectedResponse.data.length,
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        setError('Не удалось загрузить статистику. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await api.get('/activities/');
        setActivities(response.data);
        setActivitiesLoading(false);
      } catch (error) {
        console.error('Ошибка при получении последних активностей:', error);
        setActivitiesError('Не удалось загрузить последние активности');
        setActivitiesLoading(false);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const StatCard = ({ title, value, color, link }) => (
    <Card elevation={3}>
      <CardActionArea component={Link} to={link}>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" component="div" color={color}>
            {value}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );

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
          Дашборд
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Добро пожаловать, {user?.first_name || ''} {user?.last_name || ''}!
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего переездов"
            value={stats.totalCrossings}
            color="primary"
            link="/crossings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="На согласовании"
            value={stats.pendingClosures}
            color="warning.main"
            link="/closures?status=pending"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Согласовано"
            value={stats.approvedClosures}
            color="success.main"
            link="/closures?status=approved"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Отклонено"
            value={stats.rejectedClosures}
            color="error.main"
            link="/closures?status=rejected"
          />
        </Grid>
      </Grid>

      {user?.role === 'railway_operator' && (
        <Box mb={4}>
          <Button
            component={Link}
            to="/closures/new"
            variant="contained"
            color="primary"
            size="large"
          >
            Создать новую заявку
          </Button>
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Последние активности
        </Typography>
        
        {activitiesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {activitiesError}
          </Alert>
        )}
        
        {activitiesLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={30} />
          </Box>
        ) : activities.length > 0 ? (
          <List>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start" component={Link} to={`/closures/${activity.closure_id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemAvatar>
                    <Avatar>{activity.user.first_name[0]}{activity.user.last_name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${activity.user.first_name} ${activity.user.last_name} добавил(а) комментарий`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.closure_name}
                        </Typography>
                        {` — ${activity.text}`}
                        <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          {formatDate(activity.created_at)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Пока нет активностей для отображения
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard; 