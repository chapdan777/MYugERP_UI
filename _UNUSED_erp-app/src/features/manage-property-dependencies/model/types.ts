/**
 * Типы зависимостей между свойствами
 * Соответствует энаму на бэкенде
 */
export enum DependencyType {
    REQUIRES = 'requires',        // Если A выбрано, то B обязательно
    EXCLUDES = 'excludes',        // Если A выбрано, то B недоступно
    ENABLES = 'enables',          // Если A выбрано, то B становится доступным
    SETS_VALUE = 'sets_value',    // Если A выбрано, то B получает определенное значение
}

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
