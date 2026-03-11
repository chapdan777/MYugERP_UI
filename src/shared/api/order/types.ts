export interface OrderPropertyDto {
    propertyId: number;
    propertyName: string;
    propertyCode: string;
    value: string;
    variableName?: string;
}

export interface OrderItemDto {
    productId: string | number;
    quantity: number;
    unit: string;
    length?: number;
    width?: number;
    depth?: number;
    note?: string; // Point 2
    basePrice?: number; // Point 3
    finalPrice?: number; // Point 3
    properties?: OrderPropertyDto[];
    /** Свойства вложенных компонентов: ключ — productId дочерней номенклатуры */
    nestedProperties?: Record<number, OrderPropertyDto[]>;
}

export type CreateOrderItemDto = OrderItemDto; // Alias for consistency

export interface CreateOrderSectionDto {
    sectionNumber: number;
    sectionName: string;
    headerId?: number; // Added for reference
    // Properties common to all items in this section (from Header settings)
    propertyValues?: OrderPropertyDto[];
    items: OrderItemDto[];
}

export interface CreateOrderDto {
    clientId: number;
    clientName: string;
    deadline?: string; // ISO Date string
    documentType?: string;
    manager?: string;
    orderName?: string;
    launchDate?: string; // ISO Date string
    notes?: string;
    sections: CreateOrderSectionDto[];
}

// Temporary mapping for development until dynamic loading is implemented
export const PROPERTY_IDS = {
    material: 1,
    texture: 2,
    facadeModel: 3,
    panelModel: 4,
    panelMaterial: 5,
    color: 6,
    patina: 7,
    gloss: 8,
    additive: 9,
    thermalSeam: 10,
    additionalParams: 11
};
