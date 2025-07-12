import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, LocationOn, Star, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, swapAPI, skillsAPI } from '../services/apiService';

const Browse = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const [swapDialog, setSwapDialog] = useState({ open: false, targetUser: null });
  const [swapMessage, setSwapMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const usersPerPage = 3;

  // Load users and skills on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, skillsData] = await Promise.all([
        userAPI.getUsers(),
        skillsAPI.getSkills()
      ]);
      setUsers(usersData.results || usersData);
      setSkills(skillsData.results || skillsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filter by search and availability
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skills_offered.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.skills_wanted.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAvailability = !availability || 
      (user.availability && user.availability.includes(availability));
    
    return matchesSearch && matchesAvailability;
  });

  // Pagination
  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  const navigate = useNavigate();

  const handleSwapRequest = (targetUser) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    setSwapDialog({ open: true, targetUser });
  };

  const handleSubmitSwapRequest = async () => {
    try {
      const swapData = {
        to_user_id: swapDialog.targetUser.id,
        skills_offered: user.skills_offered.map(skill => skill.id),
        skills_wanted: swapDialog.targetUser.skills_offered.map(skill => skill.id),
        message: swapMessage
      };
      
      await swapAPI.createSwapRequest(swapData);
      setSnackbar({ 
        open: true, 
        message: 'Swap request sent successfully!', 
        severity: 'success' 
      });
      setSwapDialog({ open: false, targetUser: null });
      setSwapMessage('');
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to send swap request. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleCloseSwapDialog = () => {
    setSwapDialog({ open: false, targetUser: null });
    setSwapMessage('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Skill Swap Platform</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Availability</InputLabel>
          <Select
            value={availability}
            label="Availability"
            onChange={e => setAvailability(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="weekdays">Weekdays</MenuItem>
            <MenuItem value="weekends">Weekends</MenuItem>
            <MenuItem value="evenings">Evenings</MenuItem>
          </Select>
        </FormControl>
        <TextField
          placeholder="Search by skill or name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {paginatedUsers.length === 0 ? (
            <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ py: 4 }}>
              No users found matching your criteria.
            </Typography>
          ) : (
            paginatedUsers.map(user => (
              <Card key={user.id} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ width: 64, height: 64, mr: 3 }} src={user.photo}>
                  {user.photo ? null : user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{user.first_name} {user.last_name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{user.location || 'Location not specified'}</Typography>
                    {user.availability && user.availability.length > 0 && (
                      <>
                        <Schedule fontSize="small" color="action" sx={{ ml: 2 }} />
                        <Typography variant="body2" color="text.secondary">{user.availability.join(', ')}</Typography>
                      </>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {user.skills_offered.map(skill => (
                      <Chip key={skill.id} label={skill.name} color="primary" size="small" />
                    ))}
                    {user.skills_wanted.map(skill => (
                      <Chip key={skill.id} label={skill.name} color="secondary" size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">Rating: {user.rating}/5</Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleSwapRequest(user)}
                >
                  {isAuthenticated() ? 'Request Swap' : 'Login/Sign up first'}
                </Button>
              </Card>
            ))
          )}
        </Stack>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Swap Request Dialog */}
      <Dialog open={swapDialog.open} onClose={handleCloseSwapDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Request Skill Swap with {swapDialog.targetUser?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a message to {swapDialog.targetUser?.name} explaining what skills you can offer and what you'd like to learn.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message (optional)"
            value={swapMessage}
            onChange={(e) => setSwapMessage(e.target.value)}
            placeholder="Hi! I can help you with [your skills] and I'd love to learn [their skills] from you..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSwapDialog}>Cancel</Button>
          <Button onClick={handleSubmitSwapRequest} variant="contained">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
  );
};

export default Browse;
