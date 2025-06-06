import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';

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
    digital_signature: ''
  });
  const [crossings, setCrossings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [action, setAction] = useState('save'); // 'save' или 'submit'
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [signatureConfirmOpen, setSignatureConfirmOpen] = useState(false);
  
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    document_type: 'supporting',
    file: null
  });

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

  const fetchClosureDetails = useCallback(async () => {
    try {
      console.log("Запрашиваю детали заявки ID:", id);
      const response = await api.get(`/closures/${id}/`);
      const closure = response.data;
      console.log("Получены данные заявки:", closure);

      setFormData({
        railway_crossing: closure.railway_crossing,
        start_date: new Date(closure.start_date),
        end_date: new Date(closure.end_date),
        reason: closure.reason,
        digital_signature: closure.digital_signature || ''
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
  }, [id, setFormData, setLoading, setAlert]);

  const fetchDocuments = useCallback(async () => {
    try {
      console.log("Запрашиваю документы для заявки ID:", id);
      const response = await api.get(`/closures/${id}/documents/`);
      console.log("Получены документы:", response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error('Ошибка при получении документов:', error);
    }
  }, [id, setDocuments]);

  useEffect(() => {
    fetchCrossings();
    if (isEditMode) {
      console.log("Режим редактирования, ID заявки:", id);
      fetchClosureDetails();
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [isEditMode, id, fetchClosureDetails, fetchDocuments]);

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
    
    // Проверка наличия документов
    if (action === 'submit' && documents.length === 0) {
      setAlert({
        type: 'error',
        message: 'Необходимо прикрепить хотя бы один документ к заявке перед отправкой на согласование'
      });
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUploadForm = () => {
    const newErrors = {};
    
    if (!uploadFormData.title.trim()) {
      newErrors.title = 'Укажите название документа';
    }
    
    if (!uploadFormData.file) {
      newErrors.file = 'Выберите файл для загрузки';
    }
    
    setUploadErrors(newErrors);
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
      if (!formData.digital_signature) {
        setSignatureConfirmOpen(true);
      } else {
        setConfirmDialogOpen(true);
      }
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

      console.log("Отправляю данные заявки:", dataToSend);
      
      if (isEditMode) {
        response = await api.put(`/closures/${id}/`, dataToSend);
        console.log("Заявка успешно обновлена:", response.data);
      } else {
        response = await api.post('/closures/', dataToSend);
        console.log("Заявка успешно создана:", response.data);
        
        const newClosureId = response.data.id;
        console.log("ID новой заявки:", newClosureId);
        
        // Сохраняем временные документы на сервер
        if (documents.length > 0) {
          console.log(`Обнаружено ${documents.length} документов для загрузки`);
          
          for (const doc of documents) {
            if (doc.id.toString().startsWith('temp_')) {
              console.log(`Загружаю временный документ: ${doc.title}`);
              
              const docFormData = new FormData();
              docFormData.append('title', doc.title);
              docFormData.append('document_type', doc.document_type);
              docFormData.append('file', doc.file);
              
              try {
                const docResponse = await api.post(`/closures/${newClosureId}/documents/`, docFormData, {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                });
                console.log("Документ успешно загружен:", docResponse.data);
              } catch (docError) {
                console.error(`Ошибка при загрузке документа ${doc.title}:`, docError);
                // Продолжаем загрузку остальных документов
              }
            }
          }
        }
      }

      // Добавляем цифровую подпись, если она предоставлена
      if (formData.digital_signature && response.data && response.data.id) {
        const closureId = isEditMode ? id : response.data.id;
        console.log(`Добавляю цифровую подпись к заявке ${closureId}`);
        
        try {
          const signResponse = await api.post(`/closures/${closureId}/sign_closure/`, {
            digital_signature: formData.digital_signature
          });
          console.log("Подпись успешно добавлена:", signResponse.data);
        } catch (signError) {
          console.error("Ошибка при добавлении подписи:", signError);
        }
      }

      // Отправляем на согласование, если это требуется
      if (action === 'submit' && response.data && response.data.id) {
        const closureId = isEditMode ? id : response.data.id;
        console.log(`Отправляю заявку ${closureId} на согласование`);
        
        try {
          const approvalResponse = await api.post(`/closures/${closureId}/send_for_approval/`);
          console.log("Заявка отправлена на согласование:", approvalResponse.data);
        } catch (approvalError) {
          console.error("Ошибка при отправке на согласование:", approvalError);
          setAlert({
            type: 'warning',
            message: 'Заявка сохранена, но возникла ошибка при отправке на согласование',
          });
        }
      }

      setSubmitting(false);
      
      if (isEditMode) {
        navigate(`/closures/${id}`);
      } else {
        navigate('/closures');
      }
      
    } catch (error) {
      console.error('Ошибка при сохранении заявки:', error);
      
      let errorMessage = 'Не удалось сохранить заявку. Проверьте данные и попробуйте снова.';
      if (error.response) {
        console.error('Ответ сервера:', error.response.data);
        errorMessage = `Ошибка сохранения: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        console.error('Запрос не получил ответа');
        errorMessage = 'Сервер не отвечает, проверьте подключение';
      }
      
      setAlert({
        type: 'error',
        message: errorMessage,
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

  const handleUploadChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files) {
      setUploadFormData({
        ...uploadFormData,
        file: files[0]
      });
      
      if (uploadErrors.file) {
        setUploadErrors({
          ...uploadErrors,
          file: null
        });
      }
    } else {
      setUploadFormData({
        ...uploadFormData,
        [name]: value
      });
      
      if (uploadErrors[name]) {
        setUploadErrors({
          ...uploadErrors,
          [name]: null
        });
      }
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

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    
    if (!validateUploadForm()) {
      return;
    }
    
    setUploadingDoc(true);
    console.log("Начинаю загрузку документа для заявки ID:", id || 'новая заявка');
    console.log("Данные для загрузки:", {
      title: uploadFormData.title,
      document_type: uploadFormData.document_type,
      fileName: uploadFormData.file?.name
    });
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', uploadFormData.title);
      formDataToSend.append('document_type', uploadFormData.document_type);
      formDataToSend.append('file', uploadFormData.file);
      
      if (isEditMode && id) {
        const response = await api.post(`/closures/${id}/documents/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log("Документ успешно загружен:", response.data);
        await fetchDocuments();
      } else {
        const tempDoc = {
          id: `temp_${Date.now()}`,
          title: uploadFormData.title,
          document_type: uploadFormData.document_type,
          file: uploadFormData.file,
          file_url: URL.createObjectURL(uploadFormData.file),
          uploaded_at: new Date().toISOString(),
          uploaded_by: {
            first_name: user.first_name,
            last_name: user.last_name
          }
        };
        
        setDocuments([...documents, tempDoc]);
      }
      
      setUploadFormData({
        title: '',
        document_type: 'supporting',
        file: null
      });
      
      setAlert({
        type: 'success',
        message: 'Документ успешно добавлен',
      });
    } catch (error) {
      console.error('Ошибка при загрузке документа:', error);
      
      let errorMessage = 'Не удалось загрузить документ';
      if (error.response) {
        console.error('Ответ сервера:', error.response.data);
        errorMessage = `Ошибка загрузки: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        console.error('Запрос не получил ответа');
        errorMessage = 'Сервер не отвечает, проверьте подключение';
      }
      
      setAlert({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    setDeletingDoc(docId);
    
    try {
      if (isEditMode && id && !docId.toString().startsWith('temp_')) {
        await api.delete(`/closures/${id}/documents/${docId}/`);
        setDocuments(documents.filter(doc => doc.id !== docId));
      } else {
        setDocuments(documents.filter(doc => doc.id !== docId));
        const docToDelete = documents.find(doc => doc.id === docId);
        if (docToDelete && docToDelete.file_url.startsWith('blob:')) {
          URL.revokeObjectURL(docToDelete.file_url);
        }
      }
      
      setAlert({
        type: 'success',
        message: 'Документ успешно удален',
      });
    } catch (error) {
      console.error('Ошибка при удалении документа:', error);
      setAlert({
        type: 'error',
        message: 'Не удалось удалить документ',
      });
    } finally {
      setDeletingDoc(null);
    }
  };

  const handleSignatureConfirm = () => {
    const signature = `${user.first_name} ${user.last_name} ${new Date().toISOString()}`;
    
    setFormData({
      ...formData,
      digital_signature: signature
    });
    
    setSignatureConfirmOpen(false);
    setConfirmDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const documentTypes = [
    { value: 'road_scheme', label: 'Схема организации дорожного движения' },
    { value: 'approval', label: 'Согласование с другими службами' },
    { value: 'contract', label: 'Договор на выполнение работ' },
    { value: 'supporting', label: 'Сопроводительный документ' },
    { value: 'other', label: 'Другое' }
  ];

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
          </Grid>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Документы
          {action !== 'save' && (
            <Typography component="span" color="error" sx={{ ml: 1, fontSize: '0.8rem', fontWeight: 'normal' }}>
              (обязательно)
            </Typography>
          )}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Прикрепите необходимые документы к заявке. При отправке на согласование необходимо прикрепить хотя бы один документ.
        </Typography>
        
        <Box component="form" onSubmit={handleUploadDocument} mb={3}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="title"
                label="Название документа"
                value={uploadFormData.title}
                onChange={handleUploadChange}
                error={!!uploadErrors.title}
                helperText={uploadErrors.title}
                disabled={uploadingDoc}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                name="document_type"
                label="Тип документа"
                value={uploadFormData.document_type}
                onChange={handleUploadChange}
                disabled={uploadingDoc}
              >
                {documentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                disabled={uploadingDoc}
                fullWidth
              >
                Выбрать файл
                <input
                  type="file"
                  name="file"
                  hidden
                  onChange={handleUploadChange}
                />
              </Button>
              {uploadErrors.file && (
                <Typography color="error" variant="caption">
                  {uploadErrors.file}
                </Typography>
              )}
              {uploadFormData.file && (
                <Typography variant="caption" noWrap>
                  {uploadFormData.file.name}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={uploadingDoc}
                fullWidth
              >
                {uploadingDoc ? <CircularProgress size={24} /> : 'Загрузить'}
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          Внимание! Для отправки заявки на согласование необходимо прикрепить как минимум один документ.
        </Alert>
        
        <Divider sx={{ my: 2 }} />
        
        <List>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <ListItem
                key={doc.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteDocument(doc.id)}
                    disabled={deletingDoc === doc.id}
                  >
                    {deletingDoc === doc.id ? (
                      <CircularProgress size={24} />
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <InsertDriveFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={doc.title}
                  secondary={`${documentTypes.find(t => t.value === doc.document_type)?.label || 'Документ'} • Загружен: ${new Date(doc.uploaded_at).toLocaleString('ru-RU')}`}
                />
                <Button
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="text"
                  size="small"
                  sx={{ mr: 2 }}
                >
                  Скачать
                </Button>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Нет загруженных документов" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Box display="flex" justifyContent="space-between">
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
            sx={{ mr: 1 }}
          >
            {submitting && action === 'save' ? (
              <CircularProgress size={24} />
            ) : (
              'Сохранить как черновик'
            )}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting && action === 'submit' ? (
              <CircularProgress size={24} />
            ) : (
              'Отправить на согласование'
            )}
          </Button>
        </Box>
      </Box>

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
          
          {documents.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Прикрепленные документы ({documents.length}):
              </Typography>
              <List dense>
                {documents.slice(0, 3).map((doc) => (
                  <ListItem key={doc.id}>
                    <ListItemIcon>
                      <InsertDriveFileIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={doc.title} 
                      secondary={documentTypes.find(t => t.value === doc.document_type)?.label || 'Документ'} 
                    />
                  </ListItem>
                ))}
                {documents.length > 3 && (
                  <ListItem>
                    <ListItemText 
                      secondary={`...и еще ${documents.length - 3} документ(ов)`} 
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
          
          {formData.digital_signature && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Заявка будет подписана вашей цифровой подписью.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            color="primary" 
            variant="contained"
            disabled={action === 'submit' && documents.length === 0}
          >
            {action === 'submit' ? 'Отправить' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={signatureConfirmOpen}
        onClose={() => setSignatureConfirmOpen(false)}
      >
        <DialogTitle>
          Цифровая подпись
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Для отправки заявки на согласование необходимо подписать её цифровой подписью. 
            Подтвердите, что вы согласны подписать заявку.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignatureConfirmOpen(false)} color="primary">
            Отмена
          </Button>
          <Button onClick={handleSignatureConfirm} color="primary" variant="contained">
            Подписать и отправить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClosureForm; 