/**
 * Схема компонента продукта (рекурсивный BOM)
 * @description Описывает деталь, из которой состоит продукт, с возможностью
 * ссылки на дочернюю номенклатуру для создания вложенной иерархии изделий
 */
export interface ProductComponentSchema {
    /** Идентификатор схемы */
    id: number;
    /** ID родительского продукта */
    productId: number;
    /** ID дочерней номенклатуры (null = простая деталь) */
    childProductId: number | null;
    /** Название компонента */
    name: string;
    /** Формула высоты (H) дочернего элемента */
    lengthFormula: string;
    /** Формула ширины (W) дочернего элемента */
    widthFormula: string;
    /** Формула количества */
    quantityFormula: string;
    /** Формула глубины (D) дочернего элемента */
    depthFormula: string | null;
    /** Дополнительные переменные для контекста дочернего элемента */
    extraVariables: Record<string, string> | null;
    /** Формула условия включения компонента */
    conditionFormula: string | null;
    /** Порядок сортировки */
    sortOrder: number;
}

/**
 * DTO для создания схемы компонента
 */
export interface CreateProductComponentSchemaDto {
    /** ID родительского продукта */
    productId: number;
    /** ID дочерней номенклатуры (опционально) */
    childProductId?: number | null;
    /** Название компонента */
    name: string;
    /** Формула высоты (H) */
    lengthFormula: string;
    /** Формула ширины (W) */
    widthFormula: string;
    /** Формула количества */
    quantityFormula: string;
    /** Формула глубины (D) */
    depthFormula?: string | null;
    /** Дополнительные переменные */
    extraVariables?: Record<string, string> | null;
    /** Формула условия включения */
    conditionFormula?: string | null;
    /** Порядок сортировки */
    sortOrder?: number;
}

/**
 * Узел дерева вложенных свойств продукта
 * @description Представляет дочернюю номенклатуру с её свойствами
 * и рекурсивными дочерними узлами
 */
export interface NestedProductNode {
    /** ID продукта */
    productId: number;
    /** Название продукта */
    productName: string;
    /** Название компонента в BOM-схеме родителя */
    componentName: string;
    /** Свойства этого продукта */
    properties: Array<{
        propertyId: number;
        propertyName: string;
        defaultValue: string | null;
        isRequired: boolean;
    }>;
    /** Дочерние компоненты (рекурсия) */
    children: NestedProductNode[];
}
