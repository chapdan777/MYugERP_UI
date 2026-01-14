/**
 * Провайдер темы MUI с поддержкой переключения между светлой и тёмной темой
 */
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeStore } from '@shared/model/theme.store';
import { getTheme } from '../styles/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Обёртка для провайдера темы приложения
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { mode } = useThemeStore();
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
