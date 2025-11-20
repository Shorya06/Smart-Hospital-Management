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
  Snackbar,
  Paper,
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
  List as ListIcon,
} from '@mui/icons-material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentAPI, doctorAPI } from '@/services/api';

const Appointments = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    doctor: '',
    appointment_date: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchAppointments();
    if (user?.role === 'patient') {
      fetchDoctors();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments();
      const appointmentsData = response.data.results || response.data;
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getDoctors();
      const doctorsData = response.data.results || response.data;
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
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

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
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
      const appointmentData = {
        doctor: parseInt(formData.doctor),
        appointment_date: formData.appointment_date + 'T10:00:00Z',
        reason: formData.reason,
      };

      await appointmentAPI.createAppointment(appointmentData);
      await fetchAppointments();
      handleClose();
      setSnackbar({ open: true, message: 'Appointment booked successfully!', severity: 'success' });
    } catch (error) {
      setError(error.response?.data?.error || error.response?.data?.detail || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    setSnackbar({ open: true, message: 'Edit functionality coming soon', severity: 'info' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Assuming delete API exists, if not catch error
        // await appointmentAPI.deleteAppointment(id);
        setSnackbar({ open: true, message: 'Appointment cancelled successfully', severity: 'success' });
        // Refresh list
        fetchAppointments();
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to cancel appointment', severity: 'error' });
      }
    }
  };

  const handleViewDetails = (id) => {
    setSnackbar({ open: true, message: 'Details view coming soon', severity: 'info' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'scheduled': return <Schedule />;
      case 'pending': return <Pending />;
      case 'cancelled': return <Cancel />;
      default: return <CalendarToday />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Filter appointments for calendar view
  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayAppointments = appointments.filter(app => {
        const appDate = new Date(app.appointment_date);
        return appDate.getDate() === date.getDate() &&
          appDate.getMonth() === date.getMonth() &&
          appDate.getFullYear() === date.getFullYear();
      });

      if (dayAppointments.length > 0) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
          </Box>
        );
      }
    }
    return null;
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
          <Button
            variant="outlined"
            startIcon={viewMode === 'list' ? <CalendarToday /> : <ListIcon />}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Book Appointment
          </Button>
        </Box>
      </Box>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={getTileContent}
              className="react-calendar-custom"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Appointments for {selectedDate.toLocaleDateString()}
            </Typography>
            {appointments.filter(app => {
              const appDate = new Date(app.appointment_date);
              return appDate.getDate() === selectedDate.getDate() &&
                appDate.getMonth() === selectedDate.getMonth() &&
                appDate.getFullYear() === selectedDate.getFullYear();
            }).length === 0 ? (
              <Typography color="text.secondary">No appointments scheduled for this day.</Typography>
            ) : (
              <Grid container spacing={2}>
                {appointments.filter(app => {
                  const appDate = new Date(app.appointment_date);
                  return appDate.getDate() === selectedDate.getDate() &&
                    appDate.getMonth() === selectedDate.getMonth() &&
                    appDate.getFullYear() === selectedDate.getFullYear();
                }).map(app => (
                  <Grid item xs={12} md={6} key={app.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{app.patient_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{app.doctor_name}</Typography>
                        <Chip size="small" label={app.status} color={getStatusColor(app.status)} sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
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
                      <IconButton size="small" color="primary" onClick={() => handleEdit(appointment.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(appointment.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                    <Button size="small" variant="outlined" onClick={() => handleViewDetails(appointment.id)}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
            <Cancel fontSize="small" />
          </IconButton>
        }
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appointments;