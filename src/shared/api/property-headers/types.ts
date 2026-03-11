export interface PropertyHeader {
    id: number;
    name: string;
    orderTypeId: number;
    description?: string;
    isActive: boolean;
}

export interface PropertyHeaderItem {
    headerId: number;
    propertyId: number;
    sortOrder: number;
    // Included relation from backend if available, otherwise just ID
    property?: {
        id: number;
        name: string;
        code: string;
        // other fields...
    }
}

export interface HeaderProduct {
    id: number;
    name: string;
    code: string;
    basePrice: number;
    unit: string;
    defaultLength?: number | null;
    defaultWidth?: number | null;
    defaultDepth?: number | null;
    isActive: boolean;
}

export interface GetHeadersParams {
    isActive?: boolean;
    orderTypeId?: number;
}
