import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Alert,
  Badge,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  People,
  SwapHoriz,
  Warning,
  Block,
  CheckCircle,
  Cancel,
  Message,
  Download,
  Analytics,
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
  Send,
  Delete,
  Edit,
  Star,
} from '@mui/icons-material';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageContent, setMessageContent] = useState('');

  // Mock data
  const stats = [
    { title: 'Total Users', value: 1247, icon: <People />, color: 'primary.main' },
    { title: 'Active Swaps', value: 89, icon: <SwapHoriz />, color: 'success.main' },
    { title: 'Pending Reviews', value: 12, icon: <Warning />, color: 'warning.main' },
    { title: 'Banned Users', value: 3, icon: <Block />, color: 'error.main' },
  ];

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      joinDate: '2024-01-15',
      totalSwaps: 24,
      rating: 4.8,
      isBanned: false,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      status: 'pending_review',
      joinDate: '2024-01-20',
      totalSwaps: 0,
      rating: 0,
      isBanned: false,
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike@example.com',
      status: 'active',
      joinDate: '2024-01-10',
      totalSwaps: 15,
      rating: 4.6,
      isBanned: false,
    },
    {
      id: 4,
      name: 'Spam User',
      email: 'spam@example.com',
      status: 'banned',
      joinDate: '2024-01-25',
      totalSwaps: 0,
      rating: 0,
      isBanned: true,
    },
  ];

  const pendingSwaps = [
    {
      id: 1,
      user1: 'John Doe',
      user2: 'Sarah Johnson',
      skill1: 'JavaScript',
      skill2: 'Photography',
      status: 'pending',
      date: '2024-01-25',
    },
    {
      id: 2,
      user1: 'Mike Chen',
      user2: 'Emma Davis',
      skill1: 'Python',
      skill2: 'Spanish',
      status: 'accepted',
      date: '2024-01-24',
    },
    {
      id: 3,
      user1: 'Alex Thompson',
      user2: 'Lisa Wang',
      skill1: 'Guitar',
      skill2: 'Cooking',
      status: 'cancelled',
      date: '2024-01-23',
    },
  ];

  const reports = [
    {
      id: 1,
      type: 'inappropriate_content',
      reporter: 'John Doe',
      reportedUser: 'Spam User',
      description: 'User posted inappropriate skill descriptions',
      status: 'resolved',
      date: '2024-01-25',
    },
    {
      id: 2,
      type: 'spam',
      reporter: 'Sarah Johnson',
      reportedUser: 'Spam User',
      description: 'Multiple spam messages sent',
      status: 'pending',
      date: '2024-01-24',
    },
  ];

  const platformMessages = [
    {
      id: 1,
      title: 'New Feature: Skill Verification',
      content: 'We\'ve added a new skill verification system to ensure quality exchanges.',
      date: '2024-01-25',
      sent: true,
    },
    {
      id: 2,
      title: 'Scheduled Maintenance',
      content: 'Platform will be down for maintenance on Sunday, 2-4 AM EST.',
      date: '2024-01-26',
      sent: false,
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUserAction = (userId, action) => {
    console.log(`${action} user ${userId}`);
    // Implement user action logic
  };

  const handleSendMessage = () => {
    console.log('Sending platform message:', messageContent);
    setMessageContent('');
    setOpenMessageDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending_review':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSwapStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, monitor swaps, and maintain platform quality
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

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="User Management" />
              <Tab label="Swap Monitoring" />
              <Tab label="Reports" />
              <Tab label="Platform Messages" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  User Management
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                >
                  Export Users
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Join Date</TableCell>
                      <TableCell>Swaps</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              {user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {user.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status.replace('_', ' ')}
                            color={getStatusColor(user.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.totalSwaps}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
                            {user.rating}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenUserDialog(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                            {user.isBanned ? (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleUserAction(user.id, 'unban')}
                              >
                                <CheckCircle />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleUserAction(user.id, 'ban')}
                              >
                                <Block />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Swap Monitoring
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Users</TableCell>
                      <TableCell>Skills Exchanged</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingSwaps.map((swap) => (
                      <TableRow key={swap.id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {swap.user1} ↔ {swap.user2}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {swap.skill1} ↔ {swap.skill2}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={swap.status}
                            color={getSwapStatusColor(swap.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{swap.date}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Message />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                User Reports
              </Typography>

              <List>
                {reports.map((report) => (
                  <React.Fragment key={report.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: report.status === 'resolved' ? 'success.main' : 'warning.main' }}>
                          <Warning />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {report.type.replace('_', ' ')}
                            </Typography>
                            <Chip
                              label={report.status}
                              size="small"
                              color={report.status === 'resolved' ? 'success' : 'warning'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Reported by: {report.reporter} | User: {report.reportedUser}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {report.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.date}
                            </Typography>
                          </Box>
                        }
                      />
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined">
                          Review
                        </Button>
                        <Button size="small" color="error" variant="outlined">
                          Ban User
                        </Button>
                      </Stack>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Platform Messages
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={() => setOpenMessageDialog(true)}
                >
                  Send Message
                </Button>
              </Box>

              <List>
                {platformMessages.map((message) => (
                  <React.Fragment key={message.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: message.sent ? 'success.main' : 'warning.main' }}>
                          <Message />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {message.title}
                            </Typography>
                            <Chip
                              label={message.sent ? 'Sent' : 'Draft'}
                              size="small"
                              color={message.sent ? 'success' : 'warning'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {message.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {message.date}
                            </Typography>
                          </Box>
                        }
                      />
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Stack>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="md" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    User Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Join Date:</strong> {selectedUser.joinDate}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Swaps:</strong> {selectedUser.totalSwaps}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rating:</strong> {selectedUser.rating}/5.0
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Account Status
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!selectedUser.isBanned}
                        onChange={() => handleUserAction(selectedUser.id, selectedUser.isBanned ? 'unban' : 'ban')}
                        color="primary"
                      />
                    }
                    label={selectedUser.isBanned ? 'Banned' : 'Active'}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenUserDialog(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleUserAction(selectedUser.id, 'delete');
                  setOpenUserDialog(false);
                }}
              >
                Delete User
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Platform Message</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Message Title"
              placeholder="Enter message title..."
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message Content"
              placeholder="Enter your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Message Type</InputLabel>
              <Select label="Message Type">
                <MenuItem value="announcement">Announcement</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="feature">Feature Update</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!messageContent.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
