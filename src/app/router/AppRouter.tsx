/**
 * Конфигурация роутера приложения
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { OrderPage, OrdersListPage } from '@pages/order';
import { LoginPage } from '@pages/login';
import DataManagementPage from '@pages/data-management';
import { WorkOrdersPage, WorkOrderDetailsPage } from '@pages/work-orders';
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
                <OrdersListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/orders',
        element: (
            <ProtectedRoute>
                <OrdersListPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/orders/create',
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
        path: '/work-orders',
        element: (
            <ProtectedRoute>
                <WorkOrdersPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/work-orders/:id',
        element: (
            <ProtectedRoute>
                <WorkOrderDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
