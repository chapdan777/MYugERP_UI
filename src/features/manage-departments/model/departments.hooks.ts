/**
 * @file Hooks for managing production departments
 */

import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type {
  ProductionDepartment,
  CreateProductionDepartmentDto,
  UpdateProductionDepartmentDto
} from './types';

const DEPARTMENTS_URL = '/production-departments';

// Fetcher function
const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

/**
 * Hook to fetch all departments
 */
export function useDepartments() {
  const { data, error, isLoading } = useSWR<ProductionDepartment[]>(
    DEPARTMENTS_URL,
    fetcher
  );

  return {
    departments: data || [],
    isLoading,
    isError: error,
  };
}

/**
 * Hook to fetch active departments
 */
export function useActiveDepartments() {
  const { data, error, isLoading } = useSWR<ProductionDepartment[]>(
    `${DEPARTMENTS_URL}/active`,
    fetcher
  );

  return {
    departments: data || [],
    isLoading,
    isError: error,
  };
}

/**
 * Hook to fetch a single department
 */
export function useDepartment(id: number | null) {
  const { data, error, isLoading } = useSWR<ProductionDepartment>(
    id ? `${DEPARTMENTS_URL}/${id}` : null,
    fetcher
  );

  return {
    department: data,
    isLoading,
    isError: error,
  };
}

/**
 * Hook to create a department
 */
export function useCreateDepartment() {
  const createDepartment = async (dto: CreateProductionDepartmentDto) => {
    try {
      const response = await apiClient.post<ProductionDepartment>(DEPARTMENTS_URL, dto);
      mutate(DEPARTMENTS_URL);
      mutate(`${DEPARTMENTS_URL}/active`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { createDepartment };
}

/**
 * Hook to update a department
 */
export function useUpdateDepartment() {
  const updateDepartment = async (id: number, dto: UpdateProductionDepartmentDto) => {
    try {
      const response = await apiClient.put<ProductionDepartment>(`${DEPARTMENTS_URL}/${id}`, dto);
      mutate(DEPARTMENTS_URL);
      mutate(`${DEPARTMENTS_URL}/active`);
      mutate(`${DEPARTMENTS_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { updateDepartment };
}

/**
 * Hook to delete a department
 */
export function useDeleteDepartment() {
  const deleteDepartment = async (id: number) => {
    try {
      await apiClient.delete(`${DEPARTMENTS_URL}/${id}`);
      mutate(DEPARTMENTS_URL);
      mutate(`${DEPARTMENTS_URL}/active`);
    } catch (error) {
      throw error;
    }
  };

  return { deleteDepartment };
}
