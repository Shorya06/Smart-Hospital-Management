import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  MenuItem,
} from '@mui/material';
import {
  MedicalServices,
  Search,
  Person,
  Phone,
  Email,
  CalendarToday,
  Star,
  Edit,
  Delete,
  Add,
  Schedule,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { doctorAPI } from '@/services/api';

const Doctors = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    user: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
    },
    specialization: '',
    license_number: '',
    experience_years: '',
    consultation_fee: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDoctors();
      setDoctors(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setSnackbar({ open: true, message: 'Failed to fetch doctors', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      user: {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone_number: '',
      },
      specialization: '',
      license_number: '',
      experience_years: '',
      consultation_fee: '',
    });
    setError('');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await doctorAPI.createDoctor(formData);
      await fetchDoctors();
      handleClose();
      setSnackbar({ open: true, message: 'Doctor added successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error adding doctor:', error);
      setError(error.response?.data?.error || 'Failed to add doctor. Please check the inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    (doctor.user?.first_name + ' ' + doctor.user?.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailabilityColor = (isAvailable) => {
    return isAvailable ? 'success' : 'error';
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
            Doctors
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage doctor profiles and schedules.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Search />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
            Add Doctor
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Doctors
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {doctors.length}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: 'primary.light' }}>
                  <MedicalServices />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Other stats cards kept simple */}
      </Grid>

      {/* Doctors Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Doctor Profiles
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>License</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, backgroundColor: 'primary.light' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {doctor.user?.first_name} {doctor.user?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doctor.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={doctor.specialization} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {doctor.experience_years} years
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {doctor.license_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${doctor.consultation_fee}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doctor.is_available ? 'Available' : 'Unavailable'}
                        color={getAvailabilityColor(doctor.is_available)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Doctor Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Doctor</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="user.first_name"
                  value={formData.user.first_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="user.last_name"
                  value={formData.user.last_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="user.email"
                  type="email"
                  value={formData.user.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="user.password"
                  type="password"
                  value={formData.user.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="user.phone_number"
                  value={formData.user.phone_number}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Cardiology">Cardiology</MenuItem>
                  <MenuItem value="Neurology">Neurology</MenuItem>
                  <MenuItem value="Dermatology">Dermatology</MenuItem>
                  <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                  <MenuItem value="Orthopedics">Orthopedics</MenuItem>
                  <MenuItem value="General Medicine">General Medicine</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Experience (Years)"
                  name="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Consultation Fee ($)"
                  name="consultation_fee"
                  type="number"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Doctor'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Doctors;
