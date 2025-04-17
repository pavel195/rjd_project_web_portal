import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Crossings from './pages/Crossings';
import Closures from './pages/Closures';
import ClosureDetail from './pages/ClosureDetail';
import ClosureForm from './pages/ClosureForm';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e21a1a',
    },
    secondary: {
      main: '#3f51b5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="crossings" element={<Crossings />} />
              <Route path="closures" element={<Closures />} />
              <Route path="closures/:id" element={<ClosureDetail />} />
              <Route path="closures/new" element={<ClosureForm />} />
              <Route path="closures/:id/edit" element={<ClosureForm />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 