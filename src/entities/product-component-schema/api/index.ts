import { apiClient } from '../../../shared/api/client';
import type { CreateProductComponentSchemaDto, ProductComponentSchema, NestedProductNode } from '../model/types';

const BASE_URL = '/production/schemas';

/**
 * Получить список схем компонентов для продукта
 */
export const getProductComponentSchemas = async (productId: number): Promise<ProductComponentSchema[]> => {
    const response = await apiClient.get<ProductComponentSchema[]>(`${BASE_URL}/product/${productId}`);
    return response.data;
};

/**
 * Получить дерево вложенных свойств продукта (рекурсивный обход BOM)
 */
export const getNestedProductProperties = async (productId: number): Promise<NestedProductNode[]> => {
    const response = await apiClient.get<NestedProductNode[]>(`${BASE_URL}/product/${productId}/nested-properties`);
    return response.data;
};

/**
 * Создать схему компонента
 */
export const createProductComponentSchema = async (dto: CreateProductComponentSchemaDto): Promise<ProductComponentSchema> => {
    const response = await apiClient.post<ProductComponentSchema>(BASE_URL, dto);
    return response.data;
};

/**
 * Обновить схему компонента
 */
export const updateProductComponentSchema = async (id: number, dto: Partial<CreateProductComponentSchemaDto>): Promise<ProductComponentSchema> => {
    const response = await apiClient.post<ProductComponentSchema>(`${BASE_URL}/${id}`, dto);
    return response.data;
};

/**
 * Удалить схему компонента
 */
export const deleteProductComponentSchema = async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
};
