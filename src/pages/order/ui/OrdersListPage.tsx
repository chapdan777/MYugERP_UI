import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@widgets/layout';
import { orderApi } from '@shared/api/order';

export const OrdersListPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<any>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await orderApi.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrder = () => {
        navigate('/orders/create');
    };

    const handleOpenDeleteDialog = (order: any) => {
        setOrderToDelete(order);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            console.log('Confirmed deletion for ID:', orderToDelete.id);
            await orderApi.deleteOrder(orderToDelete.id);
            setOrders(currentOrders => currentOrders.filter(o => o.id !== orderToDelete.id));
            setDeleteDialogOpen(false);
            setOrderToDelete(null);
        } catch (error) {
            console.error('Failed to delete order:', error);
            alert(`Не удалось удалить заказ. Подробности в консоли: ${error}`);
        }
    };

    return (
        <MainLayout orderNumber="LIST">
            <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Список заказов</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateOrder}
                    >
                        Новый заказ
                    </Button>
                </Box>

                <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>№ Заказа</TableCell>
                                <TableCell>Клиент</TableCell>
                                <TableCell>Дата</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell align="right">Сумма</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">Заказов пока нет</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        hover
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{order.orderNumber}</TableCell>
                                        <TableCell>{order.clientName}</TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status || 'Черновик'}
                                                size="small"
                                                color={order.status === 'completed' ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(order.totalAmount || 0)}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(order); }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Удаление заказа</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить заказ {orderToDelete?.orderNumber}?
                        Это действие нельзя будет отменить.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </MainLayout>
    );
};
