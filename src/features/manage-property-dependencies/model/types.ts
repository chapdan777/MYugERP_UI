/**
 * Типы зависимостей между свойствами
 * Соответствует энаму на бэкенде
 */
export const DependencyType = {
    REQUIRES: 'requires',        // Если A выбрано, то B обязательно
    EXCLUDES: 'excludes',        // Если A выбрано, то B недоступно
    ENABLES: 'enables',          // Если A выбрано, то B становится доступным
    SETS_VALUE: 'sets_value',    // Если A выбрано, то B получает определенное значение
} as const;

export type DependencyType = typeof DependencyType[keyof typeof DependencyType];

/**
 * Интерфейс зависимости свойства
 */
export interface PropertyDependency {
    id: number;
    sourcePropertyId: number;
    targetPropertyId: number;
    dependencyType: DependencyType;
    sourceValue?: string | null;
    targetValue?: string | null;
    isActive: boolean;
    createdAt: string;
}

/**
 * DTO для создания зависимости
 */
export interface CreatePropertyDependencyDto {
    sourcePropertyId: number;
    targetPropertyId: number;
    dependencyType: DependencyType;
    sourceValue?: string;
    targetValue?: string;
}

/**
 * DTO для обновления зависимости
 */
export interface UpdatePropertyDependencyDto {
    sourcePropertyId?: number;
    targetPropertyId?: number;
    dependencyType?: DependencyType;
    sourceValue?: string;
    targetValue?: string;
    isActive?: boolean;
}

