/**
 * Типы для сущности заказа
 */

/** Статусы заказа */
export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PRODUCTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

/** Статусы оплаты */
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

/**
 * Свойство позиции заказа
 */
export interface ItemProperty {
  propertyId: number;
  propertyName: string;
  value: string;
}

/**
 * Позиция заказа
 */
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  /** Длина в мм */
  length?: number;
  /** Ширина в мм */
  width?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  properties: ItemProperty[];
  comment?: string;
}

/**
 * Секция заказа
 */
export interface OrderSection {
  id: number;
  sectionNumber: number;
  name: string;
  description?: string;
  items: OrderItem[];
}

/**
 * Заказ
 */
export interface Order {
  id: number;
  orderNumber: string;
  clientId: number;
  clientName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  deadline: string;
  notes?: string;
  sections?: OrderSection[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Данные основного заказа (шапка формы)
 */
export interface OrderFormData {
  /** Тип документа */
  documentType: string;
  /** Клиент */
  clientName: string;
  /** Заказ */
  orderName: string;
  /** Дата оформления */
  orderDate: string;
  /** Дата запуска */
  launchDate: string;
  /** Срок (в неделях) */
  deadline: string;
  /** Строка # */
  lineNumber: string;
  /** Менеджер */
  manager: string;
}

/**
 * Характеристики материала заказа
 */
export interface OrderMaterialData {
  /** Материал заказа */
  material: string;
  /** Текстура */
  texture: string;
  /** Модель фасада */
  facadeModel: string;
  /** Присадка */
  additive: string;
  /** Термошов */
  thermalSeam: string;
  /** Модель филенки */
  panelModel: string;
  /** Материал филенки */
  panelMaterial: string;
  /** Цвет */
  color: string;
  /** Патина */
  patina: string;
  /** Глянцевость */
  gloss: string;
  /** Дополнительные параметры отделки */
  additionalParams: string;
  /** Комментарий */
  comment: string;
}

/**
 * Элемент таблицы фасадных/карнизных элементов
 */
export interface FacadeElement {
  id: number;
  name: string;
  length: number;
  width: number;
  quantity: number;
  comment?: string;
}

/**
 * DTO для создания заказа
 */
export interface CreateOrderDto {
  clientId: number;
  clientName: string;
  deadline: string;
  notes?: string;
}

/**
 * DTO для обновления статуса заказа
 */
export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}
