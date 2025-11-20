# Testing Guide

This document lists all the commands available to test the Smart Hospital Management system.

## Frontend Tests (React/Vitest)

Navigate to the frontend directory first:
```bash
cd smart_hms/frontend
```

| Command | Description |
| :--- | :--- |
| `npm test` | Run all unit tests once (Vitest). |
| `npm run test:watch` | Run tests in watch mode (re-runs on file change). |
| `npm run test:ui` | Open the Vitest UI to visualize test results. |
| `npx vitest run src/__tests__/Appointments.test.jsx` | Run tests for a specific file (e.g., Appointments). |
| `npm run coverage` | Run tests and generate a code coverage report. |

## Backend Tests (Django/Python)

Navigate to the backend directory first:
```bash
cd smart_hms/backend
```

### Standard Django Tests
| Command | Description |
| :--- | :--- |
| `python manage.py test` | Run all Django unit tests. |
| `python manage.py test hospital_app` | Run tests for the main app only. |
| `python manage.py test hospital_app.tests_ai_new_conditions` | Run specific AI condition tests. |

### AI & Verification Scripts
These scripts are standalone and verify specific logic or reproduce issues.

| Command | Description |
| :--- | :--- |
| `python verify_doctor_actions.py` | **Full Flow Verification**: Tests Patient booking -> Doctor marking as done. |
| `python reproduce_issue.py` | **AI Debugging**: Checks the "fever, cough" prediction logic. |
| `python retrain_ai.py` | **AI Training**: Retrains the symptom checker model with current data. |
| `python test_symptom_accuracy.py` | **AI Accuracy**: Runs a batch of symptoms to verify model accuracy. |
| `python test_api.py` | **API Testing**: Tests general API endpoints (if configured). |

## Manual Verification Steps

1.  **Start Backend**: `python manage.py runserver`
2.  **Start Frontend**: `npm run dev`
3.  **Access App**: Open `http://localhost:5173`

### Doctor Flow Verification
1.  Login as Patient -> Book Appointment.
2.  Login as Doctor -> Dashboard -> Appointments.
3.  Verify "Mark as Done" button appears for pending appointments.
4.  Click "Mark as Done" -> Verify status changes to "Completed".
