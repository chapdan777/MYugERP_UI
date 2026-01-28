/**
 * @file Управление продуктами шапки свойств
 * @description Компонент для добавления и управления номенклатурой (продуктами) в шапке
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Alert,
    CircularProgress,
    Autocomplete,
    TextField,
} from '@mui/material';
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';

import type { PropertyHeader } from '../model/types';
import {
    useGetHeaderProducts,
    useAddProductToHeader,
    useRemoveProductFromHeader
} from '../model/hooks';
import { useProducts } from '../../manage-products/model/product.hooks';
import type { Product } from '../../manage-products/model/types';

interface HeaderProductsManagementProps {
    header: PropertyHeader;
    open: boolean;
    onClose: () => void;
}

const HeaderProductsManagement: React.FC<HeaderProductsManagementProps> = ({
    header,
    open,
    onClose,
}) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Получаем продукты текущей шапки
    const { headerProducts, isLoading: headerProductsLoading } = useGetHeaderProducts(header.id);

    // Получаем все доступные продукты
    const { products, isLoading: productsLoading } = useProducts();

    // Хук для добавления продуктов
    const { addProductToHeader } = useAddProductToHeader();

    // Хук для удаления продуктов
    const { removeProductFromHeader } = useRemoveProductFromHeader();

    // Сброс формы при закрытии
    useEffect(() => {
        if (!open) {
            setSelectedProduct(null);
            setError(null);
        }
    }, [open]);

    const handleAddProduct = async () => {
        if (!selectedProduct) {
            setError('Выберите продукт');
            return;
        }

        try {
            await addProductToHeader(header.id, {
                productId: selectedProduct.id,
            });

            // Сбрасываем выбор
            setSelectedProduct(null);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка при добавлении продукта');
        }
    };

    const handleRemoveProduct = async (productId: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот продукт из шапки?')) {
            try {
                await removeProductFromHeader(header.id, productId);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Ошибка при удалении продукта');
            }
        }
    };

    // Получаем имя продукта по ID
    const getProductName = (productId: number) => {
        const product = products.find((p: Product) => p.id === productId);
        return product ? product.name : `Продукт ${productId}`;
    };

    const isLoading = headerProductsLoading || productsLoading;

    // Фильтрация уже добавленных продуктов из списка доступных
    const availableProducts = products.filter(
        (product) => !headerProducts.some((hp) => hp.productId === product.id)
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Управление номенклатурой шапки "{header.name}"
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Форма добавления продукта */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Добавить продукт в шапку
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Autocomplete
                            value={selectedProduct}
                            onChange={(_, newValue) => setSelectedProduct(newValue)}
                            options={availableProducts}
                            getOptionLabel={(option) => option.name}
                            sx={{ flex: 1 }}
                            loading={productsLoading}
                            disabled={isLoading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Выберите продукт"
                                    variant="outlined"
                                    fullWidth
                                />
                            )}
                        />

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddProduct}
                            disabled={isLoading || !selectedProduct}
                            sx={{ height: 56 }} // Match TextField height
                        >
                            Добавить
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Список продуктов шапки */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Продукты шапки ({headerProducts.length})
                    </Typography>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : headerProducts.length === 0 ? (
                        <Typography color="text.secondary">
                            В этой шапке пока нет продуктов
                        </Typography>
                    ) : (
                        <List>
                            {headerProducts.map((item, index) => (
                                <ListItem
                                    key={`${item.headerId}-${item.productId}-${index}`}
                                    divider
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1">
                                                {getProductName(item.productId)}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                Добавлено: {new Date(item.createdAt).toLocaleString('ru-RU')}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleRemoveProduct(item.productId)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default HeaderProductsManagement;
