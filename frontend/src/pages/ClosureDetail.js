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
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const ClosureDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [closure, setClosure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
  });

  useEffect(() => {
    fetchClosureDetails();
  }, [id]);

  const fetchClosureDetails = async () => {
    try {
      // Реальный запрос к API
      const response = await api.get(`/closures/${id}/`);
      console.log('Получены данные о заявке:', response.data);
      setClosure(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при получении данных заявки:', error);
      setError('Ошибка при загрузке данных заявки');
      setLoading(false);
    }
  };

  const handleSendForApproval = () => {
    showConfirmDialog(
      'Отправить на согласование',
      'Вы уверены, что хотите отправить заявку на согласование? После отправки вы не сможете изменить данные заявки.',
      () => sendForApproval()
    );
  };

  const sendForApproval = async () => {
    try {
      // Реальный запрос к API
      await api.post(`/closures/${id}/send_for_approval/`);
      // Обновляем данные заявки
      fetchClosureDetails();
      closeConfirmDialog();
    } catch (error) {
      console.error('Ошибка при отправке заявки на согласование:', error);
    }
  };

  const handleApproveAdministration = () => {
    showConfirmDialog(
      'Согласовать заявку',
      'Вы уверены, что хотите согласовать заявку от имени администрации?',
      () => approveAdministration()
    );
  };

  const approveAdministration = async () => {
    try {
      // Реальный запрос к API
      await api.post(`/closures/${id}/approve_administration/`);
      // Обновляем данные заявки
      fetchClosureDetails();
      closeConfirmDialog();
    } catch (error) {
      console.error('Ошибка при согласовании заявки:', error);
    }
  };

  const handleApproveGibdd = () => {
    showConfirmDialog(
      'Согласовать заявку',
      'Вы уверены, что хотите согласовать заявку от имени ГИБДД?',
      () => approveGibdd()
    );
  };

  const approveGibdd = async () => {
    try {
      // Реальный запрос к API
      await api.post(`/closures/${id}/approve_gibdd/`);
      // Обновляем данные заявки
      fetchClosureDetails();
      closeConfirmDialog();
    } catch (error) {
      console.error('Ошибка при согласовании заявки:', error);
    }
  };

  const handleRejectClosure = () => {
    showConfirmDialog(
      'Отклонить заявку',
      'Вы уверены, что хотите отклонить эту заявку? Пожалуйста, укажите причину отклонения в комментарии.',
      () => rejectClosure()
    );
  };

  const rejectClosure = async () => {
    try {
      // Реальный запрос к API
      await api.post(`/closures/${id}/reject/`);
      // Обновляем данные заявки
      fetchClosureDetails();
      closeConfirmDialog();
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
    }
  };

  const handleDeleteClosure = () => {
    showConfirmDialog(
      'Удалить заявку',
      'Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.',
      () => deleteClosure()
    );
  };

  const deleteClosure = async () => {
    try {
      // Реальный запрос к API
      await api.delete(`/closures/${id}/`);
      closeConfirmDialog();
      navigate('/closures');
    } catch (error) {
      console.error('Ошибка при удалении заявки:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      // В реальном приложении здесь был бы запрос к API
      // const response = await api.post(`/api/closures/${id}/comments/`, { text: comment });
      
      // Имитация для демонстрации
      const newComment = {
        id: closure.comments.length + 1,
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        text: comment,
        created_at: new Date().toISOString(),
      };
      
      setClosure({
        ...closure,
        comments: [...closure.comments, newComment],
      });
      setComment('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  };

  const showConfirmDialog = (title, message, action) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy HH:mm', { locale: ru });
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" component={Link} to="/closures">
            Вернуться к списку заявок
          </Button>
        </Paper>
      </Container>
    );
  }

  const canEdit = user?.role === 'railway_operator' && closure.status === 'draft';
  const canSendForApproval = user?.role === 'railway_operator' && closure.status === 'draft';
  const canApproveAdmin = user?.role === 'administration' && closure.status === 'pending' && !closure.admin_approved;
  const canApproveGibdd = user?.role === 'traffic_police' && closure.status === 'pending' && !closure.gibdd_approved;
  const canReject = (user?.role === 'administration' || user?.role === 'traffic_police') && closure.status === 'pending';
  const canDelete = user?.role === 'railway_operator' && (closure.status === 'draft' || closure.status === 'rejected');

  return (
    <Container>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          Заявка №{closure.id}
        </Typography>
        <Chip 
          label={closure.status_display} 
          color={getStatusColor(closure.status)}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Информация о закрытии
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Переезд
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {closure.railway_crossing.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Координаты
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {closure.railway_crossing.latitude}, {closure.railway_crossing.longitude}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Дата и время начала
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(closure.start_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Дата и время окончания
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(closure.end_date)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Причина закрытия
                </Typography>
                <Typography variant="body1" paragraph>
                  {closure.reason}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Создано
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(closure.created_at)} ({closure.created_by.first_name} {closure.created_by.last_name})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Обновлено
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(closure.updated_at)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Согласовано администрацией
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {closure.admin_approved ? 'Да' : 'Нет'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Согласовано ГИБДД
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {closure.gibdd_approved ? 'Да' : 'Нет'}
                </Typography>
              </Grid>
            </Grid>

            <Box mt={3} display="flex" gap={2} flexWrap="wrap">
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  component={Link}
                  to={`/closures/${closure.id}/edit`}
                >
                  Редактировать
                </Button>
              )}
              {canSendForApproval && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={handleSendForApproval}
                >
                  Отправить на согласование
                </Button>
              )}
              {canApproveAdmin && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApproveAdministration}
                >
                  Согласовать (Администрация)
                </Button>
              )}
              {canApproveGibdd && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApproveGibdd}
                >
                  Согласовать (ГИБДД)
                </Button>
              )}
              {canReject && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleRejectClosure}
                >
                  Отклонить
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClosure}
                >
                  Удалить
                </Button>
              )}
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Комментарии
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {closure.comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" divider>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {comment.user.first_name} {comment.user.last_name} 
                        <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Typography>
                    }
                    secondary={comment.text}
                  />
                </ListItem>
              ))}
            </List>
            
            <Box mt={3}>
              <TextField
                fullWidth
                label="Добавить комментарий"
                multiline
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                margin="normal"
              />
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                >
                  Отправить
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Информация о переезде
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {closure.railway_crossing.description}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to={`/crossings?id=${closure.railway_crossing.id}`}
                >
                  Подробнее о переезде
                </Button>
              </CardContent>
            </Card>

            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Информация о создателе
                </Typography>
                <Typography variant="body1">
                  {closure.created_by.first_name} {closure.created_by.last_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {closure.created_by.role === 'railway_operator' && 'Оператор ЖД'}
                  {closure.created_by.role === 'administration' && 'Администрация региона'}
                  {closure.created_by.role === 'traffic_police' && 'Представитель ГИБДД'}
                </Typography>
              </CardContent>
            </Card>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/closures"
            >
              Вернуться к списку
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
      >
        <DialogTitle>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Отмена</Button>
          <Button 
            onClick={confirmDialog.action} 
            variant="contained" 
            color={confirmDialog.title.includes('Удалить') || confirmDialog.title.includes('Отклонить') ? 'error' : 'primary'}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClosureDetail; 