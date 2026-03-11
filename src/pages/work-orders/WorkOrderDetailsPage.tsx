import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Grid,
    Chip,
    Divider,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    alpha,
    Collapse,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import FactoryIcon from '@mui/icons-material/Factory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StraightenIcon from '@mui/icons-material/Straighten';
import CategoryIcon from '@mui/icons-material/Category';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import BuildIcon from '@mui/icons-material/Build';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

import LayersIcon from '@mui/icons-material/Layers';
import { ToggleButton, ToggleButtonGroup, FormControlLabel, Switch } from '@mui/material';

import { GlassCard } from '../../shared/ui';
import {
    useWorkOrder,
    useAssignWorkOrder,
    useStartWorkOrder,
    useSendToQualityCheck,
    useCompleteWorkOrder,
    useCancelWorkOrder
} from '../../features/manage-work-orders/model/work-orders.hooks';
import { useWorkOrderStatuses } from '../../features/manage-work-order-statuses';

import { MainLayout } from '@widgets/layout';

/* ─── helpers ──────────────────────────────────────────── */

const fmt = (n: number | null | undefined, unit = '') =>
    n != null && n > 0 ? `${n.toLocaleString('ru-RU')}${unit ? ` ${unit}` : ''}` : '—';

const fmtDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const priorityMeta = (p: number) => {
    if (p >= 9) return { color: '#ef4444', label: 'Критический' };
    if (p >= 7) return { color: '#f97316', label: 'Высокий' };
    if (p >= 5) return { color: '#eab308', label: 'Средний' };
    return { color: '#22c55e', label: 'Низкий' };
};

/* ─── InfoTile sub-component ───────────────────────────── */

interface InfoTileProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    accent?: string;
}

const InfoTile: React.FC<InfoTileProps> = ({ icon, label, value, accent }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            border: 1, borderColor: 'divider',
            minWidth: 0,
        }}
    >
        <Box sx={{ color: accent || 'text.secondary', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography
                variant="caption"
                sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block', mb: 0.25 }}
            >
                {label}
            </Typography>
            <Typography variant="body2" sx={{ color: accent || 'text.primary', fontWeight: 500, wordBreak: 'break-word' }}>
                {value}
            </Typography>
        </Box>
    </Box >
);

/* ──────────────────────────────────────────────────────── */

const parseCalculatedMaterials = (mats: any) => {
    if (!mats) return { components: [], dimensions: {}, materials: [] };
    if (typeof mats === 'string') {
        try {
            return JSON.parse(mats);
        } catch (e) {
            console.error('Failed to parse calculatedMaterials:', e);
            return { components: [], dimensions: {}, materials: [] };
        }
    }
    return mats;
};

/* ─── TabPanel ─────────────────────────────────────────── */

function TabPanel({ children, value, index }: { children?: React.ReactNode; index: number; value: number }) {
    return (
        <div role="tabpanel" hidden={value !== index} id={`wo-tp-${index}`}>
            {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
        </div>
    );
}

/* ─── WorkOrderItemRow ─────────────────────────────────── */

function WorkOrderItemRow({ item, idx }: { item: any, idx: number }) {
    const [open, setOpen] = useState(false);

    const calc = parseCalculatedMaterials(item.calculatedMaterials);
    const dims = calc.dimensions;
    const mats: any[] = Array.isArray(calc.materials) ? calc.materials : [];
    const comps: any[] = Array.isArray(calc.components) ? calc.components : [];

    const hasDims = dims && (dims.height > 0 || dims.width > 0);
    const hasComps = comps.length > 0;

    // Автоматически открываем аккордеон, если это ЗН "Деталировка (BOM)" или компонентов мало
    React.useEffect(() => {
        if (hasComps && (item.operationName === 'BOM-расчёт деталей' || comps.length <= 10)) {
            setOpen(true);
        }
    }, [hasComps, item.operationName, comps.length]);

    return (
        <React.Fragment>
            <TableRow
                hover
                onClick={() => hasComps && setOpen(!open)}
                sx={{
                    '&:last-child col': { borderBottom: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: hasComps ? 'pointer' : 'default'
                }}
            >
                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: open ? 'none' : undefined }}>
                    {hasComps ? (
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                            sx={{ color: 'text.secondary', p: 0.5, ml: -1 }}
                        >
                            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 26, ml: -1 }} /> /* Placeholder for alignment */
                    )}
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{idx + 1}</Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: open ? 'none' : undefined }}>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        {item.productName || 'Без названия'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>ID: {item.productId}</Typography>
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: open ? 'none' : undefined }}>
                    <Chip
                        size="small"
                        label={`${item.quantity} ${item.unit}`}
                        sx={{ bgcolor: alpha('#38bdf8', 0.1), color: 'info.main', fontWeight: 600, fontSize: '0.75rem' }}
                    />
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: open ? 'none' : undefined }}>
                    {hasDims ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <StraightenIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary', fontWeight: 500 }}>
                                {dims.height}×{dims.width}
                                {dims.depth > 0 ? `×${dims.depth}` : ''}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
                    )}
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: open ? 'none' : undefined }}>
                    <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: item.estimatedHours > 0 ? 'info.main' : 'text.disabled' }}
                    >
                        {item.estimatedHours > 0 ? `${item.estimatedHours} ч` : '—'}
                    </Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: open ? 'none' : undefined }}>
                    <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: item.pieceRate > 0 ? 'success.main' : 'text.disabled' }}
                    >
                        {item.pieceRate > 0 ? `${item.pieceRate} ₽` : '—'}
                    </Typography>
                </TableCell>
                <TableCell sx={{ borderBottom: open ? 'none' : undefined }}>
                    {mats.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {mats.map((m: any, mi: number) => (
                                <Chip
                                    key={mi}
                                    size="small"
                                    icon={<CategoryIcon sx={{ fontSize: '14px !important' }} />}
                                    label={`${m.materialName}: ${m.quantity} ${m.unit}`}
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'divider',
                                        color: 'text.secondary',
                                        fontSize: '0.7rem',
                                        height: 24,
                                        '& .MuiChip-icon': { color: 'text.secondary' },
                                    }}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
                    )}
                </TableCell>
            </TableRow>
            {hasComps && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderBottom: open ? '1px solid rgba(81, 81, 81, 1)' : 'none' }} colSpan={7}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1.5, mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, mb: 1, display: 'block' }}>
                                    СПЕЦИФИКАЦИЯ ДЕТАЛЕЙ ДЛЯ ИЗДЕЛИЯ (BOM)
                                </Typography>
                                <Table size="small" aria-label="components" sx={{ '& .MuiTableCell-root': { borderBottom: 1, borderColor: 'divider', color: 'text.primary', py: 1.5 } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>Деталь / Компонент</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', width: 100 }}>Длина</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', width: 100 }}>Ширина</TableCell>
                                            <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', width: 100 }}>Толщина</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', width: 100 }}>Кол-во</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {comps.map((comp, i) => (
                                            <TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                        {comp.name}
                                                    </Typography>
                                                    {comp.childProductName && (
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                            <Box component="span" sx={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', bgcolor: 'info.main' }} />
                                                            Вложенный продукт: <span style={{ color: 'text.secondary' }}>{comp.childProductName}</span>
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {comp.length > 0 ? `${comp.length} мм` : '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {comp.width > 0 ? `${comp.width} мм` : '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        {comp.depth > 0 ? `${comp.depth} мм` : '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        size="small"
                                                        label={`${comp.quantity} шт`}
                                                        sx={{ bgcolor: alpha('#eab308', 0.1), color: 'warning.main', fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}

/* ─── Page ─────────────────────────────────────────────── */

export const WorkOrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [positionsViewMode, setPositionsViewMode] = useState<'products' | 'components'>('products');
    const [groupComponents, setGroupComponents] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const workOrderId = parseInt(id || '0');
    const { workOrder, isLoading } = useWorkOrder(workOrderId);
    const { statuses, isLoading: isLoadingStatuses } = useWorkOrderStatuses();

    const { assignWorkOrder } = useAssignWorkOrder();
    const { startWorkOrder } = useStartWorkOrder();
    const { sendToQualityCheck } = useSendToQualityCheck();
    const { completeWorkOrder } = useCompleteWorkOrder();
    const { cancelWorkOrder } = useCancelWorkOrder();

    const handleTabChange = (_e: React.SyntheticEvent, v: number) => setTabValue(v);

    const handleCancel = async () => {
        if (!cancelReason) return;
        await cancelWorkOrder(workOrderId, cancelReason);
        setCancelDialogOpen(false);
        setCancelReason('');
    };

    /* loading */
    if (isLoading || isLoadingStatuses) {
        return (
            <MainLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }
    if (!workOrder) return <MainLayout><Typography>Заказ-наряд не найден</Typography></MainLayout>;

    /* status helpers */
    const currentStatus = statuses.find(s => s.code === workOrder.status);
    const statusColor = currentStatus?.color || '#808080';
    const statusName = currentStatus?.name || workOrder.status;
    const isFinalStatus = currentStatus?.isFinal || false;

    const sortedStatuses = [...statuses].filter(s => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sortedStatuses.findIndex(s => s.code === workOrder.status);
    const nextStatus = currentIndex >= 0 && currentIndex < sortedStatuses.length - 1 ? sortedStatuses[currentIndex + 1] : null;

    const handleNextStatus = async () => {
        switch (workOrder.status) {
            case 'PLANNED': await assignWorkOrder(workOrderId); break;
            case 'ASSIGNED': await startWorkOrder(workOrderId); break;
            case 'IN_PROGRESS': await sendToQualityCheck(workOrderId); break;
            case 'QUALITY_CHECK': await completeWorkOrder(workOrderId); break;
        }
    };

    const prio = priorityMeta(workOrder.effectivePriority);

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>

                {/* ── back ────────────────────── */}
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/work-orders')} sx={{ mb: 2, color: 'text.secondary' }}>
                    Назад к списку
                </Button>

                {/* ══════════════ HEADER ══════════════ */}
                <GlassCard sx={{ mb: 3, p: { xs: 2, md: 3 } }}>
                    {/* top row */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        {/* left: number + order */}
                        <Box>
                            <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>
                                {workOrder.workOrderNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                Заказ&nbsp;
                                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>{workOrder.orderNumber}</Box>
                            </Typography>
                        </Box>

                        {/* right: status + cost */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Chip
                                label={statusName}
                                sx={{
                                    backgroundColor: alpha(statusColor, 0.1),
                                    color: statusColor,
                                    fontWeight: 600,
                                    border: `1px solid ${alpha(statusColor, 0.35)}`,
                                    fontSize: '0.8rem',
                                    px: 0.5,
                                }}
                            />
                            {workOrder.totalPieceRatePayment > 0 && (
                                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                                    {workOrder.totalPieceRatePayment.toLocaleString('ru-RU')} ₽
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* ── status stepper ── */}
                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Stepper activeStep={currentIndex} alternativeLabel sx={{
                            '& .MuiStepLabel-label': { fontSize: '0.7rem', color: 'text.secondary' },
                            '& .MuiStepLabel-label.Mui-active': { color: 'text.primary', fontWeight: 600 },
                            '& .MuiStepLabel-label.Mui-completed': { color: 'text.secondary' },
                            '& .MuiStepIcon-root': { color: 'action.disabled' },
                            '& .MuiStepIcon-root.Mui-active': { color: statusColor },
                            '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
                            '& .MuiStepConnector-line': { borderColor: 'divider' },
                        }}>
                            {sortedStatuses.map(s => (
                                <Step key={s.id} completed={sortedStatuses.indexOf(s) < currentIndex}>
                                    <StepLabel>{s.name}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <Divider sx={{ borderColor: 'divider', my: 2 }} />

                    {/* ── action buttons ── */}
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {nextStatus && !isFinalStatus && (
                            <Button
                                variant="contained"
                                startIcon={
                                    workOrder.status === 'PLANNED' ? <AssignmentIcon /> :
                                        workOrder.status === 'ASSIGNED' ? <PlayArrowIcon /> :
                                            <CheckCircleIcon />
                                }
                                onClick={handleNextStatus}
                                sx={{
                                    backgroundColor: nextStatus.color,
                                    fontWeight: 600,
                                    '&:hover': { backgroundColor: alpha(nextStatus.color, 0.85) },
                                }}
                            >
                                {nextStatus.name}
                            </Button>
                        )}
                        {!isFinalStatus && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={() => setCancelDialogOpen(true)}
                                sx={{ borderColor: alpha('#ef4444', 0.4) }}
                            >
                                Отменить
                            </Button>
                        )}
                    </Box>
                </GlassCard>

                {/* ══════════════ TABS ══════════════ */}
                <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, color: 'text.secondary', minHeight: 48 },
                                '& .Mui-selected': { color: 'text.primary !important' },
                                '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: 2 },
                            }}
                        >
                            <Tab label="Информация" />
                            <Tab label="Позиции" />
                            <Tab label="Заметки" />
                        </Tabs>
                    </Box>

                    {/* ── Info tab ── */}
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ px: 3, pb: 3 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<FactoryIcon fontSize="small" />} label="Цех / Участок" value={workOrder.departmentName} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<BuildIcon fontSize="small" />} label="Операция" value={workOrder.operationName} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<CalendarTodayIcon fontSize="small" />} label="Дедлайн" value={fmtDate(workOrder.deadline)} accent={workOrder.effectivePriority >= 9 ? 'error.main' : undefined} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<PriorityHighIcon fontSize="small" />} label="Приоритет" value={<><Chip size="small" label={prio.label} sx={{ backgroundColor: alpha(prio.color, 0.1), color: prio.color, fontWeight: 600, fontSize: '0.7rem', height: 22 }} /> <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>({workOrder.effectivePriority})</Box></>} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<AccessTimeIcon fontSize="small" />} label="Норма (всего)" value={fmt(workOrder.totalEstimatedHours, 'ч')} accent="#38bdf8" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<AttachMoneyIcon fontSize="small" />} label="Стоимость" value={fmt(workOrder.totalPieceRatePayment, '₽')} accent="#22c55e" />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<CalendarTodayIcon fontSize="small" />} label="Создан" value={fmtDate(workOrder.createdAt)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <InfoTile icon={<CalendarTodayIcon fontSize="small" />} label="Обновлён" value={fmtDate(workOrder.updatedAt)} />
                                </Grid>
                            </Grid>
                        </Box>
                    </TabPanel>

                    {/* ── Positions tab ── */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ px: { xs: 1, md: 3 }, pb: 3 }}>
                            {/* Toolbar for Positions tab */}
                            <Box sx={{
                                mb: 2.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2,
                                bgcolor: 'action.hover',
                                p: 1.5,
                                borderRadius: 2,
                                border: 1, borderColor: 'divider'
                            }}>
                                <ToggleButtonGroup
                                    value={positionsViewMode}
                                    exclusive
                                    onChange={(_e, val) => val && setPositionsViewMode(val)}
                                    size="small"
                                    sx={{
                                        '& .MuiToggleButton-root': {
                                            color: 'text.secondary',
                                            borderColor: 'divider',
                                            px: 2,
                                            '&.Mui-selected': {
                                                color: 'info.main',
                                                bgcolor: alpha('#38bdf8', 0.1),
                                                '&:hover': { bgcolor: alpha('#38bdf8', 0.15) }
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="products">
                                        <ViewModuleIcon sx={{ mr: 1, fontSize: 18 }} />
                                        По изделиям
                                    </ToggleButton>
                                    <ToggleButton value="components">
                                        <ViewListIcon sx={{ mr: 1, fontSize: 18 }} />
                                        Списком деталей
                                    </ToggleButton>
                                </ToggleButtonGroup>

                                {positionsViewMode === 'components' && (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={groupComponents}
                                                onChange={(e) => setGroupComponents(e.target.checked)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'info.main' },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'info.main' }
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LayersIcon sx={{ fontSize: 16 }} />
                                                Группировать детали
                                            </Typography>
                                        }
                                    />
                                )}
                            </Box>

                            <TableContainer sx={{ backgroundColor: 'transparent', boxShadow: 'none', border: 'none', backdropFilter: 'none' }}>
                                {positionsViewMode === 'products' ? (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ width: 40 }}>№</TableCell>
                                                <TableCell>Продукт</TableCell>
                                                <TableCell align="center">Кол-во</TableCell>
                                                <TableCell align="center">Габариты</TableCell>
                                                <TableCell align="right">Норма</TableCell>
                                                <TableCell align="right">Ставка</TableCell>
                                                <TableCell>Материалы</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {workOrder.items.map((item, idx) => (
                                                <WorkOrderItemRow key={item.id} item={item} idx={idx} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    /* Flat Components List */
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Деталь / Компонент</TableCell>
                                                {!groupComponents && <TableCell>Изделие-родитель</TableCell>}
                                                <TableCell align="center">Длина</TableCell>
                                                <TableCell align="center">Ширина</TableCell>
                                                <TableCell align="center">Толщина</TableCell>
                                                <TableCell align="right">Всего шт</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(() => {
                                                const allComps: any[] = [];
                                                workOrder.items.forEach((item, itemIdx) => {
                                                    const calc = parseCalculatedMaterials(item.calculatedMaterials);
                                                    const comps = calc.components || [];
                                                    comps.forEach((c: any) => {
                                                        allComps.push({
                                                            ...c,
                                                            parentName: item.productName,
                                                            parentIdx: itemIdx + 1,
                                                            itemQuantity: item.quantity
                                                        });
                                                    });
                                                });

                                                if (allComps.length === 0) {
                                                    return (
                                                        <TableRow>
                                                            <TableCell colSpan={groupComponents ? 5 : 6} align="center" sx={{ py: 6 }}>
                                                                <Typography color="#64748b" variant="body2">
                                                                    Детали не расчитаны для данного заказа.
                                                                    Проверьте наличие тех. схем (BOM) для выбранных изделий.
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }

                                                if (groupComponents) {
                                                    const grouped = allComps.reduce((acc: any[], curr) => {
                                                        const key = `${curr.name}_${curr.length}_${curr.width}_${curr.depth}`;
                                                        const existing = acc.find(a => a.key === key);
                                                        if (existing) {
                                                            existing.quantity += curr.quantity;
                                                        } else {
                                                            acc.push({ ...curr, key });
                                                        }
                                                        return acc;
                                                    }, []);
                                                    // Sort by name, then length desc
                                                    grouped.sort((a, b) => a.name.localeCompare(b.name) || b.length - a.length);

                                                    return grouped.map((comp, i) => (
                                                        <TableRow key={i} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                                            <TableCell sx={{ py: 1.5 }}>
                                                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{comp.name}</Typography>
                                                                {comp.childProductName && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{comp.childProductName}</Typography>}
                                                            </TableCell>
                                                            <TableCell align="center" sx={{ fontFamily: 'monospace' }}>{comp.length} мм</TableCell>
                                                            <TableCell align="center" sx={{ fontFamily: 'monospace' }}>{comp.width} мм</TableCell>
                                                            <TableCell align="center" sx={{ fontFamily: 'monospace' }}>{comp.depth || '—'}</TableCell>
                                                            <TableCell align="right">
                                                                <Chip size="small" label={`${comp.quantity} шт`} sx={{ bgcolor: alpha('#eab308', 0.1), color: 'warning.main', fontWeight: 700 }} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ));
                                                }

                                                // Individual view (preserving parent grouping by default)
                                                return allComps.map((comp, i) => (
                                                    <TableRow key={i} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                                        <TableCell sx={{ py: 1.5 }}>
                                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{comp.name}</Typography>
                                                            {comp.childProductName && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{comp.childProductName}</Typography>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Box component="span" sx={{ color: 'text.secondary' }}>#{comp.parentIdx}</Box> {comp.parentName}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'monospace' }}>{comp.length} мм</TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'monospace' }}>{comp.width} мм</TableCell>
                                                        <TableCell align="center" sx={{ fontFamily: 'monospace' }}>{comp.depth || '—'}</TableCell>
                                                        <TableCell align="right">
                                                            <Chip size="small" label={`${comp.quantity} шт`} sx={{ bgcolor: alpha('#38bdf8', 0.1), color: 'info.main', fontWeight: 600 }} />
                                                        </TableCell>
                                                    </TableRow>
                                                ));
                                            })()}
                                        </TableBody>
                                    </Table>
                                )}
                            </TableContainer>

                            {/* summary row */}
                            {workOrder.items.length > 0 && (
                                <Box sx={{
                                    mt: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha('#22c55e', 0.1),
                                    border: '1px solid rgba(34,197,94,0.15)',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 4,
                                }}>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Итого норма</Typography>
                                        <Typography variant="body1" sx={{ color: 'info.main', fontWeight: 700 }}>
                                            {fmt(workOrder.totalEstimatedHours, 'ч')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Итого стоимость</Typography>
                                        <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 700 }}>
                                            {fmt(workOrder.totalPieceRatePayment, '₽')}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </TabPanel>

                    {/* ── Notes tab ── */}
                    <TabPanel value={tabValue} index={2}>
                        <Box sx={{ px: 3, pb: 3 }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                                {workOrder.notes || 'Нет заметок'}
                            </Typography>
                        </Box>
                    </TabPanel>
                </GlassCard>

                {/* ── Cancel dialog ── */}
                <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Отмена заказ-наряда</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Причина отмены"
                            fullWidth
                            multiline
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCancelDialogOpen(false)}>Назад</Button>
                        <Button onClick={handleCancel} color="error" variant="contained" disabled={!cancelReason.trim()}>
                            Отменить ЗН
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
};
