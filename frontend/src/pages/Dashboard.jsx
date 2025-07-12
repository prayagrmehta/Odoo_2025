import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Stack,
  Badge,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Person,
  SwapHoriz,
  Star,
  TrendingUp,
  Add,
  CheckCircle,
  Pending,
  Cancel,
  Message,
  LocationOn,
  Edit,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [profileVisibility, setProfileVisibility] = useState(true);

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    location: 'New York, NY',
    avatar: null,
    rating: 4.8,
    totalSwaps: 24,
    completedSwaps: 18,
    pendingSwaps: 3,
    cancelledSwaps: 3,
  };

  const skillsOffered = [
    { name: 'JavaScript', level: 'Expert', rating: 4.9 },
    { name: 'React.js', level: 'Advanced', rating: 4.7 },
    { name: 'Node.js', level: 'Intermediate', rating: 4.5 },
    { name: 'UI/UX Design', level: 'Beginner', rating: 4.2 },
  ];

  const skillsWanted = [
    { name: 'Python', level: 'Beginner', priority: 'High' },
    { name: 'Machine Learning', level: 'Intermediate', priority: 'Medium' },
    { name: 'Photography', level: 'Any', priority: 'Low' },
  ];

  const recentSwaps = [
    {
      id: 1,
      type: 'offered',
      skill: 'JavaScript',
      partner: 'Sarah Johnson',
      status: 'completed',
      date: '2024-01-15',
      rating: 5,
    },
    {
      id: 2,
      type: 'wanted',
      skill: 'Python',
      partner: 'Mike Chen',
      status: 'pending',
      date: '2024-01-10',
    },
    {
      id: 3,
      type: 'offered',
      skill: 'React.js',
      partner: 'Emma Davis',
      status: 'cancelled',
      date: '2024-01-08',
    },
  ];

  const notifications = [
    {
      id: 1,
      type: 'swap_request',
      message: 'Sarah Johnson wants to learn JavaScript from you',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'swap_accepted',
      message: 'Mike Chen accepted your Python learning request',
      time: '1 day ago',
      read: true,
    },
    {
      id: 3,
      type: 'rating',
      message: 'You received a 5-star rating for your React.js teaching',
      time: '2 days ago',
      read: true,
    },
  ];

  const stats = [
    {
      title: 'Total Swaps',
      value: user.totalSwaps,
      icon: <SwapHoriz />,
      color: 'primary.main',
    },
    {
      title: 'Completed',
      value: user.completedSwaps,
      icon: <CheckCircle />,
      color: 'success.main',
    },
    {
      title: 'Pending',
      value: user.pendingSwaps,
      icon: <Pending />,
      color: 'warning.main',
    },
    {
      title: 'Rating',
      value: user.rating,
      icon: <Star />,
      color: 'secondary.main',
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <Pending fontSize="small" />;
      case 'cancelled':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user.name}! Here's what's happening with your skill swaps.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ width: 64, height: 64, mr: 2 }}
                >
                  {user.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {user.location}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.rating} / 5.0
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => navigate('/profile')}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={profileVisibility ? <Visibility /> : <VisibilityOff />}
                  onClick={() => setProfileVisibility(!profileVisibility)}
                >
                  {profileVisibility ? 'Public' : 'Private'}
                </Button>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Skills Offered ({skillsOffered.length})
              </Typography>
              <Box sx={{ mb: 2 }}>
                {skillsOffered.slice(0, 3).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill.name}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                {skillsOffered.length > 3 && (
                  <Chip
                    label={`+${skillsOffered.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Skills Wanted ({skillsWanted.length})
              </Typography>
              <Box>
                {skillsWanted.slice(0, 3).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill.name}
                    size="small"
                    color="secondary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                {skillsWanted.length > 3 && (
                  <Chip
                    label={`+${skillsWanted.length - 3} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Recent Swaps" />
                  <Tab label="Notifications" />
                </Tabs>
              </Box>

              {tabValue === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Recent Activity
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/browse')}
                    >
                      View All
                    </Button>
                  </Box>
                  
                  <List>
                    {recentSwaps.map((swap, index) => (
                      <React.Fragment key={swap.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: swap.type === 'offered' ? 'primary.main' : 'secondary.main' }}>
                              {swap.type === 'offered' ? 'O' : 'W'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {swap.skill}
                                </Typography>
                                <Chip
                                  label={swap.status}
                                  size="small"
                                  color={getStatusColor(swap.status)}
                                  icon={getStatusIcon(swap.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  with {swap.partner} • {swap.date}
                                </Typography>
                                {swap.rating && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Star sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                                    <Typography variant="body2">
                                      {swap.rating} stars
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                          <IconButton size="small">
                            <Message />
                          </IconButton>
                        </ListItem>
                        {index < recentSwaps.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Notifications
                  </Typography>
                  
                  <List>
                    {notifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Badge
                              color="error"
                              variant="dot"
                              invisible={notification.read}
                            >
                              <Avatar sx={{ bgcolor: 'grey.300' }}>
                                <Message />
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.message}
                            secondary={notification.time}
                          />
                        </ListItem>
                        {index < notifications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
