"""
Quick test script to verify AI symptom checker is working
Run this after starting the Django server
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital.settings')
django.setup()

from hospital_app.ai_model.symptom_checker import SymptomCheckerAI

print("=" * 50)
print("Testing AI Symptom Checker")
print("=" * 50)

# Test 1: Initialize AI
print("\n1. Initializing AI model...")
try:
    ai = SymptomCheckerAI()
    print(f"   [OK] Model initialized")
    print(f"   [OK] Model type: {'Trained Model' if ai.model else 'Fallback Keyword Matching'}")
    print(f"   [OK] Conditions available: {len(ai.conditions)}")
    if ai.conditions:
        print(f"   [OK] Sample conditions: {ai.conditions[:5]}")
except Exception as e:
    print(f"   [ERROR] Error: {e}")
    exit(1)

# Test 2: Make a prediction
print("\n2. Testing prediction...")
try:
    test_symptoms = "fever headache fatigue"
    result = ai.predict(test_symptoms)
    print(f"   [OK] Prediction successful")
    print(f"   [OK] Input: {test_symptoms}")
    print(f"   [OK] Predicted conditions: {result.get('conditions', [])}")
    print(f"   [OK] Confidence scores: {result.get('confidence', {})}")
    print(f"   [OK] Recommendations: {result.get('recommendations', '')[:100]}...")
except Exception as e:
    print(f"   [ERROR] Error: {e}")
    exit(1)

# Test 3: Check model files
print("\n3. Checking model files...")
import os
from django.conf import settings

model_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_model.pkl')
data_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_data.csv')

print(f"   Model file: {model_path}")
print(f"   Exists: {'[YES]' if os.path.exists(model_path) else '[NO]'}")
print(f"   Data file: {data_path}")
print(f"   Exists: {'[YES]' if os.path.exists(data_path) else '[NO]'}")

print("\n" + "=" * 50)
print("AI Symptom Checker Status: WORKING [OK]")
print("=" * 50)
print("\nTo test via API:")
print("1. Start Django server: python manage.py runserver")
print("2. POST to: http://localhost:8000/api/ai/symptom-checker/")
print("3. Body: {\"symptoms\": \"fever headache\"}")
print("4. Headers: Authorization: Bearer <token>")

