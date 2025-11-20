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
        self.keyword_conditions = {}  # Initialize keyword conditions
        self.model_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_model.pkl')
        self.data_path = os.path.join(settings.BASE_DIR, 'hospital_app', 'ai_model', 'symptom_data.csv')
        
        # Always initialize keyword matching (used as fallback/primary method)
        self._create_fallback_model()
        
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
                'fever cough sore throat fatigue',
                'high fever cough body aches',
                'fever cough fatigue weakness',
                
                # Common Cold (10 examples)
                'runny nose sneezing sore throat congestion',
                'sneezing runny nose mild fever',
                'sore throat runny nose cough',
                'congestion sneezing cough mild fatigue',
                'runny nose sore throat sneezing',
                'stuffy nose sore throat cough',
                'sneezing congestion runny nose',
                'mild cough runny nose sore throat',
                'sore throat sneezing congestion',
                'runny nose cough mild fever',
                'cough sneezing runny nose',
                'mild fever cough sore throat',

                # COVID-19 (10 examples)
                'fever dry cough loss of taste smell',
                'fever cough fatigue loss of smell',
                'loss of taste loss of smell fever',
                'fever dry cough shortness of breath',
                'cough fever fatigue body aches',
                'loss of taste smell fever cough',
                'fever cough difficulty breathing',
                'dry cough fever fatigue loss of taste',
                'fever cough sore throat loss of smell',
                'fever muscle aches loss of taste',

                # Allergies (8 examples)
                'sneezing itchy eyes runny nose',
                'itchy eyes sneezing congestion',
                'watery eyes sneezing runny nose',
                'sneezing itchy nose watery eyes',
                'itchy eyes runny nose congestion',
                'sneezing watery eyes itchy throat',
                'runny nose itchy eyes sneezing',
                'congestion sneezing watery eyes',

                # Sinusitis (8 examples)
                'facial pain congestion headache runny nose',
                'sinus pressure headache congestion',
                'facial pain nasal congestion fever',
                'headache sinus pressure runny nose',
                'congestion facial pain thick mucus',
                'sinus pain headache congestion',
                'facial pressure congestion fever',
                'headache sinus pain runny nose',

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
                'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu', 'flu',
                # Common Cold
                'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold', 'common_cold',
                # COVID-19
                'covid_19', 'covid_19', 'covid_19', 'covid_19', 'covid_19', 'covid_19', 'covid_19', 'covid_19', 'covid_19', 'covid_19',
                # Allergies
                'allergies', 'allergies', 'allergies', 'allergies', 'allergies', 'allergies', 'allergies', 'allergies',
                # Sinusitis
                'sinusitis', 'sinusitis', 'sinusitis', 'sinusitis', 'sinusitis', 'sinusitis', 'sinusitis', 'sinusitis',
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
            import os
            try:
                fd = os.open('debug_trace.txt', os.O_WRONLY | os.O_CREAT | os.O_TRUNC)
                os.write(fd, b"Starting _train_model\n")
            except:
                fd = None

            # Load or create data
            if os.path.exists(self.data_path):
                if fd: os.write(fd, b"Loading existing data\n")
                df = pd.read_csv(self.data_path)
                logger.info(f"Loaded existing data with {len(df)} examples")
            else:
                if fd: os.write(fd, b"Creating improved data\n")
                df = self._create_improved_data()
            
            # Prepare data
            X = df['symptoms']
            y = df['condition']
            
            # Get unique conditions
            self.conditions = sorted(y.unique().tolist())
            if fd: os.write(fd, f"Conditions: {self.conditions}\n".encode())
            logger.info(f"Training model for {len(self.conditions)} conditions: {self.conditions}")
            
            # Split data
            if fd: os.write(fd, b"Splitting data\n")
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Create vectorizer with better parameters
            if fd: os.write(fd, b"Vectorizing\n")
            self.vectorizer = TfidfVectorizer(
                max_features=2000,
                stop_words='english',
                ngram_range=(1, 2),  # Use unigrams and bigrams
                min_df=1,
                max_df=0.95
            )
            self.model = MultinomialNB(alpha=1.0)  # Add smoothing
            
            # Train model
            if fd: os.write(fd, b"Fitting model\n")
            X_train_vectorized = self.vectorizer.fit_transform(X_train)
            self.model.fit(X_train_vectorized, y_train)
            
            # Evaluate
            if fd: os.write(fd, b"Evaluating\n")
            X_test_vectorized = self.vectorizer.transform(X_test)
            accuracy = self.model.score(X_test_vectorized, y_test)
            logger.info(f"Model trained with accuracy: {accuracy:.2%}")
            
            # Save model
            if fd: os.write(fd, b"Saving model\n")
            model_data = {
                'model': self.model,
                'vectorizer': self.vectorizer,
                'conditions': self.conditions
            }
            
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            with open(self.model_path, 'wb') as f:
                pickle.dump(model_data, f)
            logger.info(f"Model saved to {self.model_path}")
            
            if fd: 
                os.write(fd, b"Finished _train_model success\n")
                os.close(fd)
                
        except Exception as e:
            logger.error(f"Error training model: {e}")
            try:
                import os
                fd_err = os.open('debug_trace.txt', os.O_WRONLY | os.O_APPEND)
                os.write(fd_err, f"Error: {e}\n".encode())
                os.close(fd_err)
            except:
                pass
            # Fallback to improved keyword matching
            self._create_fallback_model()
    
    def _create_fallback_model(self):
        """Create an improved fallback model based on keyword matching"""
        self.conditions = [
            'flu', 'common_cold', 'covid_19', 'allergies', 'sinusitis',
            'pneumonia', 'gastroenteritis', 'arthritis', 'dermatitis',
            'heart_attack', 'migraine', 'asthma', 'strep_throat', 'diabetes',
            'food_poisoning', 'back_problems', 'hypertension', 'depression', 'insomnia', 'ibs'
        ]
        
        # Improved keyword-based conditions with better matching
        self.keyword_conditions = {
            'flu': {
                'keywords': ['fever', 'headache', 'fatigue', 'body aches', 'chills', 'muscle aches', 'cough', 'sore throat'],
                'required': ['fever'],  # Fever is required for flu
                'weight': 1.0
            },
            'common_cold': {
                'keywords': ['runny nose', 'sneezing', 'sore throat', 'congestion', 'cough', 'mild fever'],
                'required': ['runny nose', 'sneezing'],
                'weight': 1.0
            },
            'covid_19': {
                'keywords': ['fever', 'dry cough', 'loss of taste', 'loss of smell', 'fatigue', 'shortness of breath'],
                'required': ['fever', 'cough'],
                'weight': 1.05  # Slightly reduced weight to prevent over-prediction
            },
            'allergies': {
                'keywords': ['sneezing', 'itchy eyes', 'runny nose', 'watery eyes', 'congestion', 'itchy nose'],
                'required': ['sneezing', 'itchy eyes'],
                'weight': 1.0
            },
            'sinusitis': {
                'keywords': ['facial pain', 'sinus pressure', 'headache', 'congestion', 'runny nose', 'thick mucus'],
                'required': ['facial pain', 'congestion'],
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
        
        # Always use keyword matching first (more reliable with small dataset)
        # Then use ML model if available and confidence is high
        keyword_result = self._predict_keyword_matching(symptoms_lower)
        
        try:
            if self.model and self.vectorizer:
                # Get ML model prediction
                symptoms_vectorized = self.vectorizer.transform([symptoms_lower])
                probabilities = self.model.predict_proba(symptoms_vectorized)[0]
                
                class_indices = np.argsort(probabilities)[::-1]
                top_3_indices = class_indices[:3]
                ml_conditions = [self.conditions[i] for i in top_3_indices]
                ml_confidence = {self.conditions[i]: float(probabilities[i]) for i in top_3_indices}
                
                # Use ML model if top prediction has high confidence (>0.3)
                # Otherwise prefer keyword matching
                top_ml_confidence = ml_confidence.get(ml_conditions[0], 0) if ml_conditions else 0
                top_keyword_confidence = keyword_result['confidence'].get(keyword_result['conditions'][0], 0) if keyword_result['conditions'] else 0
                
                # Require ML confidence to be at least 10% higher than keyword confidence to override
                if top_ml_confidence > 0.3 and top_ml_confidence > (top_keyword_confidence + 0.1):
                    # Use ML model result
                    predicted_conditions = ml_conditions
                    confidence_scores = ml_confidence
                    logger.info(f"Using ML model: {predicted_conditions[0]} ({top_ml_confidence:.2%})")
                else:
                    # Use keyword matching (more reliable)
                    predicted_conditions = keyword_result['conditions']
                    confidence_scores = keyword_result['confidence']
                    logger.info(f"Using keyword matching: {predicted_conditions[0]} ({top_keyword_confidence:.2%})")
            else:
                # Use keyword matching
                predicted_conditions = keyword_result['conditions']
                confidence_scores = keyword_result['confidence']
                logger.info(f"Using keyword matching (no model): {predicted_conditions[0] if predicted_conditions else 'none'}")
            
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
            # Use keyword matching on error
            return keyword_result
    
    def _predict_keyword_matching(self, symptoms_lower):
        """Improved keyword matching prediction"""
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
                # Higher score for more matches
                base_score = matches / len(keywords)
                # Bonus for matching all keywords
                if matches == len(keywords):
                    base_score = 1.0
                score = base_score * weight
                scores[condition] = score
        
        # Sort by score and get top 3
        sorted_conditions = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
        predicted_conditions = [condition for condition, _ in sorted_conditions]
        confidence_scores = {condition: score for condition, score in sorted_conditions}
        
        # Normalize confidence scores to 0-1 range
        if confidence_scores:
            max_score = max(confidence_scores.values())
            if max_score > 0:
                # Normalize to 0.3-0.95 range for better UX
                confidence_scores = {k: 0.3 + (v / max_score) * 0.65 
                                   for k, v in confidence_scores.items()}
            else:
                confidence_scores = {k: 0.5 for k in confidence_scores.keys()}
        
        if not predicted_conditions:
            predicted_conditions = ['general_consultation']
            confidence_scores = {'general_consultation': 0.3}
        
        return {
            'conditions': predicted_conditions,
            'confidence': confidence_scores
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

