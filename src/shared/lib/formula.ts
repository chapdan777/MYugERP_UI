/**
 * Безопасное выполнение формул условий или математических расчетов 
 * на основе контекста (значений свойств изделия).
 */

import type { OrderPropertyDto } from '@shared/api/order/types';

/**
 * Оценивает логическую формулу условия (например, 'shrt_15 = true')
 */
export function evaluateCondition(formula: string | null | undefined, properties: OrderPropertyDto[]): boolean {
    if (!formula || formula.trim() === '') {
        return true; // Без формулы компонент отображается всегда
    }

    try {
        // Формируем контекст переменных для формулы (по propertyCode)
        const rawContext: Record<string, any> = {};

        properties.forEach(p => {
            if (p.propertyCode) {
                // Пытаемся преобразовать в boolean или number, если это возможно
                let val: any = p.value;
                if (val === 'true') val = true;
                else if (val === 'false') val = false;
                else if (!isNaN(Number(val)) && val !== '') val = Number(val);

                // Регистрируем по оригинальному коду
                if (p.propertyCode) {
                    rawContext[p.propertyCode] = val;

                    // Также регистрируем по нормализованному коду (пробелы и спецсимволы → _)
                    // Это позволяет формулам типа 'shrt_15 = true' работать с кодами типа 'veneer shrt 15'
                    const normalizedCode = p.propertyCode.replace(/[\s\-\.]/g, '_');
                    if (normalizedCode !== p.propertyCode) {
                        rawContext[normalizedCode] = val;
                    }
                }

                // Регистрируем по variableName, если он передан (самый надежный способ)
                if (p.variableName) {
                    rawContext[p.variableName] = val;
                }
            }
        });

        // Используем Proxy, чтобы при обращении к несуществующей переменной возвращать false
        // Это позволяет писать формулы типа 'shrt_15 = true' даже если свойство еще не выбрано в UI
        const context = new Proxy(rawContext, {
            get: (target, prop) => {
                if (typeof prop === 'string' && prop in target) {
                    return target[prop];
                }
                return false; // По умолчанию для условий считаем неопределенные переменные как false
            }
        });

        // Заменяем в формуле одинарное равно на двойное для JS, если оно не двойное и не >=, <=, !=
        const preparedFormula = formula.replace(/(?<![<>=!])=([^=])/g, '==$1');

        // Создаем функцию, которая принимает context и извлекает из него переменные через with
        // NOTE: with запрещен в строгом режиме, но в new Function он работает в своем контексте
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const fn = new Function('ctx', `with(ctx) { try { return !!(${preparedFormula}); } catch(e) { return false; } }`);

        return fn(context);
    } catch (e) {
        console.warn(`[Formula Evaluator] Критическая ошибка формулы: "${formula}"`, e);
        return false; // При ошибке лучше скрыть компонент
    }
}
