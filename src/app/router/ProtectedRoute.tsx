/**
 * Компонент защищённого маршрута
 */
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Проверка аутентификации пользователя
 */
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Обёртка для защищённых маршрутов
 * Перенаправляет на страницу входа если пользователь не авторизован
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
