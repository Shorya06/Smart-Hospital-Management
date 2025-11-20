import os
import django
import sys
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
# sys.path.append(os.path.join(os.path.dirname(__file__), 'smart_hms', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital.settings')
django.setup()

from hospital_app.models import User, Doctor, Patient, Appointment
from rest_framework.test import APIRequestFactory, force_authenticate
from hospital_app.views import AppointmentViewSet

def verify_doctor_actions():
    print("Setting up test data...")
    
    # Create unique users to avoid conflicts
    timestamp = int(datetime.now().timestamp())
    
    # 1. Create Doctor
    doc_username = f'test_doc_{timestamp}'
    doctor_user = User.objects.create_user(username=doc_username, password='password123', role='doctor')
    doctor = Doctor.objects.create(user=doctor_user, specialization='General', license_number=f'DOC{timestamp}')
    print(f"Created Doctor: {doc_username}")

    # 2. Create Patient
    pat_username = f'test_pat_{timestamp}'
    patient_user = User.objects.create_user(username=pat_username, password='password123', role='patient')
    patient = Patient.objects.create(user=patient_user)
    print(f"Created Patient: {pat_username}")

    # 3. Patient books appointment
    print("\n--- Step 1: Patient books appointment ---")
    factory = APIRequestFactory()
    view = AppointmentViewSet.as_view({'post': 'create'})
    
    appointment_data = {
        'doctor': doctor.id,
        'appointment_date': (timezone.now() + timedelta(days=1)).isoformat(),
        'reason': 'Checkup'
    }
    
    request = factory.post('/api/appointments/', appointment_data, format='json')
    force_authenticate(request, user=patient_user)
    response = view(request)
    
    if response.status_code == 201:
        appointment_id = response.data['id']
        print(f"Appointment booked successfully. ID: {appointment_id}")
    else:
        print(f"Failed to book appointment: {response.data}")
        return

    # 4. Doctor marks as done
    print("\n--- Step 2: Doctor marks appointment as done ---")
    update_view = AppointmentViewSet.as_view({'patch': 'partial_update'})
    
    update_data = {'status': 'completed'}
    request = factory.patch(f'/api/appointments/{appointment_id}/', update_data, format='json')
    force_authenticate(request, user=doctor_user)
    response = update_view(request, pk=appointment_id)
    
    if response.status_code == 200:
        print(f"Update successful. Status: {response.data['status']}")
        if response.data['status'] == 'completed':
            print("VERIFICATION PASSED: Appointment marked as completed.")
        else:
            print("VERIFICATION FAILED: Status is not 'completed'.")
    else:
        print(f"Failed to update appointment: {response.data}")

    # Cleanup
    print("\nCleaning up...")
    Appointment.objects.filter(id=appointment_id).delete()
    doctor.delete()
    patient.delete()
    doctor_user.delete()
    patient_user.delete()

if __name__ == '__main__':
    try:
        verify_doctor_actions()
    except Exception as e:
        print(f"An error occurred: {e}")
