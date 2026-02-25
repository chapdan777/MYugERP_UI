/**
 * Основной Layout приложения
 */
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Header } from '@widgets/header';
import { Sidebar } from '@widgets/sidebar';

/** Ширина боковой панели */
const DRAWER_WIDTH = 64;

interface MainLayoutProps {
  children: ReactNode;
  /** Номер текущего заказа для отображения в Header */
  orderNumber?: string;
  /** Заголовок страницы */
  pageTitle?: string;

  // --- Колбэки действий (прокидываются в Header) ---
  onSave?: () => void;
  isSaving?: boolean;
  onAddSection?: () => void;
  onGenerateWorkOrder?: () => void;
  isGeneratingWO?: boolean;
  onNavigateWorkOrders?: () => void;
  workOrdersCount?: number;
}

/**
 * Главный Layout с Header, Sidebar и основной областью контента
 */
export const MainLayout = ({
  children,
  orderNumber,
  pageTitle,
  onSave,
  isSaving,
  onAddSection,
  onGenerateWorkOrder,
  isGeneratingWO,
  onNavigateWorkOrders,
  workOrdersCount,
}: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        orderNumber={orderNumber}
        pageTitle={pageTitle}
        onSave={onSave}
        isSaving={isSaving}
        onAddSection={onAddSection}
        onGenerateWorkOrder={onGenerateWorkOrder}
        isGeneratingWO={isGeneratingWO}
        onNavigateWorkOrders={onNavigateWorkOrders}
        workOrdersCount={workOrdersCount}
      />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${DRAWER_WIDTH}px`,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
