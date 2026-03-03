/**
 * @file Хуки для управления заказ-нарядами
 * @description Содержит SWR хуки для работы с API заказ-нарядов
 */

import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type { WorkOrderResponseDto, WorkOrderListQuery } from './types';

const WORK_ORDERS_API_URL = '/work-orders';

/**
 * Хук для получения списка заказ-нарядов
 */
export const useWorkOrders = (filters?: WorkOrderListQuery) => {
    const queryParams = new URLSearchParams();

    if (filters) {
        if (filters.orderId) queryParams.append('orderId', filters.orderId.toString());
        if (filters.departmentId) queryParams.append('departmentId', filters.departmentId.toString());
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.minPriority) queryParams.append('minPriority', filters.minPriority.toString());
        if (filters.maxPriority) queryParams.append('maxPriority', filters.maxPriority.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${WORK_ORDERS_API_URL}?${queryString}` : WORK_ORDERS_API_URL;

    const { data, error, isLoading } = useSWR<WorkOrderResponseDto[]>(
        url,
        async (url: string) => {
            const response = await apiClient.get(url);
            return response.data;
        }
    );

    return {
        workOrders: data || [],
        isLoading,
        isError: !!error,
        error,
    };
};

/**
 * Хук для получения одного заказ-наряда
 */
export const useWorkOrder = (id?: number) => {
    const { data, error, isLoading } = useSWR<WorkOrderResponseDto>(
        id ? `${WORK_ORDERS_API_URL}/${id}` : null,
        async (url: string) => {
            const response = await apiClient.get(url);
            return response.data;
        }
    );

    return {
        workOrder: data,
        isLoading,
        isError: !!error,
        error,
    };
};
/**
 * Хук для назначения заказ-наряда
 */
export const useAssignWorkOrder = () => {
    return {
        assignWorkOrder: async (id: number) => {
            await apiClient.post(`${WORK_ORDERS_API_URL}/${id}/assign`);
            await mutate(WORK_ORDERS_API_URL);
            await mutate(`${WORK_ORDERS_API_URL}/${id}`);
        }
    };
};

/**
 * Хук для начала выполнения
 */
export const useStartWorkOrder = () => {
    return {
        startWorkOrder: async (id: number) => {
            await apiClient.post(`${WORK_ORDERS_API_URL}/${id}/start`);
            await mutate(WORK_ORDERS_API_URL);
            await mutate(`${WORK_ORDERS_API_URL}/${id}`);
        }
    };
};

/**
 * Хук для отправки на проверку
 */
export const useSendToQualityCheck = () => {
    return {
        sendToQualityCheck: async (id: number) => {
            await apiClient.post(`${WORK_ORDERS_API_URL}/${id}/quality-check`);
            await mutate(WORK_ORDERS_API_URL);
            await mutate(`${WORK_ORDERS_API_URL}/${id}`);
        }
    };
};

/**
 * Хук для завершения
 */
export const useCompleteWorkOrder = () => {
    return {
        completeWorkOrder: async (id: number) => {
            await apiClient.post(`${WORK_ORDERS_API_URL}/${id}/complete`);
            await mutate(WORK_ORDERS_API_URL);
            await mutate(`${WORK_ORDERS_API_URL}/${id}`);
        }
    };
};

/**
 * Хук для отмены
 */
export const useCancelWorkOrder = () => {
    return {
        cancelWorkOrder: async (id: number, reason: string) => {
            await apiClient.post(`${WORK_ORDERS_API_URL}/${id}/cancel`, { reason });
            await mutate(WORK_ORDERS_API_URL);
            await mutate(`${WORK_ORDERS_API_URL}/${id}`);
        }
    };
};

/**
 * Хук для обновления заметок
 */
export const useUpdateWorkOrderNotes = () => {
    return {
        updateNotes: async (id: number, notes: string) => {
            await apiClient.put(`${WORK_ORDERS_API_URL}/${id}/notes`, { notes });
            await mutate(`${WORK_ORDERS_API_URL}/${id}`);
        }
    };
};

/**
 * Хук для генерации заказ-нарядов
 */
export const useGenerateWorkOrders = () => {
    return {
        generateWorkOrders: async (orderId: number) => {
            const response = await apiClient.post<WorkOrderResponseDto[]>(`${WORK_ORDERS_API_URL}/generate`, { orderId });
            await mutate(WORK_ORDERS_API_URL);
            return response.data;
        },
        regenerateWorkOrders: async (orderId: number) => {
            const response = await apiClient.post<WorkOrderResponseDto[]>(`${WORK_ORDERS_API_URL}/regenerate`, { orderId });
            await mutate(WORK_ORDERS_API_URL);
            return response.data;
        }
    };
};
