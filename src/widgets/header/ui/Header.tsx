import { useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ButtonGroup from '@mui/material/ButtonGroup';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

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
  /** Перегенерировать ЗН */
  onRegenerateWorkOrder?: () => void;
  /** Идёт генерация ЗН */
  isGeneratingWO?: boolean;
  /** Перейти к заказ-нарядам */
  onNavigateWorkOrders?: () => void;
  /** Количество заказ-нарядов */
  workOrdersCount?: number;
  /** Сохранить как новый (Клонировать) */
  onSaveAsNew?: () => void;
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
  onRegenerateWorkOrder,
  isGeneratingWO,
  onNavigateWorkOrders,
  workOrdersCount,
  onSaveAsNew,
}: HeaderProps) => {
  const { mode, toggleTheme } = useThemeStore();

  // Split Button State
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const handleSaveAsNewClick = () => {
    if (onSaveAsNew) {
      onSaveAsNew();
    }
    setOpen(false);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        color: mode === 'dark' ? '#f1f5f9' : '#1e293b',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
        {/* Left: Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            М
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.2 }}
            >
              {config.appName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', lineHeight: 1 }}>
              {pageTitle || 'Панель управления'}
            </Typography>
          </Box>
        </Box>

        {/* Center: Order Info (optional) */}
        {orderNumber && (
          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mr: 1 }}>
              ЗАКАЗ
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>
              #{orderNumber}
            </Typography>
          </Box>
        )}

        {/* Right: Actions */}
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1.5 }, alignItems: 'center' }}>

          {/* Work Orders Block */}
          {workOrdersCount !== undefined && workOrdersCount > 0 && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
              borderRadius: '8px',
              p: '2px',
              gap: 0.5,
              border: '1px solid',
              borderColor: alpha('#6366f1', 0.2),
            }}>
              <Chip
                icon={<BuildIcon sx={{ fontSize: '1rem !important' }} />}
                label={workOrdersCount}
                onClick={onNavigateWorkOrders}
                clickable
                size="small"
                sx={{
                  bgcolor: 'transparent',
                  fontWeight: 700,
                  '&:hover': { bgcolor: alpha('#6366f1', 0.1) },
                  height: 28,
                }}
              />
              {onRegenerateWorkOrder && (
                <Tooltip title="Перегенерировать ЗН">
                  <IconButton
                    size="small"
                    onClick={onRegenerateWorkOrder}
                    disabled={isGeneratingWO}
                    sx={{
                      width: 28,
                      height: 28,
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha('#6366f1', 0.1) }
                    }}
                  >
                    {isGeneratingWO ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon sx={{ fontSize: '1.1rem' }} />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          {onGenerateWorkOrder && (workOrdersCount === undefined || workOrdersCount === 0) && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={isGeneratingWO ? <CircularProgress size={16} color="inherit" /> : <BuildIcon />}
              onClick={onGenerateWorkOrder}
              disabled={isGeneratingWO}
              size="small"
              sx={{ borderRadius: '8px', height: 36 }}
            >
              Создать ЗН
            </Button>
          )}

          {/* Add Section */}
          {onAddSection && (
            <Button
              variant="text"
              startIcon={<AddIcon />}
              onClick={onAddSection}
              size="small"
              sx={{
                borderRadius: '8px',
                height: 36,
                display: { xs: 'none', lg: 'flex' },
                color: mode === 'dark' ? '#94a3b8' : '#64748b'
              }}
            >
              Секция
            </Button>
          )}

          {/* Save & More (Split Button) */}
          {onSave && (
            <ButtonGroup
              variant="contained"
              ref={anchorRef}
              aria-label="split button"
              size="small"
              sx={{
                borderRadius: '8px',
                height: 36,
                boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(99, 102, 241, 0.2)',
                '& .MuiButtonGroup-grouped': {
                  borderColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <Button
                onClick={onSave}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{ px: 2, fontWeight: 600 }}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                size="small"
                aria-controls={open ? 'split-button-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="select merge strategy"
                aria-haspopup="menu"
                onClick={handleToggle}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
          )}

          <Popper
            sx={{ zIndex: 1 }}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper sx={{
                  mt: 1,
                  bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" autoFocusItem>
                      {onSaveAsNew && (
                        <MenuItem onClick={handleSaveAsNewClick} sx={{ gap: 1.5, py: 1.5, px: 2 }}>
                          <ContentCopyIcon fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight={500}>Копировать заказ</Typography>
                        </MenuItem>
                      )}
                      <MenuItem sx={{ gap: 1.5, py: 1.5, px: 2 }}>
                        <PrintIcon fontSize="small" sx={{ opacity: 0.7 }} />
                        <Typography variant="body2">Печать документа</Typography>
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>

          {/* System Actions */}
          <Box sx={{ display: 'flex', borderLeft: '1px solid', borderColor: 'divider', ml: 1, pl: 1 }}>
            <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
              <IconButton onClick={toggleTheme} color="inherit" size="small" sx={{ color: mode === 'dark' ? '#94a3b8' : '#64748b' }}>
                {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Настройки">
              <IconButton color="inherit" size="small" href="/settings" sx={{ color: mode === 'dark' ? '#94a3b8' : '#64748b' }}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
