import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { MainLayout } from '@widgets/layout';
import { OrderHeaderForm } from '@features/manage-order';
import { OrderSection } from '@features/order/ui/OrderSection';
import type { OrderFormData } from '@entities/order';
import { orderApi } from '@shared/api/order';
import type { CreateOrderDto, CreateOrderSectionDto } from '@shared/api/order/types';
import { useWorkOrders, useGenerateWorkOrders } from '@features/manage-work-orders/model/work-orders.hooks';
import { propertyHeadersApi } from '@shared/api/property-headers';
import type { PropertyHeader } from '@shared/api/property-headers/types';
import { useOrderDraft, hasDraft, getDraft, clearDraft } from '@features/order/model/useOrderDraft';
import { useUsers } from '@features/manage-users/model/user.hooks';

const EMPTY_HEADER: OrderFormData = {
  documentType: 'Фасады',
  clientName: '',
  orderName: '',
  orderDate: new Date().toLocaleDateString('ru-RU'),
  launchDate: new Date().toLocaleDateString('ru-RU'),
  deadline: '',
  lineNumber: '',
  manager: '',
};

export const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // 1. Order Header State
  const [headerData, setHeaderData] = useState<OrderFormData>({ ...EMPTY_HEADER });

  // 2. Sections State
  const [sections, setSections] = useState<CreateOrderSectionDto[]>([]);

  // 3. UI State
  const [isBindingLoading, setIsBindingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [availableHeaders, setAvailableHeaders] = useState<PropertyHeader[]>([]);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 4. Draft restore dialog
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // 5. Draft auto-save (только для нового заказа)
  useOrderDraft(headerData, sections, !isEditMode);

  // Work Orders Logic
  const parsedId = id ? parseInt(id) : undefined;
  const { workOrders } = useWorkOrders(parsedId ? { orderId: parsedId } : { orderId: -1 });
  const { generateWorkOrders, regenerateWorkOrders } = useGenerateWorkOrders();
  const [isGeneratingWO, setIsGeneratingWO] = useState(false);

  const handleGenerateWO = async () => {
    if (!parsedId) return;
    setIsGeneratingWO(true);
    try {
      await generateWorkOrders(parsedId);
      setNotification({ open: true, message: 'Заказ-наряды сгенерированы', severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: 'Ошибка генерации ЗН', severity: 'error' });
    } finally {
      setIsGeneratingWO(false);
    }
  };

  const handleRegenerateWO = async () => {
    if (!parsedId) return;
    if (!window.confirm('Это действие отменит текущие заказ-наряды и создаст новые. Продолжить?')) return;

    setIsGeneratingWO(true);
    try {
      await regenerateWorkOrders(parsedId);
      setNotification({ open: true, message: 'Заказ-наряды перегенерированы', severity: 'success' });
    } catch (e) {
      setNotification({ open: true, message: 'Ошибка перегенерации ЗН', severity: 'error' });
    } finally {
      setIsGeneratingWO(false);
    }
  };

  // Проверка черновика при первом открытии (только новый заказ)
  useEffect(() => {
    if (!isEditMode && hasDraft()) {
      setShowDraftDialog(true);
    }
  }, [isEditMode]);

  const handleRestoreDraft = () => {
    const draft = getDraft();
    if (draft) {
      setHeaderData(draft.headerData);
      setSections(draft.sections);
      setNotification({ open: true, message: 'Черновик восстановлен', severity: 'success' });
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  // Load Order Logic
  useEffect(() => {
    if (isEditMode) {
      setIsBindingLoading(true);
      orderApi.getOrder(id)
        .then((order: any) => {
          // 1. Header
          setHeaderData({
            documentType: 'Фасады',
            clientName: order.clientName || '',
            orderName: order.notes ? order.notes.replace('Заказ: ', '') : '',
            orderDate: new Date(order.createdAt).toLocaleDateString('ru-RU'),
            launchDate: new Date(order.createdAt).toLocaleDateString('ru-RU'),
            deadline: order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : '',
            lineNumber: order.orderNumber,
            manager: '',
          });

          // 2. Sections
          if (order.sections) {
            const mappedSections = order.sections.map((section: any) => {
              const firstItem = section.items?.[0];
              const sectionPropertyValues = firstItem?.properties?.map((prop: any) => ({
                propertyId: prop.propertyId,
                propertyName: prop.propertyName,
                propertyCode: prop.propertyCode,
                value: prop.value
              })) || [];

              return {
                sectionNumber: section.sectionNumber,
                sectionName: section.name,
                headerId: section.headerId,
                propertyValues: sectionPropertyValues,
                items: section.items.map((item: any) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  unit: item.unit === 2 ? 'м2' : item.unit === 3 ? 'п.м.' : 'шт',
                  length: item.length,
                  width: item.width,
                  depth: item.depth,
                  note: item.notes,
                  basePrice: item.basePrice,
                  finalPrice: item.finalPrice,
                  properties: item.properties.map((prop: any) => ({
                    propertyId: prop.propertyId,
                    propertyName: prop.propertyName,
                    propertyCode: prop.propertyCode,
                    value: prop.value
                  }))
                }))
              };
            });
            setSections(mappedSections);
          }
        })
        .catch(err => {
          console.error(err);
          setNotification({ open: true, message: 'Не удалось загрузить заказ', severity: 'error' });
        })
        .finally(() => setIsBindingLoading(false));
    }
  }, [id, isEditMode]);

  // Load headers when "Add Section" is opened
  useEffect(() => {
    if (isAddingSection) {
      propertyHeadersApi.getAll({ isActive: true })
        .then(setAvailableHeaders)
        .catch(console.error);
    }
  }, [isAddingSection]);

  const handleAddSection = (header: PropertyHeader) => {
    const newSection: CreateOrderSectionDto = {
      sectionNumber: sections.length + 1,
      sectionName: header.name,
      headerId: header.id,
      propertyValues: [],
      items: []
    };
    setSections([...sections, newSection]);
    setIsAddingSection(false);
  };

  const handleRemoveSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    for (let i = index; i < newSections.length; i++) {
      newSections[i].sectionNumber = i + 1;
    }
    setSections(newSections);
  };

  const handleUpdateSection = (index: number, data: Partial<CreateOrderSectionDto>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...data };
    setSections(newSections);
  };

  const { users } = useUsers();

  /**
   * Безопасное преобразование строковой даты (DD.MM.YYYY или опции срока) в ISO формат
   */
  const formatDateToISO = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) return undefined;

    // 1. Обработка стандартных опций срока (превращаем в дату от "сегодня")
    if (dateStr.includes('7 дней')) return new Date(Date.now() + 7 * 86400000).toISOString();
    if (dateStr.includes('14 дней')) return new Date(Date.now() + 14 * 86400000).toISOString();
    if (dateStr.includes('35 дней')) return new Date(Date.now() + 35 * 86400000).toISOString();
    if (dateStr.includes('45 рабочих дней')) return new Date(Date.now() + 63 * 86400000).toISOString(); // ~9 недель

    // 2. Обработка формата DD.MM.YYYY
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const year = parseInt(parts[2]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[0]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // 3. Попытка прямого парсинга (если пришло из БД в ISO)
    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toISOString();
    }

    return undefined;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Пытаемся найти ID выбранного клиента
      const selectedClient = users?.find(u => u.fullName === headerData.clientName);
      const clientId: number = Number(selectedClient?.id || 1); // 1 - Default fallback

      const orderDto: CreateOrderDto = {
        clientId,
        clientName: headerData.clientName || 'Без названия',
        deadline: formatDateToISO(headerData.deadline),
        documentType: headerData.documentType,
        manager: headerData.manager,
        orderName: headerData.orderName,
        launchDate: formatDateToISO(headerData.launchDate),
        notes: `Заказ: ${headerData.orderName || 'Новый'}`,
        sections: sections
      };

      if (isEditMode && parsedId) {
        await orderApi.updateOrder(parsedId, orderDto);
        setNotification({ open: true, message: 'Заказ успешно обновлен!', severity: 'success' });
      } else {
        const newOrder = await orderApi.createOrder(orderDto);
        // Очищаем черновик после успешного сохранения
        clearDraft();
        setNotification({ open: true, message: 'Заказ успешно создан!', severity: 'success' });

        // Переходим к редактированию созданного заказа
        if (newOrder?.id) {
          navigate(`/orders/${newOrder.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to save order:', error);
      setNotification({ open: true, message: 'Ошибка при сохранении заказа', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    // Просто сбрасываем ID и номер строки, чтобы handleSave создал новый объект
    setHeaderData(prev => ({ ...prev, lineNumber: '' }));
    navigate('/orders/create'); // Меняем путь, чтобы сработал режим создания
    setNotification({ open: true, message: 'Заказ скопирован в новый. Отредактируйте и нажмите Сохранить.', severity: 'success' });
  };

  if (isBindingLoading) {
    return (
      <MainLayout orderNumber="LOADING...">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      orderNumber={headerData.lineNumber || (isEditMode ? '' : 'НОВЫЙ')}
      pageTitle={isEditMode ? 'Редактирование заказа' : 'Новый заказ'}
      onSave={handleSave}
      isSaving={isSaving}
      onAddSection={() => setIsAddingSection(true)}
      onGenerateWorkOrder={isEditMode && parsedId ? handleGenerateWO : undefined}
      onRegenerateWorkOrder={isEditMode && parsedId ? handleRegenerateWO : undefined}
      isGeneratingWO={isGeneratingWO}
      onNavigateWorkOrders={isEditMode && parsedId ? () => navigate(`/work-orders?orderId=${parsedId}`) : undefined}
      workOrdersCount={workOrders?.length}
      onSaveAsNew={isEditMode ? handleSaveAsNew : undefined}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
        {/* Technical Header */}
        <OrderHeaderForm
          initialData={headerData}
          onChange={setHeaderData}
        />

        <Box sx={{ my: 3 }}>
          {/* Sections List */}
          {sections.map((section, index) => (
            <OrderSection
              key={index}
              index={index}
              section={section}
              onRemove={handleRemoveSection}
              onUpdate={handleUpdateSection}
            />
          ))}

          {sections.length === 0 && (
            <Box sx={{
              textAlign: 'center',
              py: 5,
              color: 'text.secondary',
              bgcolor: 'action.hover',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
            }}>
              Нет добавленных секций. Нажмите «Добавить секцию» в шапке, чтобы начать формирование заказа.
            </Box>
          )}
        </Box>

        {/* Add Section Dialog */}
        <Dialog open={isAddingSection} onClose={() => setIsAddingSection(false)}>
          <DialogTitle>Выберите тип секции (Шапку)</DialogTitle>
          <DialogContent>
            <List>
              {availableHeaders.map(header => (
                <ListItemButton key={header.id} onClick={() => handleAddSection(header)}>
                  <ListItemText primary={header.name} secondary={header.description} />
                </ListItemButton>
              ))}
              {availableHeaders.length === 0 && (
                <ListItemText primary="Нет доступных шапок" />
              )}
            </List>
          </DialogContent>
        </Dialog>

        {/* Draft Restore Dialog */}
        <Dialog
          open={showDraftDialog}
          onClose={handleDiscardDraft}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestoreIcon color="primary" />
            Восстановить черновик?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              У вас есть несохранённый черновик заказа
              {getDraft()?.savedAt && (
                <> от <strong>{new Date(getDraft()!.savedAt).toLocaleString('ru-RU')}</strong></>
              )}.
              Хотите восстановить его?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDiscardDraft}
              startIcon={<DeleteOutlineIcon />}
              color="inherit"
            >
              Начать заново
            </Button>
            <Button
              onClick={handleRestoreDraft}
              variant="contained"
              startIcon={<RestoreIcon />}
            >
              Восстановить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification */}
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
