/**
 * Схема компонента продукта (BOM)
 */
export interface ProductComponentSchema {
    id: number;
    productId: number;
    name: string;
    lengthFormula: string;
    widthFormula: string;
    quantityFormula: string;
}

export interface CreateProductComponentSchemaDto {
    productId: number;
    name: string;
    lengthFormula: string;
    widthFormula: string;
    quantityFormula: string;
}
