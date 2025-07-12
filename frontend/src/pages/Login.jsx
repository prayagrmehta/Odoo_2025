import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // your context login handler
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login({
        username: formData.email,
        password: formData.password,
      });

      if (result.success) {
        setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
        navigate('/dashboard');
      } else {
        setSnackbar({ open: true, message: result.error || 'Login failed. Please try again.', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Login failed. Please try again.', severity: 'error' });
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/google-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Assuming login context accepts token from backend
        login({ token: data.token });
        setSnackbar({ open: true, message: 'Google login successful!', severity: 'success' });
        navigate('/dashboard');
      } else {
        setSnackbar({ open: true, message: data.error || 'Google login failed.', severity: 'error' });
      }
    } catch (error) {
      console.error('Google login error:', error);
      setSnackbar({ open: true, message: 'Google login failed. Please try again.', severity: 'error' });
    }
  };

  const handleGoogleError = () => {
    setSnackbar({ open: true, message: 'Google login failed. Please try again.', severity: 'error' });
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your Skill Swap account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Box sx={{ my: 3, textAlign: 'center' }}>
              <Link href="#" variant="body2" sx={{ textDecoration: 'none' }}>
                Forgot your password?
              </Link>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Stack spacing={2}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            </Stack>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Login;
