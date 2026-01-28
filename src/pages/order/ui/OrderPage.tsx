import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { MainLayout } from '@widgets/layout';
import { OrderHeaderForm, OrderMaterialForm, ElementsTable } from '@features/manage-order';
import type { FacadeElement, OrderFormData, OrderConfiguration } from '@entities/order';
import { orderApi } from '@shared/api/order';
import { PROPERTY_IDS } from '@shared/api/order/types';
import type { CreateOrderDto, OrderPropertyDto } from '@shared/api/order/types';

/** Тестовые данные для карнизных элементов */
const corniceElementsDataInitial: FacadeElement[] = [
  { id: 1, name: 'Карниз Элит', length: 716, width: 256, quantity: 3, comment: '' },
];

export const OrderPage = () => {
  // State for Header Form
  const [headerData, setHeaderData] = useState<OrderFormData>({
    documentType: 'Фасады',
    clientName: 'Абдрахманов Саул',
    orderName: 'Диванный Конструктор 2,013',
    orderDate: '16.02.2017',
    launchDate: '17.02.2017',
    deadline: 'Неделя',
    lineNumber: '#12345',
    manager: 'Да версия',
  });

  // State for Material Form
  const [materialData, setMaterialData] = useState<OrderConfiguration>({
    material: 'Ротанг',
    texture: 'Витая',
    facadeModel: 'Ясень',
    additive: '-',
    thermalSeam: '+',
    panelModel: 'Стандарт с рубашкой 1.5мм',
    panelMaterial: 'Ясень',
    color: 'Белый',
    patina: 'Золотая',
    gloss: 'Легкий глянец',
    additionalParams: 'Непрокрашенная пора',
    comment: 'Рамка без термошва! Нанесение патины стандартное не напылением!',
  });

  // State for Elements Tables
  const [facadeElements, setFacadeElements] = useState<FacadeElement[]>([
    { id: 1, name: 'Фасад глухой', length: 716, width: 256, quantity: 3, comment: '' },
  ]);
  const [corniceElements, setCorniceElements] = useState<FacadeElement[]>(corniceElementsDataInitial);

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Map Material Data to Property Values (Section Level)
      const propertyValues: OrderPropertyDto[] = [
        { propertyId: PROPERTY_IDS.material, propertyName: 'Материал', propertyCode: 'MAT', value: materialData.material },
        { propertyId: PROPERTY_IDS.texture, propertyName: 'Текстура', propertyCode: 'TEX', value: materialData.texture },
        { propertyId: PROPERTY_IDS.facadeModel, propertyName: 'Модель фасада', propertyCode: 'MOD', value: materialData.facadeModel },
        { propertyId: PROPERTY_IDS.color, propertyName: 'Цвет', propertyCode: 'COL', value: materialData.color },
        // Add other mapped properties here...
      ];

      // 2. Map Elements to Items
      // Combine both tables for now into one section "Фасады"
      const allElements = [...facadeElements, ...corniceElements];

      const items = allElements.map(el => ({
        productId: 1, // Placeholder Product ID (must be real ID in prod)
        quantity: el.quantity,
        unit: 'шт', // Default unit
        length: el.length,
        width: el.width,
        properties: [] // Individual item overrides could go here
      }));

      // 3. Construct DTO
      const orderDto: CreateOrderDto = {
        clientId: 1, // Placeholder Client ID
        clientName: headerData.clientName,
        notes: materialData.comment, // Using material comment as order notes for now
        sections: [
          {
            sectionNumber: 1,
            sectionName: headerData.documentType,
            propertyValues: propertyValues,
            items: items
          }
        ]
      };

      // 4. Call API
      await orderApi.createOrder(orderDto);

      setNotification({ open: true, message: 'Заказ успешно создан!', severity: 'success' });
    } catch (error) {
      console.error('Failed to create order:', error);
      setNotification({ open: true, message: 'Ошибка при создании заказа', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout orderNumber={headerData.lineNumber}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить заказ'}
          </Button>
        </Box>

        <OrderHeaderForm
          initialData={headerData}
          onChange={setHeaderData}
        />

        <OrderMaterialForm
          initialData={materialData}
          onChange={setMaterialData}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ElementsTable
              title="Фасадные элементы"
              elements={facadeElements}
              onChange={setFacadeElements}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ElementsTable
              title="Карнизные элементы"
              elements={corniceElements}
              onChange={setCorniceElements}
            />
          </Grid>
        </Grid>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};
