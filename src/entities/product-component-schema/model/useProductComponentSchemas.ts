import useSWR from 'swr';
import { swrFetcher } from '../../../shared/api/client';
import { createProductComponentSchema, deleteProductComponentSchema } from '../api';
import type { CreateProductComponentSchemaDto, ProductComponentSchema } from './types';

export const useProductComponentSchemas = (productId: number) => {
    const key = productId ? `/production/schemas/product/${productId}` : null;

    const { data, error, isLoading, mutate } = useSWR<ProductComponentSchema[]>(
        key,
        swrFetcher
    );

    const addSchema = async (dto: CreateProductComponentSchemaDto) => {
        // Оптимистичное обновление или просто ревалидация после запроса
        await createProductComponentSchema(dto);
        await mutate();
    };

    const removeSchema = async (id: number) => {
        await deleteProductComponentSchema(id);
        await mutate();
    };

    return {
        schemas: data || [],
        isLoading,
        error,
        addSchema,
        removeSchema
    };
};
