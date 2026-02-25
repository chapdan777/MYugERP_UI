/**
 * @file Хук для сохранения черновика заказа в localStorage
 * @description Автосохранение данных заказа при изменениях, восстановление при возврате на страницу
 */

import { useCallback, useEffect, useRef } from 'react';
import type { OrderFormData } from '@entities/order';
import type { CreateOrderSectionDto } from '@shared/api/order/types';

const DRAFT_KEY = 'erp_order_draft';
const DEBOUNCE_MS = 1000;

export interface OrderDraft {
    headerData: OrderFormData;
    sections: CreateOrderSectionDto[];
    savedAt: string; // ISO timestamp
}

/**
 * Проверяет наличие черновика в localStorage
 */
export function hasDraft(): boolean {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return false;
        const draft: OrderDraft = JSON.parse(raw);
        // Черновик считается валидным, если он не старше 7 дней
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        return Date.now() - new Date(draft.savedAt).getTime() < sevenDays;
    } catch {
        return false;
    }
}

/**
 * Получает черновик из localStorage
 */
export function getDraft(): OrderDraft | null {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * Очищает черновик
 */
export function clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
}

/**
 * Хук автосохранения черновика заказа
 */
export function useOrderDraft(
    headerData: OrderFormData,
    sections: CreateOrderSectionDto[],
    enabled: boolean, // Включать только для нового заказа (не editMode)
) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const saveDraft = useCallback(() => {
        if (!enabled) return;
        try {
            const draft: OrderDraft = {
                headerData,
                sections,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (e) {
            console.warn('Не удалось сохранить черновик:', e);
        }
    }, [headerData, sections, enabled]);

    // Автосохранение с debounce
    useEffect(() => {
        if (!enabled) return;

        // Не сохранять пустой черновик
        const hasContent = headerData.clientName || headerData.orderName || sections.length > 0;
        if (!hasContent) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(saveDraft, DEBOUNCE_MS);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [headerData, sections, saveDraft, enabled]);

    // Предупреждение при уходе со страницы
    useEffect(() => {
        if (!enabled) return;

        const hasContent = headerData.clientName || headerData.orderName || sections.length > 0;
        if (!hasContent) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            // Сохраняем черновик немедленно перед уходом
            saveDraft();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [enabled, headerData, sections, saveDraft]);

    return { saveDraft, clearDraft };
}
