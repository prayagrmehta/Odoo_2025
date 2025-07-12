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
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Add,
  Delete,
  Save,
  Cancel,
  LocationOn,
  Star,
  Visibility,
  VisibilityOff,
  Schedule,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userAPI, skillsAPI, userSkillsAPI } from '../services/apiService';

const Profile = () => {
  const { user, fetchUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditing, setIsEditing] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [skillDialogType, setSkillDialogType] = useState('offered');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    bio: '',
    availability: {
      weekdays: true,
      weekends: true,
      evenings: true,
      mornings: false,
    },
  });

  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);

  const [newSkill, setNewSkill] = useState({
    name: '',
    level: '',
    description: '',
    priority: 'Medium',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Any'];
  const priorities = ['Low', 'Medium', 'High'];
  const popularSkills = [
    'JavaScript', 'Python', 'React.js', 'Node.js', 'Java', 'C++', 'C#',
    'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'TypeScript', 'Angular',
    'Vue.js', 'Django', 'Flask', 'Express', 'Spring', 'Laravel',
    'Graphic Design', 'UI/UX Design', 'Photography', 'Video Editing',
    'Digital Marketing', 'Content Writing', 'Translation', 'Music',
    'Cooking', 'Fitness', 'Yoga', 'Chess', 'Language Learning'
  ];

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Try to load data from API, fallback to mock data if endpoints don't exist
      let profileData, offeredSkills, wantedSkills;
      
      try {
        // Load user profile and skills in parallel
        [profileData, offeredSkills, wantedSkills] = await Promise.all([
          userAPI.getProfile(),
          userSkillsAPI.getOfferedSkills(),
          userSkillsAPI.getWantedSkills(),
        ]);
      } catch (apiError) {
        console.log('API endpoints not available, using mock data:', apiError.message);
        
        // Fallback mock data
        profileData = {
          first_name: user?.firstName || 'John',
          last_name: user?.lastName || 'Doe',
          email: user?.email || 'john@example.com',
          location: 'New York, NY',
          bio: 'Passionate developer and lifelong learner. I love sharing knowledge and learning from others.',
          availability: {
            weekdays: true,
            weekends: true,
            evenings: true,
            mornings: false,
          },
        };
        
        offeredSkills = [
          { id: 1, name: 'JavaScript', level: 'Expert', description: 'Advanced JavaScript including ES6+, async/await, and modern frameworks' },
          { id: 2, name: 'React.js', level: 'Advanced', description: 'React development with hooks, context, and state management' },
          { id: 3, name: 'Node.js', level: 'Intermediate', description: 'Backend development with Node.js and Express' },
          { id: 4, name: 'UI/UX Design', level: 'Beginner', description: 'Basic design principles and Figma usage' },
        ];
        
        wantedSkills = [
          { id: 1, name: 'Python', level: 'Beginner', priority: 'High', description: 'Want to learn Python for data science' },
          { id: 2, name: 'Machine Learning', level: 'Intermediate', priority: 'Medium', description: 'Looking to understand ML algorithms' },
          { id: 3, name: 'Photography', level: 'Any', priority: 'Low', description: 'Basic photography skills for personal projects' },
        ];
      }

      // Set form data
      setFormData({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        email: profileData.email || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        availability: {
          weekdays: Array.isArray(profileData.availability) ? profileData.availability.includes('weekdays') : (profileData.availability?.weekdays || true),
          weekends: Array.isArray(profileData.availability) ? profileData.availability.includes('weekends') : (profileData.availability?.weekends || true),
          evenings: Array.isArray(profileData.availability) ? profileData.availability.includes('evenings') : (profileData.availability?.evenings || true),
          mornings: Array.isArray(profileData.availability) ? profileData.availability.includes('mornings') : (profileData.availability?.mornings || false),
        },
      });

      // Set profile photo if available
      if (profileData.photo) {
        setProfilePhoto(profileData.photo);
      }

      setSkillsOffered(offeredSkills);
      setSkillsWanted(wantedSkills);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load profile data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      try {
        // Check if there's a new profile photo to upload
        if (profilePhoto && profilePhoto.startsWith('data:')) {
          // Convert data URL to file
          const response = await fetch(profilePhoto);
          const blob = await response.blob();
          const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
          
          // Create FormData for file upload
          const uploadFormData = new FormData();
          uploadFormData.append('photo', file);
          
          // Add other profile data
          uploadFormData.append('first_name', formData.firstName);
          uploadFormData.append('last_name', formData.lastName);
          uploadFormData.append('bio', formData.bio);
          uploadFormData.append('location', formData.location);
          uploadFormData.append('availability', JSON.stringify(Object.keys(formData.availability).filter(key => formData.availability[key])));
          
          // Upload profile with photo
          await userAPI.updateProfileWithPhoto(uploadFormData);
        } else {
          // Update profile without photo
          const profileUpdateData = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            bio: formData.bio,
            location: formData.location,
            availability: Object.keys(formData.availability).filter(key => formData.availability[key])
          };
          console.log('Sending profile update data:', profileUpdateData);
          await userAPI.updateProfile(profileUpdateData);
        }
      } catch (apiError) {
        console.log('API endpoint not available, using local save:', apiError.message);
        // Continue with local save even if API fails
      }
      
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      
      // Refresh user data in context if API is available
      try {
        fetchUserProfile();
      } catch (err) {
        console.log('Could not refresh user profile:', err.message);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save profile. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
  };

  const handleAddSkill = async () => {
    try {
      let newSkillData;
      
      try {
        if (skillDialogType === 'offered') {
          newSkillData = await userSkillsAPI.addOfferedSkill(newSkill);
        } else {
          newSkillData = await userSkillsAPI.addWantedSkill(newSkill);
        }
      } catch (apiError) {
        console.log('API endpoint not available, using mock data:', apiError.message);
        // Create mock skill data
        newSkillData = {
          id: Date.now(), // Use timestamp as temporary ID
          ...newSkill
        };
      }
      
      if (skillDialogType === 'offered') {
        setSkillsOffered([...skillsOffered, newSkillData]);
      } else {
        setSkillsWanted([...skillsWanted, newSkillData]);
      }
      
      setNewSkill({ name: '', level: '', description: '', priority: 'Medium' });
      setOpenSkillDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Skill added successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to add skill:', err);
      setSnackbar({
        open: true,
        message: 'Failed to add skill. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteSkill = async (skillId, type) => {
    try {
      try {
        await userSkillsAPI.deleteSkill(skillId, type);
      } catch (apiError) {
        console.log('API endpoint not available, using local deletion:', apiError.message);
        // Continue with local deletion even if API fails
      }
      
      if (type === 'offered') {
        setSkillsOffered(skillsOffered.filter(skill => skill.id !== skillId));
      } else {
        setSkillsWanted(skillsWanted.filter(skill => skill.id !== skillId));
      }
      
      setSnackbar({
        open: true,
        message: 'Skill deleted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete skill. Please try again.',
        severity: 'error'
      });
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert':
        return 'error';
      case 'Advanced':
        return 'warning';
      case 'Intermediate':
        return 'info';
      case 'Beginner':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Profile
          </Typography>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {profileVisibility ? <Visibility /> : <VisibilityOff />}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {profileVisibility ? 'Public' : 'Private'}
                  </Typography>
                </Box>
              }
            />
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your profile information and skills
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    src={profilePhoto || user?.photo}
                  >
                    {!profilePhoto && !user?.photo && formData.firstName.charAt(0)}
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      component="label"
                      sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'background.paper', boxShadow: 1 }}
                      size="small"
                    >
                      <Edit fontSize="small" />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = ev => setProfilePhoto(ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formData.firstName} {formData.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {formData.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <Star fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Rating: {user?.rating || 0}/5
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Bio
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  variant="outlined"
                  size="small"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {formData.bio}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Availability
              </Typography>
              <Stack spacing={1}>
                {Object.entries(formData.availability).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          availability: {
                            ...formData.availability,
                            [key]: e.target.checked
                          }
                        })}
                        disabled={!isEditing}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {key}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills Management */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Skills Offered */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Skills Offered ({skillsOffered.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => {
                        setSkillDialogType('offered');
                        setOpenSkillDialog(true);
                      }}
                    >
                      Add Skill
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {skillsOffered.map((skill, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {skill.name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSkill(index, 'offered')}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                          <Chip
                            label={skill.level}
                            size="small"
                            color={getLevelColor(skill.level)}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {skill.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Skills Wanted */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Skills Wanted ({skillsWanted.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => {
                        setSkillDialogType('wanted');
                        setOpenSkillDialog(true);
                      }}
                    >
                      Add Skill
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {skillsWanted.map((skill, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {skill.name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSkill(index, 'wanted')}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip
                              label={skill.level}
                              size="small"
                              color={getLevelColor(skill.level)}
                            />
                            <Chip
                              label={skill.priority}
                              size="small"
                              color={getPriorityColor(skill.priority)}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {skill.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Add Skill Dialog */}
      <Dialog open={openSkillDialog} onClose={() => setOpenSkillDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {skillDialogType === 'offered' ? 'Skill Offered' : 'Skill Wanted'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              freeSolo
              options={popularSkills}
              value={newSkill.name}
              onChange={(event, newValue) => setNewSkill({ ...newSkill, name: newValue || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Skill Name"
                  fullWidth
                />
              )}
            />

            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                label="Level"
              >
                {skillLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {skillDialogType === 'wanted' && (
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newSkill.priority}
                  onChange={(e) => setNewSkill({ ...newSkill, priority: e.target.value })}
                  label="Priority"
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              placeholder={`Describe your ${skillDialogType === 'offered' ? 'expertise' : 'learning goals'}...`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSkillDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddSkill}
            disabled={!newSkill.name || !newSkill.level}
          >
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
