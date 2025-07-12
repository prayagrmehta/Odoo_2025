import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home } from '@mui/icons-material';

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
  Pending: 'warning',
  Accepted: 'success',
  Rejected: 'error',
};

const SwapRequests = () => {
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const requestsPerPage = 2;
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const filteredRequests =
    filter === 'All'
      ? mockRequests
      : mockRequests.filter((req) => req.status === filter);

  const pageCount = Math.ceil(filteredRequests.length / requestsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (page - 1) * requestsPerPage,
    page * requestsPerPage
  );

  const handleAccept = (id) => {
    setSnackbar({ open: true, message: `Accepted request ${id}`, severity: 'success' });
    // Implement accept logic here
  };
  const handleReject = (id) => {
    setSnackbar({ open: true, message: `Rejected request ${id}`, severity: 'error' });
    // Implement reject logic here
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
          <Avatar src={mockProfilePhoto} />
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
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Accepted">Accepted</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        {/* Search bar placeholder (not functional for now) */}
        <Box sx={{ flex: 1 }} />
      </Box>
      {/* Requests list */}
      <Stack spacing={3}>
        {paginatedRequests.map((req) => (
          <Card key={req.id} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 3, border: '1px solid #ccc' }}>
            <Avatar sx={{ width: 64, height: 64, mr: 3 }} src={req.user.photo}>
              {!req.user.photo && req.user.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{req.user.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Skills Offered:</Typography>
                {req.user.skillsOffered.map((skill) => (
                  <Chip key={skill} label={skill} color="primary" size="small" />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Skills Wanted:</Typography>
                {req.user.skillsWanted.map((skill) => (
                  <Chip key={skill} label={skill} color="secondary" size="small" variant="outlined" />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">rating: {req.user.rating}/5</Typography>
            </Box>
            <Box sx={{ minWidth: 120, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Status</Typography>
              <Chip
                label={req.status}
                color={statusColors[req.status]}
                sx={{ mb: 1, fontWeight: 600 }}
              />
              {req.status === 'Pending' && (
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
            </Box>
          </Card>
        ))}
      </Stack>
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
    </Container>
  );
};

export default SwapRequests; 