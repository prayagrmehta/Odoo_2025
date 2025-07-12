import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  Chip,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Pagination,
  IconButton,
  Snackbar,
  Alert as MuiAlert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating as MuiRating,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, Star } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { swapAPI, notificationsAPI } from '../services/apiService';

const mockProfilePhoto = 'https://i.pravatar.cc/40?img=3';

const mockRequests = [
  {
    id: 1,
    user: {
      name: 'Marc Demo',
      photo: null,
      rating: 3.9,
      skillsOffered: ['JavaScript'],
      skillsWanted: ['React'],
    },
    status: 'Pending',
  },
  {
    id: 2,
    user: {
      name: 'Jane Smith',
      photo: null,
      rating: 4.2,
      skillsOffered: ['Excel'],
      skillsWanted: ['Photoshop'],
    },
    status: 'Accepted',
  },
  {
    id: 3,
    user: {
      name: 'Joe Vills',
      photo: null,
      rating: 3.8,
      skillsOffered: ['Cooking'],
      skillsWanted: ['Photography'],
    },
    status: 'Rejected',
  },
  {
    id: 4,
    user: {
      name: 'Priya Patel',
      photo: null,
      rating: 4.7,
      skillsOffered: ['Yoga'],
      skillsWanted: ['Cooking'],
    },
    status: 'Pending',
  },
  {
    id: 5,
    user: {
      name: 'Carlos Gomez',
      photo: null,
      rating: 4.1,
      skillsOffered: ['Spanish'],
      skillsWanted: ['English'],
    },
    status: 'Pending',
  },
  {
    id: 6,
    user: {
      name: 'Linda Zhou',
      photo: null,
      rating: 4.6,
      skillsOffered: ['Python'],
      skillsWanted: ['French'],
    },
    status: 'Rejected',
  },
];

const statusColors = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
  completed: 'info',
};

const SwapRequests = () => {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Received, 1 = Sent
  const [ratingDialog, setRatingDialog] = useState({ open: false, swapId: null, otherUser: null });
  const [ratingData, setRatingData] = useState({ rating: null, comment: '' });
  const requestsPerPage = 2;
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadSwapRequests();
    // Mark notifications as read when user visits the swap requests page
    markNotificationsAsRead();
  }, [user]);

  const markNotificationsAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page when switching tabs
  };

  const loadSwapRequests = async () => {
    try {
      setLoading(true);
      const userRequests = await swapAPI.getSwapRequests();
      setRequests(userRequests.results || userRequests);
    } catch (error) {
      console.error('Failed to load swap requests:', error);
      setSnackbar({ open: true, message: 'Failed to load swap requests', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Separate received and sent requests
  const receivedRequests = requests.filter(req => req.to_user.id === user.id);
  const sentRequests = requests.filter(req => req.from_user.id === user.id);

  // Filter based on active tab and status filter
  const getFilteredRequests = () => {
    const tabRequests = activeTab === 0 ? receivedRequests : sentRequests;
    return filter === 'All' 
      ? tabRequests 
      : tabRequests.filter((req) => req.status === filter);
  };

  const filteredRequests = getFilteredRequests();

  const pageCount = Math.ceil(filteredRequests.length / requestsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (page - 1) * requestsPerPage,
    page * requestsPerPage
  );

  const handleAccept = async (id) => {
    try {
      await swapAPI.acceptSwapRequest(id);
      setSnackbar({ open: true, message: 'Request accepted successfully!', severity: 'success' });
      loadSwapRequests(); // Reload the requests
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to accept request', severity: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await swapAPI.rejectSwapRequest(id);
      setSnackbar({ open: true, message: 'Request rejected', severity: 'info' });
      loadSwapRequests(); // Reload the requests
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to reject request', severity: 'error' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await swapAPI.completeSwapRequest(id);
      setSnackbar({ open: true, message: 'Swap marked as completed!', severity: 'success' });
      loadSwapRequests(); // Reload the requests
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to complete swap', severity: 'error' });
    }
  };

  const handleRate = (swapId, otherUser) => {
    setRatingDialog({ open: true, swapId, otherUser });
    setRatingData({ rating: null, comment: '' });
  };

  const handleRatingSubmit = async () => {
    try {
      await swapAPI.rateSwap(ratingDialog.swapId, ratingData);
      setSnackbar({ open: true, message: 'Rating submitted successfully!', severity: 'success' });
      setRatingDialog({ open: false, swapId: null, otherUser: null });
      loadSwapRequests(); // Reload the requests
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to submit rating', severity: 'error' });
    }
  };

  const handleRatingClose = () => {
    setRatingDialog({ open: false, swapId: null, otherUser: null });
    setRatingData({ rating: null, comment: '' });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Skill Swap Platform
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            Home
          </Button>
          <Avatar src={user?.picture || mockProfilePhoto} />
        </Box>
      </Box>
      {/* Filter and search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter}
            label="Status"
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        {/* Search bar placeholder (not functional for now) */}
        <Box sx={{ flex: 1 }} />
      </Box>

      {/* Tabs for Received vs Sent */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="swap request tabs">
          <Tab 
            label={`Received (${filter === 'All' ? receivedRequests.length : receivedRequests.filter(req => req.status === filter).length})`} 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            label={`Sent (${filter === 'All' ? sentRequests.length : sentRequests.filter(req => req.status === filter).length})`} 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
      </Box>
            {/* Requests list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {paginatedRequests.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              {activeTab === 0 
                ? 'No received swap requests found.' 
                : 'No sent swap requests found.'
              }
            </Typography>
          ) : (
            paginatedRequests.map((req) => {
              const isReceived = req.to_user.id === user.id;
              const otherUser = isReceived ? req.from_user : req.to_user;
              
              return (
                <Card key={req.id} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 3, border: '1px solid #ccc' }}>
                  <Avatar sx={{ width: 64, height: 64, mr: 3 }} src={otherUser.photo}>
                    {!otherUser.photo && otherUser.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {otherUser.first_name} {otherUser.last_name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {isReceived ? "They offer:" : "You offer:"}
                      </Typography>
                      {req.skills_offered.map((skill) => (
                        <Chip key={skill.id} label={skill.name} color="primary" size="small" />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {isReceived ? "They want:" : "You want:"}
                      </Typography>
                      {req.skills_wanted.map((skill) => (
                        <Chip key={skill.id} label={skill.name} color="secondary" size="small" variant="outlined" />
                      ))}
                    </Box>
                    {req.message && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Message: {req.message}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">Rating: {otherUser.rating}/5</Typography>
                  </Box>
                  <Box sx={{ minWidth: 120, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>Status</Typography>
                    <Chip
                      label={req.status}
                      color={statusColors[req.status]}
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    {req.status === 'pending' && isReceived && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAccept(req.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                    {req.status === 'accepted' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleComplete(req.id)}
                        >
                          Mark Complete
                        </Button>
                      </Box>
                    )}
                    {req.status === 'completed' && req.can_rate && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          startIcon={<Star />}
                          onClick={() => handleRate(req.id, otherUser)}
                        >
                          Rate User
                        </Button>
                      </Box>
                    )}
                    {req.status === 'completed' && !req.can_rate && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        <Chip
                          label="Already Rated"
                          color="default"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Box>
                </Card>
              );
            })
          )}
        </Stack>
      )}
      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog.open} onClose={handleRatingClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Rate {ratingDialog.otherUser?.first_name || 'User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              How would you rate your experience with this skill swap?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Typography variant="body2">Rating:</Typography>
              <MuiRating
                value={ratingData.rating}
                onChange={(event, newValue) => {
                  setRatingData({ ...ratingData, rating: newValue });
                }}
                size="large"
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comment (optional)"
              value={ratingData.comment}
              onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
              placeholder="Share your experience with this skill swap..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRatingClose}>Cancel</Button>
          <Button 
            onClick={handleRatingSubmit} 
            variant="contained" 
            disabled={!ratingData.rating}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SwapRequests; 