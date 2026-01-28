/**
 * Конфигурация роутера приложения
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { OrderPage } from '@pages/order';
import { LoginPage } from '@pages/login';
import DataManagementPage from '@pages/data-management';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

/**
 * Конфигурация маршрутов приложения
 */
export const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <OrderPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/orders',
        element: (
            <ProtectedRoute>
                <OrderPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/orders/:id',
        element: (
            <ProtectedRoute>
                <OrderPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/data-management',
        element: (
            <ProtectedRoute>
                <DataManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/products',
        element: (
            <ProtectedRoute>
                <DataManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/users',
        element: (
            <ProtectedRoute>
                <DataManagementPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
