"""Comprehensive tests for symptom checker accuracy"""
from django.test import TestCase
from unittest.mock import patch, MagicMock
from hospital_app.ai_model.symptom_checker import SymptomCheckerAI
import os


class SymptomCheckerAccuracyTest(TestCase):
    """Test symptom checker prediction accuracy"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Remove existing model to force retraining with improved data
        model_path = os.path.join(os.path.dirname(__file__), 'ai_model', 'symptom_model.pkl')
        if os.path.exists(model_path):
            os.remove(model_path)
        
        self.ai = SymptomCheckerAI()
    
    def test_flu_prediction(self):
        """Test that fever + headache predicts flu"""
        result = self.ai.predict('fever headache fatigue')
        self.assertEqual(result['conditions'][0], 'flu')
        self.assertGreater(result['confidence'].get('flu', 0), 0.5)
    
    def test_pneumonia_prediction(self):
        """Test that cough + chest pain predicts pneumonia"""
        result = self.ai.predict('cough chest pain shortness of breath')
        self.assertEqual(result['conditions'][0], 'pneumonia')
        self.assertGreater(result['confidence'].get('pneumonia', 0), 0.5)
    
    def test_gastroenteritis_prediction(self):
        """Test that nausea + vomiting predicts gastroenteritis"""
        result = self.ai.predict('nausea vomiting diarrhea')
        self.assertEqual(result['conditions'][0], 'gastroenteritis')
        self.assertGreater(result['confidence'].get('gastroenteritis', 0), 0.5)
    
    def test_heart_attack_prediction(self):
        """Test that chest pain + shortness of breath + sweating predicts heart attack"""
        result = self.ai.predict('chest pain shortness of breath sweating')
        self.assertEqual(result['conditions'][0], 'heart_attack')
        self.assertGreater(result['confidence'].get('heart_attack', 0), 0.5)
    
    def test_heart_attack_not_for_fever(self):
        """Test that fever alone does NOT predict heart attack"""
        result = self.ai.predict('fever headache')
        self.assertNotEqual(result['conditions'][0], 'heart_attack')
    
    def test_arthritis_prediction(self):
        """Test that joint pain predicts arthritis"""
        result = self.ai.predict('joint pain swelling stiffness')
        self.assertEqual(result['conditions'][0], 'arthritis')
    
    def test_dermatitis_prediction(self):
        """Test that rash predicts dermatitis"""
        result = self.ai.predict('rash itching redness')
        self.assertEqual(result['conditions'][0], 'dermatitis')
    
    def test_strep_throat_prediction(self):
        """Test that sore throat + fever predicts strep throat"""
        result = self.ai.predict('sore throat fever swollen glands')
        self.assertEqual(result['conditions'][0], 'strep_throat')
    
    def test_empty_symptoms(self):
        """Test that empty symptoms returns general consultation"""
        result = self.ai.predict('')
        self.assertEqual(result['conditions'][0], 'general_consultation')
        self.assertEqual(result['confidence'].get('general_consultation', 0), 0.0)
    
    def test_short_symptoms(self):
        """Test that very short symptoms are handled"""
        result = self.ai.predict('ab')
        # Should return general consultation or handle gracefully
        self.assertIsNotNone(result['conditions'])
        self.assertGreater(len(result['conditions']), 0)
    
    def test_multiple_conditions(self):
        """Test that top 3 conditions are returned"""
        result = self.ai.predict('fever headache fatigue')
        self.assertLessEqual(len(result['conditions']), 3)
        self.assertGreaterEqual(len(result['conditions']), 1)
    
    def test_confidence_scores(self):
        """Test that confidence scores are in valid range"""
        result = self.ai.predict('fever headache fatigue')
        for condition, confidence in result['confidence'].items():
            self.assertGreaterEqual(confidence, 0.0)
            self.assertLessEqual(confidence, 1.0)
    
    def test_recommendations_generated(self):
        """Test that recommendations are generated"""
        result = self.ai.predict('fever headache fatigue')
        self.assertIsNotNone(result['recommendations'])
        self.assertGreater(len(result['recommendations']), 0)
    
    def test_heart_attack_urgent_recommendation(self):
        """Test that heart attack gets urgent recommendation"""
        result = self.ai.predict('chest pain shortness of breath sweating')
        self.assertIn('URGENT', result['recommendations'])
        self.assertIn('emergency', result['recommendations'].lower())
    
    def test_low_confidence_warning(self):
        """Test that low confidence predictions have appropriate recommendations"""
        result = self.ai.predict('unusual symptoms xyz')
        # Should still return something but with lower confidence
        self.assertIsNotNone(result['conditions'])
        if result['confidence']:
            top_confidence = max(result['confidence'].values())
            if top_confidence < 0.4:
                self.assertIn('consult', result['recommendations'].lower())

