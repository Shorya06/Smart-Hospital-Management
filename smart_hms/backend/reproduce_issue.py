import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital.settings')
django.setup()

from hospital_app.ai_model.symptom_checker import SymptomCheckerAI

def test_prediction():
    ai = SymptomCheckerAI()
    symptoms = "fever, cough"
    print(f"Testing symptoms: '{symptoms}'")
    result = ai.predict(symptoms)
    with open('reproduction_result.txt', 'w') as f:
        f.write(f"Conditions: {result['conditions']}\n")
        f.write(f"Confidence: {result['confidence']}\n")
        f.write(f"Recommendations: {result['recommendations']}\n")
    print("Results written to reproduction_result.txt")

if __name__ == '__main__':
    test_prediction()
