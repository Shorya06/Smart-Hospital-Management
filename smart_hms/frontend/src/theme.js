import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2A9D8F', // Teal
      light: '#48CAE4', // Light Cyan
      dark: '#264653', // Dark Blue-Green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E9C46A', // Sandy Yellow (warm accent)
      light: '#F4A261', // Light Orange
      dark: '#E76F51', // Burnt Sienna
      contrastText: '#264653',
    },
    background: {
      default: '#F0F4F8', // Soft Blue-Grey
      paper: '#ffffff',
    },
    text: {
      primary: '#264653', // Dark Blue-Green text
      secondary: '#5F6C7B', // Muted Blue-Grey
    },
    success: {
      main: '#2A9D8F',
    },
    warning: {
      main: '#E9C46A',
    },
    error: {
      main: '#E76F51',
    },
    info: {
      main: '#48CAE4',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: '#264653',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      color: '#264653',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2A9D8F',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: '#5F6C7B',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#5F6C7B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50, // Pill-shaped buttons
          padding: '10px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(42, 157, 143, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(42, 157, 143, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.9)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          color: '#264653',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: '#f8fafc',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#2A9D8F',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(42, 157, 143, 0.1)',
            },
          },
        },
      },
    },
  },
});

export default theme;
