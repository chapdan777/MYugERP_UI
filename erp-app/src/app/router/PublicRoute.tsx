/**
 * Компонент публичного маршрута
 */
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Проверка аутентификации пользователя
 */
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Обёртка для публичных маршрутов
 * Перенаправляет на главную страницу если пользователь уже авторизован
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
