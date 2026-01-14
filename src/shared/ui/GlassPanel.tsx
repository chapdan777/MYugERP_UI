/**
 * Компонент стеклянной панели
 * Используется для создания Glass UI эффекта
 */
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

/**
 * Стеклянная панель с эффектом размытия фона
 */
export const GlassPanel = styled(Paper)(({ theme }) => ({
  background:
    theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.35)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border:
    theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.15)'
      : '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.07), inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundImage: 'none',
}));

/**
 * Стеклянная карточка для секций формы
 * Более выраженный эффект для выделения контента
 */
export const GlassCard = styled(Paper)(({ theme }) => ({
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%), rgba(30, 41, 59, 0.5)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%), rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:
    theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.25)'
      : '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 4px 24px 0 rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.15)'
      : '0 4px 24px 0 rgba(31, 38, 135, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  padding: theme.spacing(3),
  backgroundImage: 'none',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.3)'
        : '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
  },
}));
