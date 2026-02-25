export interface Property {
    id: number;
    name: string;
    code: string;
    type: string;
    description?: string;
    defaultValue?: string;
    possibleValues?: string[];
    dataType?: string;
    isRequired?: boolean;
    isActive: boolean;
    variableName?: string;
}

export type DependencyType = 'requires' | 'excludes' | 'enables' | 'sets_value';

export interface PropertyDependency {
    id: number;
    sourcePropertyId: number;
    targetPropertyId: number;
    dependencyType: DependencyType;
    sourceValue: string | null;
    targetValue: string | null;
    isActive: boolean;
}

export interface PropertyValue {
    id: number;
    propertyId: number;
    value: string;
    priceModifierId: number | null;
    priceModifier?: {
        id: number;
        name: string;
        value: number;
        type: string;
        code: string;
    } | null;
    displayOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePropertyValueInput {
    propertyId: number;
    value: string;
    priceModifierId?: number | null;
    priceModifierValue?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export interface UpdatePropertyValueInput {
    value?: string;
    priceModifierId?: number | null;
    priceModifierValue?: string;
    displayOrder?: number;
    isActive?: boolean;
}
