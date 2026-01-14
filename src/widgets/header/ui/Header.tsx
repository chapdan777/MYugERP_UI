/**
 * Компонент верхней панели приложения
 */
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import { useThemeStore } from '@shared/model';
import { config } from '@shared/config';

interface HeaderProps {
  /** Номер текущего заказа */
  orderNumber?: string;
}

/**
 * Верхняя панель приложения с логотипом и действиями
 */
export const Header = ({ orderNumber }: HeaderProps) => {
  const { mode, toggleTheme } = useThemeStore();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/* Логотип */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            М
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600, letterSpacing: '-0.5px' }}
          >
            {config.appName}
          </Typography>
        </Box>

        {/* Заголовок страницы */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
          Основные данные заказа
        </Typography>

        {/* Информация о заказе */}
        {orderNumber && (
          <Typography variant="body2" sx={{ mr: 3, opacity: 0.8 }}>
            Заказ #{orderNumber}
          </Typography>
        )}

        {/* Действия */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            size="small"
            sx={{ mr: 1 }}
          >
            Сохранить
          </Button>

          <Tooltip title="Создать заказ наряд">
            <Button variant="outlined" size="small" sx={{ mr: 1 }}>
              + Создать заказ наряд
            </Button>
          </Tooltip>

          <Tooltip title="Печать">
            <IconButton color="inherit" size="small">
              <PrintIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
