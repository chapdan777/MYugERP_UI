/**
 * API хуки для работы с заказами
 */
import useSWR from 'swr';
import { apiClient, swrFetcher, type PaginatedResponse, type PaginationParams } from '@shared/api';
import type { Order, CreateOrderDto, UpdateOrderStatusDto, OrderStatus } from '../model';

interface OrdersParams extends PaginationParams {
  status?: OrderStatus;
  clientId?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Хук для получения списка заказов
 */
export const useOrders = (params?: OrdersParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.clientId) searchParams.set('clientId', params.clientId.toString());
  if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

  const queryString = searchParams.toString();
  const url = queryString ? `/orders?${queryString}` : '/orders';

  return useSWR<PaginatedResponse<Order>>(url, swrFetcher);
};

/**
 * Хук для получения заказа по ID
 */
export const useOrder = (id: number | null) => {
  return useSWR<Order>(id ? `/orders/${id}` : null, swrFetcher);
};

/**
 * Функция создания заказа
 */
export const createOrder = async (data: CreateOrderDto): Promise<Order> => {
  const response = await apiClient.post<Order>('/orders', data);
  return response.data;
};

/**
 * Функция обновления статуса заказа
 */
export const updateOrderStatus = async (
  id: number,
  data: UpdateOrderStatusDto
): Promise<Order> => {
  const response = await apiClient.patch<Order>(`/orders/${id}/status`, data);
  return response.data;
};

/**
 * Функция удаления заказа
 */
export const deleteOrder = async (id: number): Promise<void> => {
  await apiClient.delete(`/orders/${id}`);
};
