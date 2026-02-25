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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import { useThemeStore } from '@shared/model';
import { config } from '@shared/config';

interface HeaderProps {
  /** Номер текущего заказа */
  orderNumber?: string;
  /** Заголовок страницы */
  pageTitle?: string;

  // --- Колбэки действий (опциональные — показываются только если переданы) ---
  /** Сохранение заказа */
  onSave?: () => void;
  /** Идёт сохранение */
  isSaving?: boolean;
  /** Добавить секцию */
  onAddSection?: () => void;
  /** Генерировать заказ-наряд */
  onGenerateWorkOrder?: () => void;
  /** Идёт генерация ЗН */
  isGeneratingWO?: boolean;
  /** Перейти к заказ-нарядам */
  onNavigateWorkOrders?: () => void;
  /** Количество заказ-нарядов */
  workOrdersCount?: number;
}

/**
 * Верхняя панель приложения с логотипом и действиями
 */
export const Header = ({
  orderNumber,
  pageTitle,
  onSave,
  isSaving,
  onAddSection,
  onGenerateWorkOrder,
  isGeneratingWO,
  onNavigateWorkOrders,
  workOrdersCount,
}: HeaderProps) => {
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
          {pageTitle || 'Основные данные заказа'}
        </Typography>

        {/* Информация о заказе */}
        {orderNumber && (
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.8 }}>
            Заказ #{orderNumber}
          </Typography>
        )}

        {/* Действия заказа */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Заказ-наряды */}
          {workOrdersCount !== undefined && workOrdersCount > 0 && onNavigateWorkOrders && (
            <Chip
              icon={<BuildIcon />}
              label={`ЗН: ${workOrdersCount} шт.`}
              color="primary"
              onClick={onNavigateWorkOrders}
              clickable
              size="small"
            />
          )}

          {onGenerateWorkOrder && (workOrdersCount === undefined || workOrdersCount === 0) && (
            <Tooltip title="Сгенерировать заказ-наряд">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={isGeneratingWO ? <CircularProgress size={16} color="inherit" /> : <BuildIcon />}
                onClick={onGenerateWorkOrder}
                disabled={isGeneratingWO}
                size="small"
              >
                + Создать заказ наряд
              </Button>
            </Tooltip>
          )}

          {/* Добавить секцию */}
          {onAddSection && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddSection}
              size="small"
            >
              Добавить секцию
            </Button>
          )}

          {/* Сохранить */}
          {onSave && (
            <Button
              variant="contained"
              color="primary"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={onSave}
              disabled={isSaving}
              size="small"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          )}

          {/* Печать */}
          <Tooltip title="Печать">
            <IconButton color="inherit" size="small">
              <PrintIcon />
            </IconButton>
          </Tooltip>

          {/* Тема */}
          <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
            <IconButton onClick={toggleTheme} color="inherit" size="small">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* Настройки */}
          <Tooltip title="Настройки">
            <IconButton color="inherit" size="small" href="/settings">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
