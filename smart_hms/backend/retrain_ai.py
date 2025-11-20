import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital.settings')
django.setup()

from hospital_app.ai_model.symptom_checker import SymptomCheckerAI
from django.conf import settings

def retrain_model():
    print("Starting AI model retraining...")
    
    # Paths
    model_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_model.pkl')
    data_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_data.csv')
    
    # Delete existing model and data to force regeneration
    if os.path.exists(model_path):
        os.remove(model_path)
        print(f"Deleted existing model: {model_path}")
        
    if os.path.exists(data_path):
        os.remove(data_path)
        print(f"Deleted existing data: {data_path}")
    
    # Initialize AI (triggers training)
    ai = SymptomCheckerAI()
    
    print("Model retraining completed successfully!")
    print(f"New model saved to: {model_path}")
    print(f"New data saved to: {data_path}")

if __name__ == '__main__':
    retrain_model()
