import { apiClient } from '../../../shared/api/client';
import type { CreateProductComponentSchemaDto, ProductComponentSchema } from '../model/types';

const BASE_URL = '/production/schemas';

/**
 * Получить список схем компонентов для продукта
 */
export const getProductComponentSchemas = async (productId: number): Promise<ProductComponentSchema[]> => {
    const response = await apiClient.get<ProductComponentSchema[]>(`${BASE_URL}/product/${productId}`);
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
 * Удалить схему компонента
 */
export const deleteProductComponentSchema = async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
};
