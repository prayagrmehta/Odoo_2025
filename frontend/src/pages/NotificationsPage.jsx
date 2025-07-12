import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { Notifications as NotificationsIcon, CheckCircle, ErrorOutline } from '@mui/icons-material';
import { notificationsAPI } from '../services/apiService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await notificationsAPI.getNotifications();
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <NotificationsIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h4" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
            No notifications yet.
          </Typography>
        ) : (
          <List>
            {notifications.map((n, idx) => (
              <React.Fragment key={n.id || idx}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {n.read ? (
                      <CheckCircle color="success" />
                    ) : (
                      <ErrorOutline color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1" fontWeight={n.read ? 400 : 600}>
                          {n.message}
                        </Typography>
                        {!n.read && (
                          <Chip label="New" color="warning" size="small" />
                        )}
                      </Stack>
                    }
                    secondary={
                      n.created_at
                        ? new Date(n.created_at).toLocaleString()
                        : ''
                    }
                  />
                </ListItem>
                {idx < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;
