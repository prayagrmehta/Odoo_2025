import React, { useState } from 'react';
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
} from '@mui/material';
import { Search, LocationOn, Star, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Browse = () => {
  // Mock login state
  const [isLoggedIn] = useState(false); // Set to true to simulate logged-in
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const usersPerPage = 3;

  // Mock users (add isPublic)
  const users = [
    {
      id: 1,
      name: 'Marc Demo',
      location: 'New York, NY',
      avatar: null,
      rating: 3.9,
      skillsOffered: ['Photoshop', 'Excel'],
      skillsWanted: ['Python'],
      availability: ['weekends', 'evenings'],
      isPublic: true,
    },
    {
      id: 2,
      name: 'Michael',
      location: 'San Francisco, CA',
      avatar: null,
      rating: 4.2,
      skillsOffered: ['JavaScript', 'React'],
      skillsWanted: ['Design'],
      availability: ['weekdays'],
      isPublic: true,
    },
    {
      id: 3,
      name: 'Joe Vills',
      location: 'Chicago, IL',
      avatar: null,
      rating: 4.0,
      skillsOffered: ['Cooking'],
      skillsWanted: ['Photography'],
      availability: ['weekends'],
      isPublic: true,
    },
    // More mock users for pagination
    {
      id: 5,
      name: 'Alice Smith',
      location: 'Boston, MA',
      avatar: null,
      rating: 4.7,
      skillsOffered: ['French', 'Public Speaking'],
      skillsWanted: ['Python', 'Excel'],
      availability: ['weekdays', 'evenings'],
      isPublic: true,
    },
    {
      id: 6,
      name: 'Bob Lee',
      location: 'Seattle, WA',
      avatar: null,
      rating: 4.3,
      skillsOffered: ['Guitar', 'Music Theory'],
      skillsWanted: ['React', 'UI/UX'],
      availability: ['weekends'],
      isPublic: true,
    },
    {
      id: 7,
      name: 'Priya Patel',
      location: 'Houston, TX',
      avatar: null,
      rating: 4.8,
      skillsOffered: ['Yoga', 'Meditation'],
      skillsWanted: ['Cooking', 'Photography'],
      availability: ['weekdays'],
      isPublic: true,
    },
    {
      id: 8,
      name: 'Carlos Gomez',
      location: 'Miami, FL',
      avatar: null,
      rating: 4.1,
      skillsOffered: ['Spanish', 'Salsa Dancing'],
      skillsWanted: ['English', 'Public Speaking'],
      availability: ['evenings'],
      isPublic: true,
    },
    {
      id: 9,
      name: 'Linda Zhou',
      location: 'Denver, CO',
      avatar: null,
      rating: 4.6,
      skillsOffered: ['Data Science', 'Python'],
      skillsWanted: ['French', 'Music Theory'],
      availability: ['weekends', 'evenings'],
      isPublic: true,
    },
    {
      id: 10,
      name: 'Tom Brown',
      location: 'Portland, OR',
      avatar: null,
      rating: 4.0,
      skillsOffered: ['Excel', 'Project Management'],
      skillsWanted: ['Cooking', 'Yoga'],
      availability: ['weekdays'],
      isPublic: true,
    },
    {
      id: 11,
      name: 'Sofia Rossi',
      location: 'Los Angeles, CA',
      avatar: null,
      rating: 4.9,
      skillsOffered: ['Italian', 'Photography'],
      skillsWanted: ['English', 'React'],
      availability: ['weekends'],
      isPublic: true,
    },
    {
      id: 12,
      name: 'Yuki Tanaka',
      location: 'San Diego, CA',
      avatar: null,
      rating: 4.5,
      skillsOffered: ['Japanese', 'Calligraphy'],
      skillsWanted: ['Spanish', 'Public Speaking'],
      availability: ['weekdays', 'evenings'],
      isPublic: true,
    },
    {
      id: 13,
      name: 'Omar Farouk',
      location: 'Dallas, TX',
      avatar: null,
      rating: 4.4,
      skillsOffered: ['Arabic', 'Chess'],
      skillsWanted: ['English', 'Excel'],
      availability: ['weekends'],
      isPublic: true,
    },
    {
      id: 14,
      name: 'Mia Müller',
      location: 'Berlin, Germany',
      avatar: null,
      rating: 4.7,
      skillsOffered: ['German', 'Piano'],
      skillsWanted: ['English', 'Yoga'],
      availability: ['weekdays'],
      isPublic: true,
    },
  ];

  // Filter only public profiles
  const publicUsers = users.filter(u => u.isPublic);

  // Filter by search and availability
  const filteredUsers = publicUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAvailability =
      !availability || user.availability.includes(availability);
    return matchesSearch && matchesAvailability;
  });

  // Pagination
  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  const navigate = useNavigate();

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
      <Stack spacing={3}>
        {paginatedUsers.map(user => (
          <Card key={user.id} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, mr: 3 }}>
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{user.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{user.location}</Typography>
                <Schedule fontSize="small" color="action" sx={{ ml: 2 }} />
                <Typography variant="body2" color="text.secondary">{user.availability.join(', ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {user.skillsOffered.map(skill => (
                  <Chip key={skill} label={skill} color="primary" size="small" />
                ))}
                {user.skillsWanted.map(skill => (
                  <Chip key={skill} label={skill} color="secondary" size="small" variant="outlined" />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">Rating: {user.rating}/5</Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login');
                } else {
                  // handle request swap logic here
                }
              }}
            >
              {isLoggedIn ? 'Request' : 'Login/Sign up first'}
            </Button>
          </Card>
        ))}
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default Browse;
