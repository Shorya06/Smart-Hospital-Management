"""Tests for AI symptom checker module - 100% coverage"""
import os
import pickle
import tempfile
import shutil
from unittest.mock import patch, MagicMock, mock_open
from django.test import TestCase, override_settings
from django.conf import settings
from .ai_model.symptom_checker import SymptomCheckerAI


class SymptomCheckerAITest(TestCase):
    """Test SymptomCheckerAI class - 100% coverage"""
    
    def setUp(self):
        # Create temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        self.original_base_dir = settings.BASE_DIR
        
    def tearDown(self):
        # Clean up temporary directory
        shutil.rmtree(self.test_dir, ignore_errors=True)
    
    @patch('hospital_app.ai_model.symptom_checker.os.path.exists')
    @patch('hospital_app.ai_model.symptom_checker.pickle.load')
    def test_init_with_existing_model(self, mock_pickle_load, mock_exists):
        """Test initialization with existing model file"""
        mock_exists.return_value = True
        mock_model_data = {
            'model': MagicMock(),
            'vectorizer': MagicMock(),
            'conditions': ['flu', 'cold']
        }
        mock_pickle_load.return_value = mock_model_data
        
        ai = SymptomCheckerAI()
        self.assertIsNotNone(ai.model)
        self.assertIsNotNone(ai.vectorizer)
        self.assertEqual(ai.conditions, ['flu', 'cold'])
    
    @patch('hospital_app.ai_model.symptom_checker.os.path.exists')
    @patch.object(SymptomCheckerAI, '_train_model')
    def test_init_without_model(self, mock_train, mock_exists):
        """Test initialization without model file"""
        mock_exists.return_value = False
        ai = SymptomCheckerAI()
        mock_train.assert_called_once()
    
    @patch('hospital_app.ai_model.symptom_checker.os.path.exists')
    @patch('hospital_app.ai_model.symptom_checker.pickle.load')
    @patch.object(SymptomCheckerAI, '_train_model')
    def test_init_with_load_error(self, mock_train, mock_pickle_load, mock_exists):
        """Test initialization when model loading fails"""
        mock_exists.return_value = True
        mock_pickle_load.side_effect = Exception('Load error')
        ai = SymptomCheckerAI()
        mock_train.assert_called_once()
    
    def test_create_dummy_data(self):
        """Test creating dummy data"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            ai.data_path = os.path.join(self.test_dir, 'test_data.csv')
            df = ai._create_dummy_data()
            self.assertIsNotNone(df)
            self.assertEqual(len(df), 20)
            self.assertTrue(os.path.exists(ai.data_path))
    
    @patch('hospital_app.ai_model.symptom_checker.os.path.exists')
    @patch('hospital_app.ai_model.symptom_checker.pd.read_csv')
    def test_train_model_with_existing_data(self, mock_read_csv, mock_exists):
        """Test training model with existing CSV data"""
        mock_exists.return_value = True
        mock_df = MagicMock()
        mock_symptoms = MagicMock()
        mock_symptoms.unique.return_value.tolist.return_value = ['flu', 'cold']
        mock_conditions = MagicMock()
        mock_df.__getitem__ = lambda self, key: mock_symptoms if key == 'symptoms' else mock_conditions
        mock_read_csv.return_value = mock_df
        
        with patch('hospital_app.ai_model.symptom_checker.train_test_split') as mock_split, \
             patch('hospital_app.ai_model.symptom_checker.TfidfVectorizer') as mock_vectorizer, \
             patch('hospital_app.ai_model.symptom_checker.MultinomialNB') as mock_nb, \
             patch('builtins.open', mock_open()), \
             patch('hospital_app.ai_model.symptom_checker.pickle.dump'):
            
            mock_split.return_value = (MagicMock(), MagicMock(), MagicMock(), MagicMock())
            mock_vec_instance = MagicMock()
            mock_vec_instance.fit_transform.return_value = MagicMock()
            mock_vectorizer.return_value = mock_vec_instance
            mock_model_instance = MagicMock()
            mock_nb.return_value = mock_model_instance
            
            with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
                ai = SymptomCheckerAI()
                ai.model_path = os.path.join(self.test_dir, 'model.pkl')
                ai.data_path = os.path.join(self.test_dir, 'data.csv')
                ai._train_model()
                self.assertIsNotNone(ai.model)
                self.assertIsNotNone(ai.vectorizer)
    
    @patch('hospital_app.ai_model.symptom_checker.os.path.exists')
    def test_train_model_without_data(self, mock_exists):
        """Test training model without existing CSV data"""
        mock_exists.return_value = False
        
        with patch.object(SymptomCheckerAI, '_create_dummy_data') as mock_create, \
             patch('hospital_app.ai_model.symptom_checker.train_test_split') as mock_split, \
             patch('hospital_app.ai_model.symptom_checker.TfidfVectorizer') as mock_vectorizer, \
             patch('hospital_app.ai_model.symptom_checker.MultinomialNB') as mock_nb, \
             patch('builtins.open', mock_open()), \
             patch('hospital_app.ai_model.symptom_checker.pickle.dump'):
            
            mock_df = MagicMock()
            mock_symptoms = MagicMock()
            mock_symptoms.unique.return_value.tolist.return_value = ['flu']
            mock_conditions = MagicMock()
            mock_df.__getitem__ = lambda self, key: mock_symptoms if key == 'symptoms' else mock_conditions
            mock_create.return_value = mock_df
            mock_split.return_value = (MagicMock(), MagicMock(), MagicMock(), MagicMock())
            mock_vec_instance = MagicMock()
            mock_vec_instance.fit_transform.return_value = MagicMock()
            mock_vectorizer.return_value = mock_vec_instance
            mock_model_instance = MagicMock()
            mock_nb.return_value = mock_model_instance
            
            with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
                ai = SymptomCheckerAI()
                ai.model_path = os.path.join(self.test_dir, 'model.pkl')
                ai.data_path = os.path.join(self.test_dir, 'data.csv')
                ai._train_model()
    
    @patch('hospital_app.ai_model.symptom_checker.os.path.exists')
    @patch('hospital_app.ai_model.symptom_checker.pd.read_csv')
    def test_train_model_with_exception(self, mock_read_csv, mock_exists):
        """Test training model when exception occurs"""
        mock_exists.return_value = True
        mock_read_csv.side_effect = Exception('CSV error')
        
        with patch.object(SymptomCheckerAI, '_create_fallback_model') as mock_fallback:
            with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
                ai = SymptomCheckerAI()
                ai.model_path = os.path.join(self.test_dir, 'model.pkl')
                ai.data_path = os.path.join(self.test_dir, 'data.csv')
                ai._train_model()
                mock_fallback.assert_called_once()
    
    def test_create_fallback_model(self):
        """Test creating fallback keyword-based model"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            ai._create_fallback_model()
            self.assertIsNotNone(ai.conditions)
            self.assertIsNotNone(ai.keyword_conditions)
            self.assertGreater(len(ai.conditions), 0)
    
    def test_predict_with_model(self):
        """Test prediction with trained model"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            ai.model = MagicMock()
            ai.vectorizer = MagicMock()
            ai.conditions = ['flu', 'cold', 'fever']
            
            mock_proba = [[0.7, 0.2, 0.1]]
            ai.model.predict_proba.return_value = mock_proba
            ai.vectorizer.transform.return_value = MagicMock()
            
            with patch.object(ai, '_generate_recommendations') as mock_rec:
                mock_rec.return_value = 'Test recommendations'
                result = ai.predict('fever headache')
                self.assertIn('conditions', result)
                self.assertIn('confidence', result)
                self.assertIn('recommendations', result)
    
    def test_predict_with_fallback(self):
        """Test prediction with fallback keyword matching"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            ai.model = None
            ai.vectorizer = None
            ai._create_fallback_model()
            
            with patch.object(ai, '_generate_recommendations') as mock_rec:
                mock_rec.return_value = 'Test recommendations'
                result = ai.predict('fever headache fatigue')
                self.assertIn('conditions', result)
                self.assertIn('confidence', result)
                self.assertIn('recommendations', result)
                self.assertGreater(len(result['conditions']), 0)
    
    def test_predict_with_exception(self):
        """Test prediction when exception occurs"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            ai.model = MagicMock()
            ai.vectorizer = MagicMock()
            ai.model.predict_proba.side_effect = Exception('Prediction error')
            
            result = ai.predict('fever')
            self.assertEqual(result['conditions'], ['general_consultation'])
            self.assertIn('general_consultation', result['confidence'])
    
    def test_generate_recommendations_high_confidence(self):
        """Test generating recommendations with high confidence"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            conditions = ['flu']
            confidence_scores = {'flu': 0.8}
            result = ai._generate_recommendations(conditions, confidence_scores)
            self.assertIn('High probability', result)
    
    def test_generate_recommendations_moderate_confidence(self):
        """Test generating recommendations with moderate confidence"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            conditions = ['flu']
            confidence_scores = {'flu': 0.5}
            result = ai._generate_recommendations(conditions, confidence_scores)
            self.assertIn('Moderate probability', result)
    
    def test_generate_recommendations_low_confidence(self):
        """Test generating recommendations with low confidence"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            conditions = ['flu']
            confidence_scores = {'flu': 0.3}
            result = ai._generate_recommendations(conditions, confidence_scores)
            self.assertIn('Low probability', result)
    
    def test_generate_recommendations_empty(self):
        """Test generating recommendations with empty conditions"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            conditions = []
            confidence_scores = {}
            result = ai._generate_recommendations(conditions, confidence_scores)
            self.assertIn('consult with a healthcare professional', result)
    
    def test_generate_recommendations_multiple_conditions(self):
        """Test generating recommendations with multiple conditions"""
        with patch.object(SymptomCheckerAI, '__init__', lambda x: None):
            ai = SymptomCheckerAI()
            conditions = ['flu', 'cold', 'fever']
            confidence_scores = {'flu': 0.8, 'cold': 0.5, 'fever': 0.3}
            result = ai._generate_recommendations(conditions, confidence_scores)
            self.assertIn('flu', result.lower())
            self.assertIn('cold', result.lower())

