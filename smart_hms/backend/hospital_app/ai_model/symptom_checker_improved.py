import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
import pickle
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class SymptomCheckerAI:
    """AI-powered symptom checker using scikit-learn with improved accuracy"""
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.conditions = []
        self.model_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_model.pkl')
        self.data_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_data.csv')
        
        # Initialize with improved data if no model exists
        self._initialize_model()
    
    def _create_improved_data(self):
        """Create improved symptom-disease data with more examples"""
        # Expanded dataset with more examples per condition
        improved_data = {
            'symptoms': [
                # Flu (10 examples)
                'fever headache fatigue body aches',
                'fever headache chills fatigue',
                'fever cough headache body pain',
                'fever headache sore throat fatigue',
                'fever headache muscle aches tiredness',
                'fever headache runny nose fatigue',
                'fever headache body aches weakness',
                'fever headache fatigue congestion',
                'fever headache chills body pain',
                'fever headache fatigue general malaise',
                
                # Pneumonia (8 examples)
                'cough chest pain shortness of breath fever',
                'cough chest pain difficulty breathing',
                'cough chest pain fever chills',
                'cough chest pain shortness of breath',
                'cough chest pain fever fatigue',
                'cough chest pain breathing problems',
                'cough chest pain fever weakness',
                'cough chest pain shortness breath',
                
                # Gastroenteritis (8 examples)
                'nausea vomiting diarrhea stomach pain',
                'nausea vomiting diarrhea abdominal pain',
                'nausea vomiting diarrhea cramps',
                'nausea vomiting stomach pain',
                'nausea vomiting diarrhea dehydration',
                'nausea vomiting diarrhea fever',
                'nausea vomiting stomach cramps',
                'nausea vomiting diarrhea bloating',
                
                # Arthritis (6 examples)
                'joint pain swelling stiffness',
                'joint pain swelling morning stiffness',
                'joint pain stiffness limited movement',
                'joint pain swelling inflammation',
                'joint pain stiffness pain',
                'joint pain swelling reduced mobility',
                
                # Dermatitis (6 examples)
                'rash itching redness skin',
                'rash itching redness inflammation',
                'rash itching redness dry skin',
                'rash itching redness irritation',
                'rash itching redness bumps',
                'rash itching redness scaly skin',
                
                # Heart Attack (6 examples - specific symptoms)
                'chest pain shortness of breath sweating nausea',
                'chest pain left arm pain shortness of breath',
                'severe chest pain sweating dizziness',
                'chest pain radiating to arm shortness of breath',
                'chest pain pressure sweating',
                'chest pain jaw pain shortness of breath',
                
                # Migraine (6 examples)
                'headache blurred vision nausea sensitivity',
                'severe headache nausea light sensitivity',
                'headache throbbing pain nausea',
                'headache visual disturbances nausea',
                'severe headache one side nausea',
                'headache sensitivity to light sound',
                
                # Asthma (6 examples)
                'difficulty breathing wheezing cough',
                'shortness of breath wheezing chest tightness',
                'wheezing cough difficulty breathing',
                'breathing problems wheezing cough',
                'shortness of breath wheezing',
                'wheezing chest tightness cough',
                
                # Strep Throat (5 examples)
                'sore throat fever swollen glands',
                'sore throat fever difficulty swallowing',
                'sore throat fever white patches',
                'sore throat fever headache',
                'sore throat fever swollen lymph nodes',
                
                # Diabetes (5 examples)
                'frequent urination thirst fatigue weight loss',
                'frequent urination excessive thirst fatigue',
                'frequent urination thirst blurred vision',
                'frequent urination thirst weight loss',
                'excessive thirst frequent urination fatigue',
                
                # Food Poisoning (5 examples)
                'stomach pain nausea vomiting diarrhea',
                'stomach pain nausea vomiting cramps',
                'nausea vomiting stomach pain diarrhea',
                'stomach pain vomiting diarrhea',
                'nausea vomiting diarrhea abdominal pain',
                
                # Back Problems (5 examples)
                'back pain stiffness limited movement',
                'back pain stiffness difficulty moving',
                'lower back pain stiffness',
                'back pain stiffness muscle spasms',
                'back pain stiffness radiating pain',
                
                # Hypertension (4 examples)
                'high blood pressure chest pain',
                'high blood pressure headache dizziness',
                'high blood pressure chest discomfort',
                'elevated blood pressure headache',
                
                # Depression (4 examples)
                'anxiety depression mood changes',
                'depression mood changes loss of interest',
                'depression anxiety fatigue',
                'depression mood changes sleep problems',
                
                # Insomnia (4 examples)
                'sleep problems fatigue irritability',
                'difficulty sleeping fatigue',
                'sleep problems fatigue mood changes',
                'insomnia fatigue difficulty concentrating',
                
                # IBS (4 examples)
                'abdominal pain bloating nausea',
                'abdominal pain bloating diarrhea',
                'abdominal pain bloating constipation',
                'abdominal pain bloating cramping',
            ],
            'condition': [
                # Flu
                'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu',
                # Pneumonia
                'pneumonia', 'pneumonia', 'pneumonia', 'pneumonia', 'pneumonia', 'pneumonia', 'pneumonia', 'pneumonia',
                # Gastroenteritis
                'gastroenteritis', 'gastroenteritis', 'gastroenteritis', 'gastroenteritis', 'gastroenteritis', 'gastroenteritis', 'gastroenteritis', 'gastroenteritis',
                # Arthritis
                'arthritis', 'arthritis', 'arthritis', 'arthritis', 'arthritis', 'arthritis',
                # Dermatitis
                'dermatitis', 'dermatitis', 'dermatitis', 'dermatitis', 'dermatitis', 'dermatitis',
                # Heart Attack
                'heart_attack', 'heart_attack', 'heart_attack', 'heart_attack', 'heart_attack', 'heart_attack',
                # Migraine
                'migraine', 'migraine', 'migraine', 'migraine', 'migraine', 'migraine',
                # Asthma
                'asthma', 'asthma', 'asthma', 'asthma', 'asthma', 'asthma',
                # Strep Throat
                'strep_throat', 'strep_throat', 'strep_throat', 'strep_throat', 'strep_throat',
                # Diabetes
                'diabetes', 'diabetes', 'diabetes', 'diabetes', 'diabetes',
                # Food Poisoning
                'food_poisoning', 'food_poisoning', 'food_poisoning', 'food_poisoning', 'food_poisoning',
                # Back Problems
                'back_problems', 'back_problems', 'back_problems', 'back_problems', 'back_problems',
                # Hypertension
                'hypertension', 'hypertension', 'hypertension', 'hypertension',
                # Depression
                'depression', 'depression', 'depression', 'depression',
                # Insomnia
                'insomnia', 'insomnia', 'insomnia', 'insomnia',
                # IBS
                'ibs', 'ibs', 'ibs', 'ibs',
            ]
        }
        
        df = pd.DataFrame(improved_data)
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
        df.to_csv(self.data_path, index=False)
        logger.info(f"Created improved symptom data with {len(df)} examples")
        return df
    
    def _initialize_model(self):
        """Initialize or load the symptom checker model"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.model = model_data['model']
                    self.vectorizer = model_data['vectorizer']
                    self.conditions = model_data['conditions']
                    logger.info(f"Loaded existing model with {len(self.conditions)} conditions")
            else:
                logger.info("No existing model found, training new model")
                self._train_model()
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self._train_model()
    
    def _train_model(self):
        """Train the symptom checker model with improved data"""
        try:
            # Load or create data
            if os.path.exists(self.data_path):
                df = pd.read_csv(self.data_path)
                logger.info(f"Loaded existing data with {len(df)} examples")
            else:
                df = self._create_improved_data()
            
            # Prepare data
            X = df['symptoms']
            y = df['condition']
            
            # Get unique conditions
            self.conditions = sorted(y.unique().tolist())
            logger.info(f"Training model for {len(self.conditions)} conditions: {self.conditions}")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Create vectorizer with better parameters
            self.vectorizer = TfidfVectorizer(
                max_features=2000,
                stop_words='english',
                ngram_range=(1, 2),  # Use unigrams and bigrams
                min_df=1,
                max_df=0.95
            )
            self.model = MultinomialNB(alpha=1.0)  # Add smoothing
            
            # Train model
            X_train_vectorized = self.vectorizer.fit_transform(X_train)
            self.model.fit(X_train_vectorized, y_train)
            
            # Evaluate
            X_test_vectorized = self.vectorizer.transform(X_test)
            accuracy = self.model.score(X_test_vectorized, y_test)
            logger.info(f"Model trained with accuracy: {accuracy:.2%}")
            
            # Save model
            model_data = {
                'model': self.model,
                'vectorizer': self.vectorizer,
                'conditions': self.conditions
            }
            
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            with open(self.model_path, 'wb') as f:
                pickle.dump(model_data, f)
            logger.info(f"Model saved to {self.model_path}")
                
        except Exception as e:
            logger.error(f"Error training model: {e}")
            # Fallback to improved keyword matching
            self._create_fallback_model()
    
    def _create_fallback_model(self):
        """Create an improved fallback model based on keyword matching"""
        self.conditions = [
            'flu', 'pneumonia', 'gastroenteritis', 'arthritis', 'dermatitis',
            'heart_attack', 'migraine', 'asthma', 'strep_throat', 'diabetes',
            'food_poisoning', 'back_problems', 'hypertension', 'depression', 'insomnia', 'ibs'
        ]
        
        # Improved keyword-based conditions with better matching
        self.keyword_conditions = {
            'flu': {
                'keywords': ['fever', 'headache', 'fatigue', 'body aches', 'chills', 'muscle aches', 'tiredness'],
                'required': ['fever'],  # Fever is required for flu
                'weight': 1.0
            },
            'pneumonia': {
                'keywords': ['cough', 'chest pain', 'shortness of breath', 'difficulty breathing', 'breathing problems'],
                'required': ['cough', 'chest pain'],
                'weight': 1.0
            },
            'gastroenteritis': {
                'keywords': ['nausea', 'vomiting', 'diarrhea', 'stomach pain', 'abdominal pain', 'cramps'],
                'required': ['nausea', 'vomiting'],
                'weight': 1.0
            },
            'arthritis': {
                'keywords': ['joint pain', 'swelling', 'stiffness', 'limited movement', 'inflammation'],
                'required': ['joint pain'],
                'weight': 1.0
            },
            'dermatitis': {
                'keywords': ['rash', 'itching', 'redness', 'skin', 'irritation', 'dry skin'],
                'required': ['rash'],
                'weight': 1.0
            },
            'heart_attack': {
                'keywords': ['chest pain', 'shortness of breath', 'sweating', 'left arm pain', 'jaw pain', 'pressure', 'radiating'],
                'required': ['chest pain', 'shortness of breath'],  # Both required
                'weight': 1.2  # Higher weight for serious condition
            },
            'migraine': {
                'keywords': ['headache', 'blurred vision', 'nausea', 'sensitivity', 'throbbing', 'visual disturbances'],
                'required': ['headache'],
                'weight': 1.0
            },
            'asthma': {
                'keywords': ['difficulty breathing', 'wheezing', 'cough', 'chest tightness', 'breathing problems'],
                'required': ['wheezing', 'difficulty breathing'],
                'weight': 1.0
            },
            'strep_throat': {
                'keywords': ['sore throat', 'fever', 'swollen glands', 'difficulty swallowing', 'white patches'],
                'required': ['sore throat', 'fever'],
                'weight': 1.0
            },
            'diabetes': {
                'keywords': ['frequent urination', 'thirst', 'fatigue', 'weight loss', 'excessive thirst', 'blurred vision'],
                'required': ['frequent urination', 'thirst'],
                'weight': 1.0
            },
            'food_poisoning': {
                'keywords': ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'cramps', 'abdominal pain'],
                'required': ['nausea', 'vomiting'],
                'weight': 1.0
            },
            'back_problems': {
                'keywords': ['back pain', 'stiffness', 'limited movement', 'difficulty moving', 'muscle spasms'],
                'required': ['back pain'],
                'weight': 1.0
            },
            'hypertension': {
                'keywords': ['high blood pressure', 'chest pain', 'headache', 'dizziness', 'elevated blood pressure'],
                'required': ['high blood pressure'],
                'weight': 1.0
            },
            'depression': {
                'keywords': ['anxiety', 'depression', 'mood changes', 'loss of interest', 'sleep problems'],
                'required': ['depression'],
                'weight': 1.0
            },
            'insomnia': {
                'keywords': ['sleep problems', 'fatigue', 'irritability', 'difficulty sleeping', 'difficulty concentrating'],
                'required': ['sleep problems'],
                'weight': 1.0
            },
            'ibs': {
                'keywords': ['abdominal pain', 'bloating', 'nausea', 'diarrhea', 'constipation', 'cramping'],
                'required': ['abdominal pain', 'bloating'],
                'weight': 1.0
            },
        }
    
    def predict(self, symptoms):
        """Predict conditions based on symptoms with improved accuracy"""
        if not symptoms or not symptoms.strip():
            return {
                'conditions': ['general_consultation'],
                'confidence': {'general_consultation': 0.0},
                'recommendations': 'Please provide symptom details for analysis.'
            }
        
        symptoms_lower = symptoms.lower().strip()
        
        try:
            if self.model and self.vectorizer:
                # Use trained model
                symptoms_vectorized = self.vectorizer.transform([symptoms_lower])
                probabilities = self.model.predict_proba(symptoms_vectorized)[0]
                
                # Get class indices sorted by probability
                class_indices = np.argsort(probabilities)[::-1]
                
                # Get top 3 predictions with confidence
                top_3_indices = class_indices[:3]
                predicted_conditions = [self.conditions[i] for i in top_3_indices]
                confidence_scores = {self.conditions[i]: float(probabilities[i]) for i in top_3_indices}
                
                # Log prediction for debugging
                logger.info(f"Model prediction for '{symptoms_lower[:50]}...': {predicted_conditions[0]} ({confidence_scores[predicted_conditions[0]]:.2%})")
                
            else:
                # Use improved fallback keyword matching
                scores = {}
                
                for condition, config in self.keyword_conditions.items():
                    keywords = config['keywords']
                    required = config.get('required', [])
                    weight = config.get('weight', 1.0)
                    
                    # Check if all required keywords are present
                    has_required = all(req in symptoms_lower for req in required)
                    
                    if not has_required:
                        continue  # Skip if required keywords missing
                    
                    # Count matching keywords
                    matches = sum(1 for keyword in keywords if keyword in symptoms_lower)
                    if matches > 0:
                        # Score = (matches / total keywords) * weight
                        score = (matches / len(keywords)) * weight
                        scores[condition] = score
                
                # Sort by score and get top 3
                sorted_conditions = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
                predicted_conditions = [condition for condition, _ in sorted_conditions]
                confidence_scores = {condition: score for condition, score in sorted_conditions}
                
                # Normalize confidence scores to 0-1 range for fallback
                if confidence_scores:
                    max_score = max(confidence_scores.values())
                    confidence_scores = {k: min(v / max_score, 0.95) if max_score > 0 else 0.5 
                                       for k, v in confidence_scores.items()}
                
                logger.info(f"Fallback prediction for '{symptoms_lower[:50]}...': {predicted_conditions[0] if predicted_conditions else 'none'}")
            
            # Ensure we have at least one prediction
            if not predicted_conditions:
                predicted_conditions = ['general_consultation']
                confidence_scores = {'general_consultation': 0.3}
            
            # Generate recommendations
            recommendations = self._generate_recommendations(predicted_conditions, confidence_scores)
            
            return {
                'conditions': predicted_conditions,
                'confidence': confidence_scores,
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}", exc_info=True)
            # Use fallback keyword matching on error
            return self._predict_fallback(symptoms_lower)
    
    def _predict_fallback(self, symptoms_lower):
        """Fallback prediction using keyword matching"""
        scores = {}
        
        for condition, config in self.keyword_conditions.items():
            keywords = config['keywords']
            required = config.get('required', [])
            weight = config.get('weight', 1.0)
            
            has_required = all(req in symptoms_lower for req in required)
            if not has_required:
                continue
            
            matches = sum(1 for keyword in keywords if keyword in symptoms_lower)
            if matches > 0:
                score = (matches / len(keywords)) * weight
                scores[condition] = score
        
        sorted_conditions = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
        predicted_conditions = [condition for condition, _ in sorted_conditions]
        confidence_scores = {condition: score for condition, score in sorted_conditions}
        
        if confidence_scores:
            max_score = max(confidence_scores.values())
            confidence_scores = {k: min(v / max_score, 0.95) if max_score > 0 else 0.5 
                               for k, v in confidence_scores.items()}
        
        if not predicted_conditions:
            predicted_conditions = ['general_consultation']
            confidence_scores = {'general_consultation': 0.3}
        
        recommendations = self._generate_recommendations(predicted_conditions, confidence_scores)
        
        return {
            'conditions': predicted_conditions,
            'confidence': confidence_scores,
            'recommendations': recommendations
        }
    
    def _generate_recommendations(self, conditions, confidence_scores):
        """Generate recommendations based on predicted conditions"""
        recommendations = []
        
        for condition in conditions:
            confidence = confidence_scores.get(condition, 0)
            condition_name = condition.replace('_', ' ').title()
            
            if condition == 'heart_attack':
                recommendations.append(f"URGENT: Possible {condition_name} (confidence: {confidence:.0%}). Seek immediate emergency medical attention. Do not delay.")
            elif confidence > 0.7:
                recommendations.append(f"High probability of {condition_name} (confidence: {confidence:.0%}). Please consult a doctor as soon as possible.")
            elif confidence > 0.4:
                recommendations.append(f"Moderate probability of {condition_name} (confidence: {confidence:.0%}). Consider consulting a doctor within 24-48 hours.")
            else:
                recommendations.append(f"Low probability of {condition_name} (confidence: {confidence:.0%}). Monitor symptoms and consult if they worsen or persist.")
        
        if not recommendations:
            recommendations.append("Please consult with a healthcare professional for proper diagnosis.")
        
        return ". ".join(recommendations)

