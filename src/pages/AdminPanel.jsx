import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
  CssBaseline,
  Divider,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Stack,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  MenuItem,
} from '@mui/material';
import {
  People,
  SwapHoriz,
  Warning,
  Analytics,
  AdminPanelSettings,
  Message,
  Download,
  Star,
  CheckCircle,
  Block,
  Edit,
  Search as SearchIcon,
} from '@mui/icons-material';
import { adminAPI } from '../services/apiService';

const drawerWidth = 240;

const sections = [
  { label: 'User Management', icon: <People /> },
  { label: 'Skill Moderation', icon: <Warning /> },
  { label: 'Swap Monitoring', icon: <SwapHoriz /> },
  { label: 'Platform Messages', icon: <Message /> },
  { label: 'Reports', icon: <Download /> },
];

const AdminPanel = () => {
  const [selectedSection, setSelectedSection] = useState(0);
  // User Management state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Skill Moderation state
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillSnackbar, setSkillSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Swap Monitoring state
  const [swaps, setSwaps] = useState([]);
  const [swapsLoading, setSwapsLoading] = useState(false);
  const [swapStatus, setSwapStatus] = useState('');
  const [swapSnackbar, setSwapSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Platform Messages state
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSnackbar, setMessageSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Reports state
  const [downloadingReport, setDownloadingReport] = useState('');
  const [reportsSnackbar, setReportsSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (selectedSection === 0) {
      fetchUsers();
    }
    if (selectedSection === 1) {
      fetchSkills();
    }
    if (selectedSection === 2) {
      fetchSwaps();
    }
    // eslint-disable-next-line
  }, [selectedSection]);

  const fetchUsers = async (searchTerm = '') => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllUsers(searchTerm);
      setUsers(data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId, isBanned) => {
    try {
      await adminAPI.toggleUserBan(userId, isBanned);
      setSnackbar({ open: true, message: `User ${isBanned ? 'banned' : 'unbanned'} successfully!`, severity: 'success' });
      fetchUsers(search);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update user status', severity: 'error' });
    }
  };

  const fetchSkills = async (searchTerm = '') => {
    setSkillsLoading(true);
    try {
      const data = await adminAPI.getAllSkills(searchTerm);
      setSkills(data);
    } catch (err) {
      setSkillSnackbar({ open: true, message: 'Failed to load skills', severity: 'error' });
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleRejectSkill = async (skillId) => {
    try {
      await adminAPI.deleteSkill(skillId);
      setSkillSnackbar({ open: true, message: 'Skill rejected (deleted) successfully!', severity: 'success' });
      fetchSkills(skillSearch);
    } catch (err) {
      setSkillSnackbar({ open: true, message: 'Failed to reject skill', severity: 'error' });
    }
  };

  const fetchSwaps = async (status = '') => {
    setSwapsLoading(true);
    try {
      const data = await adminAPI.getAllSwaps(status);
      setSwaps(data);
    } catch (err) {
      setSwapSnackbar({ open: true, message: 'Failed to load swaps', severity: 'error' });
    } finally {
      setSwapsLoading(false);
    }
  };

  const handleStatusFilter = (e) => {
    setSwapStatus(e.target.value);
    fetchSwaps(e.target.value);
  };

  const handleSendPlatformMessage = async () => {
    if (!messageTitle.trim() || !messageBody.trim()) {
      setMessageSnackbar({ open: true, message: 'Please fill in both title and message', severity: 'error' });
      return;
    }

    setSendingMessage(true);
    try {
      const response = await adminAPI.sendPlatformMessage({
        title: messageTitle.trim(),
        message: messageBody.trim()
      });
      
      setMessageSnackbar({ 
        open: true, 
        message: `Message sent successfully to ${response.users_notified} users!`, 
        severity: 'success' 
      });
      
      // Clear the form
      setMessageTitle('');
      setMessageBody('');
    } catch (err) {
      setMessageSnackbar({ 
        open: true, 
        message: 'Failed to send platform message', 
        severity: 'error' 
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    setDownloadingReport(reportType);
    try {
      const { blob, filename } = await adminAPI.downloadReport(reportType);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setReportsSnackbar({ 
        open: true, 
        message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully!`, 
        severity: 'success' 
      });
    } catch (err) {
      setReportsSnackbar({ 
        open: true, 
        message: `Failed to download ${reportType} report`, 
        severity: 'error' 
      });
    } finally {
      setDownloadingReport('');
    }
  };

  const renderUserManagement = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>User Management</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') fetchUsers(e.target.value); }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
          sx={{ width: 300, mr: 2 }}
        />
        <Button variant="outlined" onClick={() => fetchUsers(search)}>Search</Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar src={user.photo} />
                      <Box>
                        <Typography variant="subtitle2">{user.name || user.username}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.username}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Banned'}
                      color={user.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color={user.is_active ? 'error' : 'success'}
                        onClick={() => handleBanToggle(user.id, user.is_active)}
                        title={user.is_active ? 'Ban User' : 'Unban User'}
                      >
                        {user.is_active ? <Block /> : <CheckCircle />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );

  const renderSkillModeration = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Skill Moderation</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search skills..."
          value={skillSearch}
          onChange={e => setSkillSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') fetchSkills(e.target.value); }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
          sx={{ width: 300, mr: 2 }}
        />
        <Button variant="outlined" onClick={() => fetchSkills(skillSearch)}>Search</Button>
      </Box>
      {skillsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Skill</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skills.map(skill => (
                <TableRow key={skill.id}>
                  <TableCell>{skill.name}</TableCell>
                  <TableCell>{skill.description || '-'}</TableCell>
                  <TableCell>{skill.created_at ? new Date(skill.created_at).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => handleRejectSkill(skill.id)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={skillSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setSkillSnackbar({ ...skillSnackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSkillSnackbar({ ...skillSnackbar, open: false })} severity={skillSnackbar.severity} sx={{ width: '100%' }}>
          {skillSnackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );

  const renderSwapMonitoring = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Swap Monitoring</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={swapStatus}
          onChange={handleStatusFilter}
          sx={{ width: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="accepted">Accepted</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>
      </Box>
      {swapsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From User</TableCell>
                <TableCell>To User</TableCell>
                <TableCell>Skills Offered</TableCell>
                <TableCell>Skills Wanted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {swaps.map(swap => (
                <TableRow key={swap.id}>
                  <TableCell>{swap.from_user?.name || swap.from_user?.username}</TableCell>
                  <TableCell>{swap.to_user?.name || swap.to_user?.username}</TableCell>
                  <TableCell>{swap.skills_offered.map(s => s.name).join(', ')}</TableCell>
                  <TableCell>{swap.skills_wanted.map(s => s.name).join(', ')}</TableCell>
                  <TableCell>
                    <Chip label={swap.status} color={
                      swap.status === 'pending' ? 'warning' :
                      swap.status === 'accepted' ? 'success' :
                      swap.status === 'completed' ? 'primary' :
                      swap.status === 'rejected' ? 'error' : 'default'
                    } size="small" />
                  </TableCell>
                  <TableCell>{swap.created_at ? new Date(swap.created_at).toLocaleDateString() : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={swapSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setSwapSnackbar({ ...swapSnackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSwapSnackbar({ ...swapSnackbar, open: false })} severity={swapSnackbar.severity} sx={{ width: '100%' }}>
          {swapSnackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );

  const renderPlatformMessages = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Platform Messages</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Send platform-wide messages and notifications to all users.
      </Typography>
      
      <Box sx={{ maxWidth: 600 }}>
        <TextField
          fullWidth
          label="Message Title"
          value={messageTitle}
          onChange={(e) => setMessageTitle(e.target.value)}
          placeholder="Enter a clear, concise title for your message"
          sx={{ mb: 3 }}
          disabled={sendingMessage}
        />
        
        <TextField
          fullWidth
          label="Message Body"
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="Enter your platform-wide message here..."
          multiline
          rows={6}
          sx={{ mb: 3 }}
          disabled={sendingMessage}
        />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSendPlatformMessage}
            disabled={sendingMessage || !messageTitle.trim() || !messageBody.trim()}
            startIcon={sendingMessage ? <CircularProgress size={20} /> : <Message />}
          >
            {sendingMessage ? 'Sending...' : 'Send Platform Message'}
          </Button>
          
          {sendingMessage && (
            <Typography variant="body2" color="text.secondary">
              This may take a moment for large user bases...
            </Typography>
          )}
        </Box>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            💡 Tips for effective platform messages:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            • Keep titles clear and actionable<br/>
            • Use concise, friendly language<br/>
            • Include important updates or announcements<br/>
            • Avoid sending too frequently to prevent notification fatigue
          </Typography>
        </Box>
      </Box>
      
      <Snackbar
        open={messageSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setMessageSnackbar({ ...messageSnackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setMessageSnackbar({ ...messageSnackbar, open: false })} severity={messageSnackbar.severity} sx={{ width: '100%' }}>
          {messageSnackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );

  const renderReports = () => (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Reports</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Download comprehensive reports of user activity, feedback logs, and swap statistics.
      </Typography>
      
      <Box sx={{ display: 'grid', gap: 3, maxWidth: 800 }}>
        {/* User Activity Report */}
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'grey.200' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>User Activity Report</Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive user data including registration dates, activity status, skills, and swap statistics.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => handleDownloadReport('users')}
              disabled={downloadingReport === 'users'}
              startIcon={downloadingReport === 'users' ? <CircularProgress size={20} /> : <Download />}
            >
              {downloadingReport === 'users' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Includes:</strong> User IDs, usernames, emails, join dates, last login, active status, 
            skills offered/wanted counts, total swaps, completed swaps
          </Typography>
        </Paper>

        {/* Swap Activity Report */}
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'grey.200' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Swap Activity Report</Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed swap request data including participants, skills exchanged, status, and timestamps.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => handleDownloadReport('swaps')}
              disabled={downloadingReport === 'swaps'}
              startIcon={downloadingReport === 'swaps' ? <CircularProgress size={20} /> : <Download />}
            >
              {downloadingReport === 'swaps' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Includes:</strong> Swap IDs, from/to users, skills offered/wanted, status, 
            creation/update dates, messages
          </Typography>
        </Paper>

        {/* Feedback Report */}
        <Paper sx={{ p: 3, border: '1px solid', borderColor: 'grey.200' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Feedback Report</Typography>
              <Typography variant="body2" color="text.secondary">
                User feedback and ratings from completed swaps and interactions.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => handleDownloadReport('feedback')}
              disabled={downloadingReport === 'feedback'}
              startIcon={downloadingReport === 'feedback' ? <CircularProgress size={20} /> : <Download />}
            >
              {downloadingReport === 'feedback' ? 'Generating...' : 'Download CSV'}
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Includes:</strong> Rating IDs, swap details, user feedback, ratings, comments, timestamps
          </Typography>
        </Paper>
      </Box>

      {/* Report Tips */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          📊 Report Usage Tips:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          • <strong>User Activity:</strong> Use for user engagement analysis and growth metrics<br/>
          • <strong>Swap Activity:</strong> Analyze platform usage patterns and success rates<br/>
          • <strong>Feedback:</strong> Monitor user satisfaction and identify improvement areas<br/>
          • <strong>Data Analysis:</strong> Import CSV files into Excel, Google Sheets, or analytics tools<br/>
          • <strong>Regular Reports:</strong> Generate reports weekly/monthly for trend analysis
        </Typography>
      </Box>
      
      <Snackbar
        open={reportsSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setReportsSnackbar({ ...reportsSnackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setReportsSnackbar({ ...reportsSnackbar, open: false })} severity={reportsSnackbar.severity} sx={{ width: '100%' }}>
          {reportsSnackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );

  const renderSection = () => {
    switch (selectedSection) {
      case 0:
        return renderUserManagement();
      case 1:
        return renderSkillModeration();
      case 2:
        return renderSwapMonitoring();
      case 3:
        return renderPlatformMessages();
      case 4:
        return renderReports();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
      <List>
          {sections.map((section, idx) => (
            <ListItem
              button
              key={section.label}
              selected={selectedSection === idx}
              onClick={() => setSelectedSection(idx)}
            >
              <ListItemIcon>{section.icon}</ListItemIcon>
              <ListItemText primary={section.label} />
        </ListItem>
          ))}
      </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh' }}>
        <Toolbar />
        <Container maxWidth="lg">
          {renderSection()}
    </Container>
      </Box>
    </Box>
  );
};

export default AdminPanel;
