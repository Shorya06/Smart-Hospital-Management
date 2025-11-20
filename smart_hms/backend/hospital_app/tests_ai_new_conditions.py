from django.test import TestCase
from .ai_model.symptom_checker import SymptomCheckerAI
import os
from django.conf import settings

class NewConditionsTest(TestCase):
    def setUp(self):
        # Ensure we are using the real model file
        self.ai = SymptomCheckerAI()
        
    def test_predict_common_cold(self):
        """Test prediction for Common Cold"""
        # Symptoms: runny nose, sneezing, sore throat
        result = self.ai.predict("runny nose sneezing sore throat")
        print(f"Prediction for Common Cold symptoms: {result}")
        self.assertIn("common_cold", result['conditions'])
        
    def test_predict_allergies(self):
        """Test prediction for Allergies"""
        # Symptoms: sneezing, itchy eyes, runny nose
        result = self.ai.predict("sneezing itchy eyes runny nose")
        print(f"Prediction for Allergies symptoms: {result}")
        self.assertIn("allergies", result['conditions'])
        
    def test_predict_covid19(self):
        """Test prediction for COVID-19"""
        # Symptoms: fever, dry cough, loss of taste
        result = self.ai.predict("fever dry cough loss of taste")
        print(f"Prediction for COVID-19 symptoms: {result}")
        self.assertIn("covid_19", result['conditions'])

    def test_predict_sinusitis(self):
        """Test prediction for Sinusitis"""
        # Symptoms: facial pain, sinus pressure, headache, congestion
        result = self.ai.predict("facial pain sinus pressure headache congestion")
        print(f"Prediction for Sinusitis symptoms: {result}")
        self.assertIn("sinusitis", result['conditions'])

    def test_predict_flu_expanded(self):
        """Test prediction for Flu with expanded data"""
        # Symptoms: fever, headache, body aches
        result = self.ai.predict("fever headache body aches")
        print(f"Prediction for Flu symptoms: {result}")
        self.assertIn("flu", result['conditions'])
