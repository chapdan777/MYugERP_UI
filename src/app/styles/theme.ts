/**
 * Конфигурация темы MUI для ERP-системы
 * Поддержка светлой и тёмной темы с Glass UI эффектами
 */
import { createTheme, type ThemeOptions } from '@mui/material/styles';

/**
 * Общие стили для стеклянных панелей
 */
const glassStyles = {
  light: {
    background: 'rgba(255, 255, 255, 0.35)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07), inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
  },
  dark: {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
  },
};

/**
 * Базовые настройки типографики
 */
const typography = {
  fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2rem',
    fontWeight: 600,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 500,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  h5: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  h6: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  body1: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.8125rem',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,
  },
};

/**
 * Настройки светлой темы
 */
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#c62828',
      light: '#ff5f52',
      dark: '#8e0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#424242',
      light: '#6d6d6d',
      dark: '#1b1b1b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#e8e8e8',
      paper: 'rgba(255, 255, 255, 0.85)',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    success: {
      main: '#2e7d32',
    },
    info: {
      main: '#0288d1',
    },
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#e8e8e8',
          backgroundImage: 'linear-gradient(135deg, #e8e8e8 0%, #d0d0d0 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...glassStyles.light,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...glassStyles.light,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          ...glassStyles.light,
          borderRadius: 8,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.08)',
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'transparent',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...glassStyles.light,
          color: '#1a1a1a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...glassStyles.light,
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
};

/**
 * Настройки тёмной темы
 */
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#ef5350',
      light: '#ff867c',
      dark: '#b61827',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#90a4ae',
      light: '#c1d5e0',
      dark: '#62757f',
      contrastText: '#000000',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(30, 41, 59, 0.9)',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ffa726',
    },
    success: {
      main: '#66bb6a',
    },
    info: {
      main: '#29b6f6',
    },
  },
  typography,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          ...glassStyles.dark,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...glassStyles.dark,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderColor: 'rgba(148, 163, 184, 0.4)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: '#ef5350',
              boxShadow: '0 0 0 2px rgba(239, 83, 80, 0.2)',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#f1f5f9 !important',
            caretColor: '#ef5350 !important',
            WebkitTextFillColor: '#f1f5f9 !important',
            '&::placeholder': {
              color: '#64748b !important',
              opacity: '1 !important',
              WebkitTextFillColor: '#64748b !important',
            },
          },
          '& .MuiInputBase-input': {
            color: '#f1f5f9 !important',
            WebkitTextFillColor: '#f1f5f9 !important',
          },
          '& .MuiSelect-select': {
            color: '#f1f5f9 !important',
            WebkitTextFillColor: '#f1f5f9 !important',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-focused': {
            color: '#ef5350',
          },
          '&.MuiInputLabel-shrink': {
            color: '#94a3b8',
          },
          '&.Mui-focused.MuiInputLabel-shrink': {
            color: '#ef5350',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#f1f5f9',
        },
        input: {
          color: '#f1f5f9 !important',
          WebkitTextFillColor: '#f1f5f9 !important',
          '&::placeholder': {
            color: '#64748b !important',
            opacity: '1 !important',
            WebkitTextFillColor: '#64748b !important',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        },
        option: {
          color: '#f1f5f9',
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(239, 83, 80, 0.15) !important',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(148, 163, 184, 0.12) !important',
          },
        },
        tag: {
          color: '#f1f5f9',
          backgroundColor: 'rgba(148, 163, 184, 0.15)',
        },
        clearIndicator: {
          color: '#94a3b8',
        },
        popupIndicator: {
          color: '#94a3b8',
        },
        noOptions: {
          color: '#64748b',
        },
        input: {
          color: '#f1f5f9 !important',
          WebkitTextFillColor: '#f1f5f9 !important',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: '#f1f5f9 !important',
          WebkitTextFillColor: '#f1f5f9 !important',
        },
        icon: {
          color: '#94a3b8',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#f1f5f9',
          '&:hover': {
            backgroundColor: 'rgba(148, 163, 184, 0.12)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(239, 83, 80, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(239, 83, 80, 0.25)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(148, 163, 184, 0.3)',
        },
        filled: {
          color: '#f1f5f9',
        },
        outlined: {
          color: '#cbd5e1',
          borderColor: 'rgba(148, 163, 184, 0.3)',
        },
        deleteIcon: {
          color: '#94a3b8',
          '&:hover': {
            color: '#f1f5f9',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          backgroundImage: 'none',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#f1f5f9',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#cbd5e1',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          ...glassStyles.dark,
          borderRadius: 8,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          padding: '12px 16px',
          color: '#cbd5e1',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'transparent',
          color: '#94a3b8',
          textTransform: 'uppercase' as const,
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...glassStyles.dark,
          color: '#f1f5f9',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...glassStyles.dark,
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#334155',
          color: '#f1f5f9',
          fontSize: '0.75rem',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#ef5350',
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#ef5350',
          },
        },
      },
    },
  },
};

/**
 * Светлая тема ERP-системы
 */
export const lightTheme = createTheme(lightThemeOptions);

/**
 * Тёмная тема ERP-системы
 */
export const darkTheme = createTheme(darkThemeOptions);

/**
 * Получение темы по имени
 */
export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
