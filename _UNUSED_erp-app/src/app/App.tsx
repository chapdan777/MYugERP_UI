/**
 * Главный компонент приложения
 */
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './providers';
import { router } from './router';

/**
 * Корневой компонент ERP-приложения
 */
export const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
