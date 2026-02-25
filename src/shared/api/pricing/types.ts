export interface CalculatePriceDto {
    basePrice: number;
    productId: number | undefined;
    quantity: number;
    length?: number;
    width?: number;
    depth?: number;
    propertyValues: { propertyId: number; propertyValue: string }[];
    unitType?: 'm2' | 'linear_meter' | 'unit';
    coefficient?: number;
}

export interface PriceCalculationResult {
    basePrice: number;
    unitPrice: number;
    modifiedUnitPrice: number;
    quantity: number;
    unitType: 'm2' | 'linear_meter' | 'unit';
    dimensions: {
        length: number;
        width: number;
        depth: number;
    };
    coefficient: number;
    modifiersApplied: any[];
    subtotal: number;
    finalPrice: number;
}
