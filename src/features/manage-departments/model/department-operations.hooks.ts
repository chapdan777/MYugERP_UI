/**
 * @file Hooks for managing department operations
 */

import useSWR, { mutate } from 'swr';
import { apiClient } from '../../../shared/api/client';
import type {
    DepartmentOperation,
    CreateDepartmentOperationDto,
    UpdateDepartmentOperationDto
} from './types';

const DEPARTMENT_OPERATIONS_URL = '/department-operations';
const DEPARTMENTS_URL = '/production-departments';

// Fetcher function
const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

/**
 * Hook to fetch operations for a specific department
 */
export function useDepartmentOperations(departmentId: number | null) {
    const { data, error, isLoading } = useSWR<DepartmentOperation[]>(
        departmentId ? `${DEPARTMENTS_URL}/${departmentId}/operations` : null,
        fetcher
    );

    return {
        departmentOperations: data || [],
        isLoading,
        isError: error,
    };
}

/**
 * Hook to create a department operation link
 */
export function useCreateDepartmentOperation() {
    const createDepartmentOperation = async (dto: CreateDepartmentOperationDto) => {
        try {
            const response = await apiClient.post<DepartmentOperation>(DEPARTMENT_OPERATIONS_URL, dto);
            // Invalidate the department operations list
            mutate(`${DEPARTMENTS_URL}/${dto.departmentId}/operations`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    return { createDepartmentOperation };
}

/**
 * Hook to update a department operation link
 */
export function useUpdateDepartmentOperation() {
    const updateDepartmentOperation = async (id: number, departmentId: number, dto: UpdateDepartmentOperationDto) => {
        try {
            const response = await apiClient.put<DepartmentOperation>(`${DEPARTMENT_OPERATIONS_URL}/${id}`, dto);
            mutate(`${DEPARTMENTS_URL}/${departmentId}/operations`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    return { updateDepartmentOperation };
}

/**
 * Hook to delete a department operation link
 */
export function useDeleteDepartmentOperation() {
    const deleteDepartmentOperation = async (id: number, departmentId: number) => {
        try {
            await apiClient.delete(`${DEPARTMENT_OPERATIONS_URL}/${id}`);
            mutate(`${DEPARTMENTS_URL}/${departmentId}/operations`);
        } catch (error) {
            throw error;
        }
    };

    return { deleteDepartmentOperation };
}
