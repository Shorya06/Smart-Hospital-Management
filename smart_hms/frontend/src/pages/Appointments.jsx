import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Fab,
  Grid,
  Avatar,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday,
  Person,
  MedicalServices,
  Schedule,
  CheckCircle,
  Pending,
  Cancel,
  Edit,
  Delete,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI, doctorAPI } from '@/services/api';

const Appointments = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctor: '',
    appointment_date: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('Appointments useEffect triggered, user:', user);
    console.log('User role:', user?.role);
    fetchAppointments();
    if (user?.role === 'patient') {
      fetchDoctors();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('Fetching appointments...');
      console.log('Current user:', user);
      console.log('Access token:', localStorage.getItem('access_token') ? 'Present' : 'Not present');
      
      const response = await appointmentAPI.getAppointments();
      console.log('Appointments response:', response);
      // Handle paginated response
      const appointmentsData = response.data.results || response.data;
      console.log('Processed appointments data:', appointmentsData);
      console.log('Number of appointments:', appointmentsData.length);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Don't use mock data, show empty state instead
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...');
      const response = await doctorAPI.getDoctors();
      // Handle paginated response
      const doctorsData = response.data.results || response.data;
      console.log('Doctors data:', doctorsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', error.response?.data);
      // Mock data for demo
      setDoctors([
        { id: 1, user: { first_name: 'John', last_name: 'Smith' }, specialization: 'cardiology' },
        { id: 2, user: { first_name: 'Sarah', last_name: 'Johnson' }, specialization: 'neurology' },
        { id: 3, user: { first_name: 'Michael', last_name: 'Brown' }, specialization: 'orthopedics' },
      ]);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ doctor: '', appointment_date: '', reason: '' });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Format the appointment data properly
      const appointmentData = {
        doctor: parseInt(formData.doctor),
        appointment_date: formData.appointment_date + 'T10:00:00Z', // Add time component
        reason: formData.reason,
      };
      
      console.log('Submitting appointment data:', appointmentData);
      await appointmentAPI.createAppointment(appointmentData);
      await fetchAppointments();
      handleClose();
    } catch (error) {
      console.error('Appointment creation error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || error.response?.data?.detail || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'info';
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
        return <CheckCircle />;
      case 'scheduled':
        return <Schedule />;
      case 'pending':
        return <Pending />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <CalendarToday />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your appointments and schedule new ones.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<CalendarToday />}>
            Calendar View
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Book Appointment
          </Button>
        </Box>
      </Box>

      {/* Appointments Grid */}
      <Grid container spacing={3}>
        {appointments.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No appointments found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role === 'patient' 
                    ? 'You don\'t have any appointments scheduled yet.' 
                    : 'No appointments are currently scheduled.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          appointments.map((appointment) => (
          <Grid item xs={12} md={6} lg={4} key={appointment.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'primary.light', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {appointment.patient_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.doctor_name}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {formatDate(appointment.appointment_date)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {formatTime(appointment.appointment_time)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MedicalServices sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {appointment.reason}
                  </Typography>
                </Box>

                <Chip
                  icon={getStatusIcon(appointment.status)}
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  <IconButton size="small" color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </Box>
                <Button size="small" variant="outlined">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))
        )}
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={handleOpen}
      >
        <AddIcon />
      </Fab>

      {/* Appointment Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
            Book New Appointment
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Doctor</InputLabel>
              <Select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                label="Doctor"
                required
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.user?.first_name} {doctor.user?.last_name} - {doctor.specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              name="appointment_date"
              label="Appointment Date"
              type="date"
              value={formData.appointment_date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              name="reason"
              label="Reason for Visit"
              multiline
              rows={3}
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please describe the reason for your appointment..."
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Appointments;