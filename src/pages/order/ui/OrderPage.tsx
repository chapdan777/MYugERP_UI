/**
 * Страница редактирования заказа
 */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { MainLayout } from '@widgets/layout';
import { OrderHeaderForm, OrderMaterialForm, ElementsTable } from '@features/order';
import type { FacadeElement } from '@entities/order';

/** Тестовые данные для фасадных элементов */
const facadeElementsData: FacadeElement[] = [
  { id: 1, name: 'Фасад глухой', length: 716, width: 256, quantity: 3, comment: '' },
  { id: 2, name: '', length: 916, width: 352, quantity: 2, comment: '' },
  { id: 3, name: '', length: 356, width: 715, quantity: 1, comment: '' },
  { id: 4, name: 'Фасад витрина', length: 915, width: 356, quantity: 3, comment: '' },
];

/** Тестовые данные для карнизных элементов */
const corniceElementsData: FacadeElement[] = [
  { id: 1, name: 'Карниз Элит', length: 716, width: 256, quantity: 3, comment: '' },
  { id: 2, name: '', length: 916, width: 352, quantity: 2, comment: '' },
  { id: 3, name: '', length: 356, width: 715, quantity: 1, comment: '' },
  { id: 4, name: 'Цоколь прямой', length: 915, width: 356, quantity: 3, comment: '' },
];

/**
 * Страница заказа с формами и таблицами
 */
export const OrderPage = () => {
  return (
    <MainLayout orderNumber="12345">
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Форма основных данных заказа */}
        <OrderHeaderForm />

        {/* Форма характеристик материала */}
        <OrderMaterialForm />

        {/* Таблицы элементов */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ElementsTable
              title="Фасадные элементы"
              elements={facadeElementsData}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ElementsTable
              title="Карнизные элементы"
              elements={corniceElementsData}
            />
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};
