import useSWR from 'swr';
import { getNestedProductProperties } from '../api';
import type { NestedProductNode } from './types';

/**
 * Хук для получения дерева вложенных свойств продукта
 * @description Загружает рекурсивное дерево компонентов с их свойствами
 * через эндпоинт nested-properties
 */
export const useNestedProductProperties = (productId: number | null | undefined) => {
    const { data, error, isLoading, mutate } = useSWR<NestedProductNode[]>(
        productId ? [`nested-properties`, productId] : null,
        () => getNestedProductProperties(productId!),
    );

    return {
        /** Дерево вложенных свойств */
        nestedProperties: data ?? [],
        /** Ошибка загрузки */
        error,
        /** Загружается ли */
        isLoading,
        /** Повторно загрузить данные */
        mutate,
    };
};
