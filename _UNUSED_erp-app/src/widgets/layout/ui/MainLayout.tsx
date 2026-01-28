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
}

/**
 * Главный Layout с Header, Sidebar и основной областью контента
 */
export const MainLayout = ({ children, orderNumber }: MainLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header orderNumber={orderNumber} />
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
