export interface OrderPropertyDto {
    propertyId: number;
    propertyName: string;
    propertyCode: string;
    value: string;
}

export interface OrderItemDto {
    productId: string | number;
    quantity: number;
    unit: string;
    length?: number;
    width?: number;
    properties?: OrderPropertyDto[];
}

export interface CreateOrderSectionDto {
    sectionNumber: number;
    sectionName: string;
    // Properties common to all items in this section (from Header settings)
    propertyValues?: OrderPropertyDto[];
    items: OrderItemDto[];
}

export interface CreateOrderDto {
    clientId: number;
    clientName: string;
    deadline?: string; // ISO Date string
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
