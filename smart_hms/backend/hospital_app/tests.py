from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from .models import Patient, Doctor, Admin, Appointment, MedicalRecord, Prescription, SymptomChecker

User = get_user_model()


class UserModelTest(TestCase):
    """Test User model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='patient',
            first_name='Test',
            last_name='User'
        )
    
    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.role, 'patient')
        self.assertTrue(self.user.check_password('testpass123'))
    
    def test_user_get_full_name(self):
        self.assertEqual(self.user.get_full_name(), 'Test User')
    
    def test_user_str(self):
        self.assertIn('testuser', str(self.user))
        self.assertIn('patient', str(self.user))


class PatientModelTest(TestCase):
    """Test Patient model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='patient1',
            email='patient1@example.com',
            password='testpass123',
            role='patient'
        )
        self.patient = Patient.objects.create(
            user=self.user,
            blood_type='A+',
            allergies='Penicillin'
        )
    
    def test_patient_creation(self):
        self.assertEqual(self.patient.user, self.user)
        self.assertEqual(self.patient.blood_type, 'A+')
        self.assertEqual(self.patient.allergies, 'Penicillin')


class DoctorModelTest(TestCase):
    """Test Doctor model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='doctor1',
            email='doctor1@example.com',
            password='testpass123',
            role='doctor'
        )
        self.doctor = Doctor.objects.create(
            user=self.user,
            specialization='cardiology',
            license_number='DOC001',
            experience_years=10
        )
    
    def test_doctor_creation(self):
        self.assertEqual(self.doctor.user, self.user)
        self.assertEqual(self.doctor.specialization, 'cardiology')
        self.assertEqual(self.doctor.license_number, 'DOC001')


class AppointmentModelTest(TestCase):
    """Test Appointment model"""
    
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username='patient1',
            email='patient1@example.com',
            password='testpass123',
            role='patient'
        )
        self.patient = Patient.objects.create(user=self.patient_user)
        
        self.doctor_user = User.objects.create_user(
            username='doctor1',
            email='doctor1@example.com',
            password='testpass123',
            role='doctor'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            license_number='DOC001'
        )
        
        self.appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=timezone.now() + timedelta(days=1),
            reason='Checkup',
            status='scheduled'
        )
    
    def test_appointment_creation(self):
        self.assertEqual(self.appointment.patient, self.patient)
        self.assertEqual(self.appointment.doctor, self.doctor)
        self.assertEqual(self.appointment.status, 'scheduled')


class AuthenticationAPITest(TestCase):
    """Test authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='patient'
        )
        Patient.objects.create(user=self.user)
    
    def test_register_user(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'patient'
        }
        response = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
    
    def test_login_user(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
    
    def test_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = self.client.post('/api/auth/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DashboardAPITest(TestCase):
    """Test dashboard endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='patient'
        )
        Patient.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)
    
    def test_dashboard_access(self):
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
    
    def test_dashboard_unauthenticated(self):
        client = APIClient()
        response = client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AppointmentAPITest(TestCase):
    """Test appointment endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.patient_user = User.objects.create_user(
            username='patient1',
            email='patient1@example.com',
            password='testpass123',
            role='patient'
        )
        self.patient = Patient.objects.create(user=self.patient_user)
        
        self.doctor_user = User.objects.create_user(
            username='doctor1',
            email='doctor1@example.com',
            password='testpass123',
            role='doctor'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            license_number='DOC001'
        )
        
        self.client.force_authenticate(user=self.patient_user)
    
    def test_list_appointments(self):
        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=timezone.now() + timedelta(days=1),
            reason='Checkup'
        )
        response = self.client.get('/api/appointments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
    
    def test_create_appointment(self):
        data = {
            'doctor': self.doctor.id,
            'appointment_date': (timezone.now() + timedelta(days=2)).isoformat(),
            'reason': 'Annual checkup'
        }
        response = self.client.post('/api/appointments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_confirm_appointment(self):
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date=timezone.now() + timedelta(days=1),
            reason='Checkup'
        )
        response = self.client.post(f'/api/appointments/{appointment.id}/confirm/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, 'confirmed')


class AISymptomCheckerAPITest(TestCase):
    """Test AI symptom checker endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='patient'
        )
        Patient.objects.create(user=self.user)
        self.client.force_authenticate(user=self.user)
    
    def test_symptom_checker_analyze(self):
        data = {
            'symptoms': 'fever headache fatigue'
        }
        response = self.client.post('/api/ai/symptom-checker/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('predicted_disease', response.data)
        self.assertIn('confidence', response.data)
        self.assertIn('recommendations', response.data)
    
    def test_symptom_checker_no_symptoms(self):
        data = {
            'symptoms': ''
        }
        response = self.client.post('/api/ai/symptom-checker/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PatientViewSetTest(TestCase):
    """Test Patient viewset"""
    
    def setUp(self):
        self.client = APIClient()
        self.patient_user = User.objects.create_user(
            username='patient1',
            email='patient1@example.com',
            password='testpass123',
            role='patient'
        )
        self.patient = Patient.objects.create(user=self.patient_user)
        self.client.force_authenticate(user=self.patient_user)
    
    def test_list_patients(self):
        response = self.client.get('/api/patients/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Patient can only see their own profile
        self.assertEqual(len(response.data['results']), 1)


class DoctorViewSetTest(TestCase):
    """Test Doctor viewset"""
    
    def setUp(self):
        self.client = APIClient()
        self.patient_user = User.objects.create_user(
            username='patient1',
            email='patient1@example.com',
            password='testpass123',
            role='patient'
        )
        Patient.objects.create(user=self.patient_user)
        
        self.doctor_user = User.objects.create_user(
            username='doctor1',
            email='doctor1@example.com',
            password='testpass123',
            role='doctor'
        )
        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            license_number='DOC001',
            is_available=True
        )
        
        self.client.force_authenticate(user=self.patient_user)
    
    def test_list_doctors_as_patient(self):
        response = self.client.get('/api/doctors/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Patients can see available doctors
        self.assertGreaterEqual(len(response.data['results']), 1)
