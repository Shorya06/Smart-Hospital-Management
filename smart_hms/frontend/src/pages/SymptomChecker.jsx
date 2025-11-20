import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  MedicalServices,
  Psychology,
  TrendingUp,
  Warning,
  CheckCircle,
  AutoFixHigh,
  Science,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { aiAPI } from '@/services/api';

// Add error boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SymptomChecker Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box sx={{ py: 4 }}>
            <Alert severity="error">
              <Typography variant="h6">Something went wrong with the Symptom Checker</Typography>
              <Typography variant="body2">
                Error: {this.state.error?.message || 'Unknown error'}
              </Typography>
            </Alert>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

const SymptomChecker = () => {
  console.log('SymptomChecker component rendering...');
  const { user } = useAuth();
  const theme = useTheme();
  const [symptoms, setSymptoms] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ['Describe Symptoms', 'AI Analysis', 'Results & Recommendations'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('SymptomChecker handleSubmit called');

    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setError('');
    setLoading(true);
    setResults(null);
    setCurrentStep(1);

    try {
      console.log('Calling aiAPI.analyzeSymptoms with:', symptoms);
      const response = await aiAPI.analyzeSymptoms(symptoms);
      console.log('API response received:', response);
      setResults(response.data);
      setCurrentStep(2);
    } catch (error) {
      console.error('Symptom checker error:', error);
      console.error('Error details:', error.response);
      setError(error.response?.data?.error || error.message || 'Failed to analyze symptoms');
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.7) return 'success';
    if (confidence > 0.4) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence > 0.7) return 'High';
    if (confidence > 0.4) return 'Medium';
    return 'Low';
  };

  const resetForm = () => {
    setSymptoms('');
    setResults(null);
    setError('');
    setCurrentStep(0);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }} className="animate-fade-in">
          <Avatar
            sx={{
              backgroundColor: 'primary.main',
              width: 90,
              height: 90,
              mx: 'auto',
              mb: 3,
              boxShadow: '0 10px 30px rgba(42, 157, 143, 0.3)',
            }}
          >
            <Psychology sx={{ fontSize: 48, color: 'white' }} />
          </Avatar>
          <Typography variant="h2" sx={{ mb: 2 }} className="text-gradient">
            AI Symptom Checker
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
            Describe your symptoms and get AI-powered preliminary analysis and recommendations.
            This tool is for informational purposes only and should not replace professional medical advice.
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Paper
          className="glass-card"
          sx={{
            p: 4,
            mb: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 4,
          }}
        >
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Grid container spacing={4}>
          {/* Input Form */}
          <Grid item xs={12} md={6}>
            <Card className="glass-card card-hover" sx={{ height: '100%', background: 'rgba(255, 255, 255, 0.9)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: 'primary.light',
                    color: 'white',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(72, 202, 228, 0.3)'
                  }}>
                    <MedicalServices />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Describe Your Symptoms
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    variant="outlined"
                    label="Symptoms Description"
                    placeholder="e.g., fever, sore throat, shortness of breath"
                    value={symptoms}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setSymptoms(value);
                        setError('');
                      }
                    }}
                    error={symptoms.length > 0 && symptoms.length < 3}
                    helperText={
                      symptoms.length > 0 && symptoms.length < 3
                        ? 'Please provide at least 3 characters'
                        : `${symptoms.length}/500 characters`
                    }
                    inputProps={{
                      'aria-label': 'Symptoms description input',
                      maxLength: 500,
                    }}
                    sx={{ mb: 4 }}
                    disabled={loading}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || !symptoms.trim() || symptoms.trim().length < 3}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHigh />}
                      sx={{ flexGrow: 1 }}
                      aria-label="Analyze symptoms button"
                    >
                      {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                  </Box>
                </form>

                {loading && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                      AI is analyzing your symptoms...
                    </Typography>
                    <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Results */}
          <Grid item xs={12} md={6}>
            {results ? (
              <Card className="glass-card animate-fade-in" sx={{ height: '100%', background: 'rgba(255, 255, 255, 0.95)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: 'success.main',
                      color: 'white',
                      mr: 2,
                      boxShadow: '0 4px 12px rgba(42, 157, 143, 0.3)'
                    }}>
                      <CheckCircle />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Analysis Results
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 4 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Predicted Condition
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      {results.predicted_disease}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Confidence Level
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: getConfidenceColor(results.confidence) + '.main' }}>
                        {Math.round(results.confidence * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(results.confidence * 100, 100)}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: 'grey.100',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                        },
                      }}
                      color={getConfidenceColor(results.confidence)}
                    />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Chip
                        label={getConfidenceLabel(results.confidence)}
                        color={getConfidenceColor(results.confidence)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    {results.confidence < 0.4 && (
                      <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        <Typography variant="body2">
                          Low confidence prediction. Please consult a healthcare professional for accurate diagnosis.
                        </Typography>
                      </Alert>
                    )}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Recommendations
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {results.recommendations?.map((recommendation, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2
                          }}
                        >
                          <TrendingUp sx={{ fontSize: 20, color: 'primary.main', mt: 0.5 }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {recommendation}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Box>

                  <Alert severity="info" icon={<Warning />} sx={{ mt: 3, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> This is an AI-powered preliminary analysis.
                      Please consult with a healthcare professional for proper diagnosis and treatment.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        mx: 'auto',
                        mb: 3
                      }}
                    >
                      <Science sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                      Ready to Analyze
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
                      Enter your symptoms in the form to get instant AI-powered insights about your health condition.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Additional Information */}
        <Grid container spacing={3} sx={{ mt: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ backgroundColor: 'primary.light', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <MedicalServices />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                1. Describe Symptoms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Provide detailed information about your symptoms, including duration and severity.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ backgroundColor: 'secondary.light', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <AutoFixHigh />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                2. AI Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our AI analyzes your symptoms using advanced machine learning algorithms.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ backgroundColor: 'success.light', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                3. Get Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receive preliminary analysis and recommendations for next steps.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

const SymptomCheckerWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <SymptomChecker />
    </ErrorBoundary>
  );
};

export default SymptomCheckerWithErrorBoundary;