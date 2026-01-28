# Property Headers Frontend Implementation

## Overview
Frontend implementation for Property Headers (Шапки ДС) module in MYugERP system.

## Implemented Components

### 1. Core Types (`/src/features/property-headers/model/types.ts`)
- `PropertyHeader` - основной интерфейс шапки свойств
- `PropertyHeaderItem` - интерфейс элемента шапки
- `CreatePropertyHeaderInput` - данные для создания шапки
- `UpdatePropertyHeaderInput` - данные для обновления шапки
- `AddItemToHeaderInput` - данные для добавления элемента в шапку

### 2. API Hooks (`/src/features/property-headers/model/hooks.ts`)
Custom hooks for interacting with Property Headers API:
- `useGetPropertyHeaders` - получение списка шапок
- `useGetPropertyHeaderById` - получение шапки по ID
- `useCreatePropertyHeader` - создание новой шапки
- `useUpdatePropertyHeader` - обновление шапки
- `useActivatePropertyHeader` - активация шапки
- `useDeactivatePropertyHeader` - деактивация шапки
- `useDeletePropertyHeader` - удаление шапки
- `useGetHeaderItems` - получение элементов шапки
- `useAddItemToHeader` - добавление элемента в шапку

### 3. UI Components

#### PropertyHeadersManagementPage (`/src/features/property-headers/ui/PropertyHeadersManagementPage.tsx`)
Main page component for managing property headers:
- Displays list of property headers in a table
- Provides forms for creating/editing headers
- Handles activation/deactivation and deletion
- Integrates item management functionality

#### PropertyHeaderForm (`/src/features/property-headers/ui/PropertyHeaderForm.tsx`)
Form component for creating and editing property headers:
- Fields: name, orderTypeId, description
- Validation and error handling
- Loading states support

#### PropertyHeadersTable (`/src/features/property-headers/ui/PropertyHeadersTable.tsx`)
Table component for displaying property headers:
- Shows header name, order type, description, status, creation date
- Action buttons: edit, add items, activate/deactivate, delete
- Responsive design with Material-UI components

#### HeaderItemsManagement (`/src/features/property-headers/ui/HeaderItemsManagement.tsx`)
Modal dialog for managing header items:
- Add properties to headers with values
- Display list of existing header items
- Integration with property management module
- Real-time updates using SWR

### 4. Integration Points

#### Data Management Page
Integrated into `/data-management` route under "Шапки заказов" tab.

#### Navigation Structure
```
Data Management
├── Users
├── Products  
├── Properties
├── Property Headers ← Our module
└── Property Values
```

## API Endpoints Used

All endpoints are protected with JWT authentication:

- `GET /api/property-headers` - Get all headers
- `POST /api/property-headers` - Create new header
- `GET /api/property-headers/:id` - Get header by ID
- `PUT /api/property-headers/:id` - Update header
- `POST /api/property-headers/:id/activate` - Activate header
- `POST /api/property-headers/:id/deactivate` - Deactivate header
- `DELETE /api/property-headers/:id` - Delete header
- `GET /api/property-headers/:headerId/items` - Get header items
- `POST /api/property-headers/:headerId/items` - Add item to header

## Dependencies

### External Libraries
- React 18+
- Material-UI (MUI) v5+
- SWR for data fetching
- Axios for HTTP requests
- React Router DOM v6+

### Internal Modules
- `@features/property-management` - for property selection in item management
- `@shared/api/client` - for API communication
- `@shared/config` - for API endpoint configuration

## Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3004/api
VITE_WS_URL=ws://localhost:3004/ws
```

### API Client Setup
Located in `/src/shared/api/client.ts`:
- Base URL configuration from environment
- JWT token interception
- Automatic token refresh
- Error handling and retry logic

## Features Implemented

✅ **CRUD Operations**
- Create, Read, Update, Delete property headers
- Form validation and error handling
- Loading states and user feedback

✅ **Status Management**
- Activate/Deactivate headers
- Visual status indicators in table

✅ **Item Management**
- Add properties with values to headers
- View existing header items
- Modal interface for item management

✅ **Responsive Design**
- Mobile-friendly layout
- Material-UI responsive components
- Proper spacing and typography

✅ **Real-time Updates**
- SWR cache invalidation
- Automatic data refresh after mutations
- Optimistic UI updates

## Testing Instructions

1. **Start Services**
   ```bash
   # Backend (port 3004)
   cd /erp-server && npm run start:dev
   
   # Frontend (port 3003)  
   cd /erp-app && npm run dev
   ```

2. **Access Application**
   - Open browser at `http://localhost:3003`
   - Navigate to "Управление данными" → "Шапки заказов"

3. **Test Functionality**
   - Create new property header
   - Edit existing headers
   - Add items to headers
   - Activate/deactivate headers
   - Delete headers

## Known Limitations

⚠️ **Missing Features**
- Bulk operations (batch create/update)
- Advanced filtering and sorting
- Export/import functionality
- Item deletion from headers
- Header duplication

⚠️ **Technical Debt**
- Some type casting uses `any` (needs proper typing)
- Limited error message localization
- No offline support
- Basic pagination not implemented

## Future Improvements

### Short-term
- Add item deletion functionality
- Implement proper TypeScript interfaces
- Add unit tests for hooks and components
- Improve error handling and user feedback

### Long-term
- Add bulk operations support
- Implement advanced search/filtering
- Add export/import capabilities
- Create reusable component library
- Add analytics and reporting

## Troubleshooting

### Common Issues

**API Connection Errors**
- Check if backend is running on port 3004
- Verify `.env` configuration in frontend
- Ensure proper JWT token is present in localStorage

**Authentication Issues**
- Clear browser localStorage
- Re-login to refresh tokens
- Check JWT expiration settings

**Data Not Loading**
- Verify database connectivity
- Check browser console for errors
- Confirm property headers table exists in database

### Debug Information

Enable debug logging by setting:
```typescript
localStorage.setItem('debug', 'property-headers:*');
```

Check browser console for detailed API request/response logs.