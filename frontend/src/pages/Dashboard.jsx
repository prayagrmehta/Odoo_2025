import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
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
import { useAuth } from '../context/AuthContext';
import { swapAPI, userSkillsAPI, notificationsAPI } from '../services/apiService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dynamic data
  const [stats, setStats] = useState([]);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load data from API, fallback to mock data if endpoints don't exist
      let swapStats, offeredSkills, wantedSkills, recentSwapsData, notificationsData;
      
      try {
        // Load all dashboard data in parallel
        [swapStats, offeredSkills, wantedSkills, recentSwapsData, notificationsData] = await Promise.all([
          swapAPI.getSwapStats(),
          userSkillsAPI.getOfferedSkills(),
          userSkillsAPI.getWantedSkills(),
          swapAPI.getRecentSwaps(),
          notificationsAPI.getNotifications(),
        ]);
      } catch (apiError) {
        console.log('API endpoints not available, using mock data:', apiError.message);
        
        // Fallback mock data
        swapStats = {
          total_swaps: 24,
          completed_swaps: 18,
          pending_swaps: 3,
          average_rating: 4.8,
        };
        
        offeredSkills = [
          { name: 'JavaScript', level: 'Expert', rating: 4.9 },
          { name: 'React.js', level: 'Advanced', rating: 4.7 },
          { name: 'Node.js', level: 'Intermediate', rating: 4.5 },
          { name: 'UI/UX Design', level: 'Beginner', rating: 4.2 },
        ];
        
        wantedSkills = [
          { name: 'Python', level: 'Beginner', priority: 'High' },
          { name: 'Machine Learning', level: 'Intermediate', priority: 'Medium' },
          { name: 'Photography', level: 'Any', priority: 'Low' },
        ];
        
        recentSwapsData = [
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
        
        notificationsData = [
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
      }

      // Set stats
      setStats([
        {
          title: 'Total Swaps',
          value: swapStats.total_swaps || 0,
          icon: <SwapHoriz />,
          color: 'primary.main',
        },
        {
          title: 'Completed',
          value: swapStats.completed_swaps || 0,
          icon: <CheckCircle />,
          color: 'success.main',
        },
        {
          title: 'Pending',
          value: swapStats.pending_swaps || 0,
          icon: <Pending />,
          color: 'warning.main',
        },
        {
          title: 'Rating',
          value: swapStats.average_rating || 0,
          icon: <Star />,
          color: 'secondary.main',
        },
      ]);

      setSkillsOffered(offeredSkills);
      setSkillsWanted(wantedSkills);

      // Map recentSwapsData to extract partner, skill, date, and status
      const mappedRecentSwaps = (recentSwapsData || []).map(swap => {
        // Determine the other user
        let partner = '';
        if (swap.from_user && swap.to_user && user) {
          if (swap.from_user.id === user.id) {
            partner = swap.to_user.name || swap.to_user.username || swap.to_user.email;
          } else {
            partner = swap.from_user.name || swap.from_user.username || swap.from_user.email;
          }
        }
        // Get skill name (first offered or wanted)
        let skill = '';
        if (swap.skills_offered && swap.skills_offered.length > 0) {
          skill = swap.skills_offered[0].name;
        } else if (swap.skills_wanted && swap.skills_wanted.length > 0) {
          skill = swap.skills_wanted[0].name;
        }
        // Format date
        let date = swap.created_at ? new Date(swap.created_at).toLocaleDateString() : '';
        return {
          id: swap.id,
          partner,
          skill,
          status: swap.status,
          date,
          rating: swap.ratings && swap.ratings.length > 0 ? swap.ratings[0].rating : undefined,
        };
      });
      setRecentSwaps(mappedRecentSwaps);
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Safety check for user object
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please log in to view your dashboard.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name || user?.email || 'User'}! Here's what's happening with your skill swaps.
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
                  src={user?.photo}
                >
                  {user?.photo ? null : (user?.name ? user.name.charAt(0) : (user?.email ? user.email.charAt(0) : 'U'))}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {user?.name || user?.email || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'No email'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {user?.location || 'Location not set'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user?.rating || 0} / 5.0
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
