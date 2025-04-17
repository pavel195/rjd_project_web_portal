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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // В реальном приложении здесь был бы запрос к API для получения статистики
        // Имитация запроса для демонстрации
        setTimeout(() => {
          setStats({
            totalCrossings: 45,
            pendingClosures: 12,
            approvedClosures: 8,
            rejectedClosures: 3,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
          Добро пожаловать, {user?.first_name} {user?.last_name}!
        </Typography>
      </Box>

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
        <Typography variant="body2" color="textSecondary">
          Здесь будет отображаться список последних активностей пользователей
        </Typography>
      </Paper>
    </Container>
  );
};

export default Dashboard; 