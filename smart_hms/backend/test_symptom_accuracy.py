"""Test script to verify symptom checker accuracy"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital.settings')
django.setup()

from hospital_app.ai_model.symptom_checker import SymptomCheckerAI

ai = SymptomCheckerAI()

test_cases = [
    ('fever headache fatigue', 'flu'),
    ('cough chest pain shortness of breath', 'pneumonia'),
    ('nausea vomiting diarrhea', 'gastroenteritis'),
    ('chest pain shortness of breath sweating', 'heart_attack'),
    ('joint pain swelling stiffness', 'arthritis'),
    ('rash itching redness', 'dermatitis'),
    ('sore throat fever swollen glands', 'strep_throat'),
]

print("=" * 60)
print("Testing Improved Symptom Checker Accuracy")
print("=" * 60)

passed = 0
failed = 0

for symptoms, expected in test_cases:
    result = ai.predict(symptoms)
    predicted = result['conditions'][0]
    confidence = result['confidence'].get(predicted, 0)
    
    status = "PASS" if predicted == expected else "FAIL"
    if status == "PASS":
        passed += 1
    else:
        failed += 1
    
    print(f"\nInput: {symptoms}")
    print(f"  Expected: {expected}")
    print(f"  Predicted: {predicted} ({confidence:.1%})")
    print(f"  Status: {status}")
    if predicted != expected:
        print(f"  Top 3: {result['conditions'][:3]}")

print("\n" + "=" * 60)
print(f"Results: {passed} passed, {failed} failed out of {len(test_cases)} tests")
print("=" * 60)

