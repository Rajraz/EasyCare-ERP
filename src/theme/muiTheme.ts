import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#0d9488', // Teal 600
      light: '#14b8a6', // Teal 500
      dark: '#0f766e', // Teal 700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0284c7', // Sky 600
      light: '#38bdf8', // Sky 400
      dark: '#0369a1', // Sky 700
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669', // Emerald 600
      light: '#10b981',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706', // Amber 600
      light: '#f59e0b',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e11d48', // Rose 600
      light: '#f43f5e',
      dark: '#be123c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b', // Slate 500
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", system-ui, -apple-system, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 18px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px 0 rgba(13, 148, 136, 0.18)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 14px 0 rgba(13, 148, 136, 0.25)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '0.75rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0f172a',
          fontSize: '0.72rem',
          fontWeight: 500,
          borderRadius: 8,
          padding: '6px 10px',
        },
        arrow: {
          color: '#0f172a',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderRadius: 10,
          minHeight: 40,
        },
      },
    },
  },
});
