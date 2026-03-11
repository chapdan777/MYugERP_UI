/**
 * Основной Layout приложения
 */
import { useState } from 'react';
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
  onRegenerateWorkOrder?: () => void;
  isGeneratingWO?: boolean;
  onNavigateWorkOrders?: () => void;
  workOrdersCount?: number;
  onSaveAsNew?: () => void;
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
  onRegenerateWorkOrder,
  isGeneratingWO,
  onNavigateWorkOrders,
  workOrdersCount,
  onSaveAsNew,
}: MainLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        orderNumber={orderNumber}
        pageTitle={pageTitle}
        onSave={onSave}
        isSaving={isSaving}
        onAddSection={onAddSection}
        onGenerateWorkOrder={onGenerateWorkOrder}
        onRegenerateWorkOrder={onRegenerateWorkOrder}
        isGeneratingWO={isGeneratingWO}
        onNavigateWorkOrders={onNavigateWorkOrders}
        workOrdersCount={workOrdersCount}
        onSaveAsNew={onSaveAsNew}
        onToggleSidebar={handleDrawerToggle}
      />
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
