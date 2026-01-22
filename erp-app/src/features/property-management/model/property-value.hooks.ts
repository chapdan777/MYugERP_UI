import { useState, useCallback } from 'react';
import { apiClient } from '../../../shared/api/client';

export interface PropertyValue {
  id: number;
  propertyId: number;
  value: string;
  priceModifierId: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyValueRequest {
  propertyId: number;
  value: string;
  priceModifierId?: number | null;
  displayOrder?: number;
}

export interface UpdatePropertyValueRequest {
  value?: string;
  priceModifierId?: number | null;
  displayOrder?: number;
  isActive?: boolean;
}

export const usePropertyValues = (propertyId: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertyValues = useCallback(async (): Promise<PropertyValue[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/property-values/by-property/${propertyId}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка загрузки значений свойства');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  return {
    fetchPropertyValues,
    loading,
    error,
  };
};

export const useCreatePropertyValue = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPropertyValue = useCallback(async (data: CreatePropertyValueRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/property-values', data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка создания значения свойства');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPropertyValue,
    loading,
    error,
  };
};

export const useUpdatePropertyValue = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePropertyValue = useCallback(async (id: number, data: UpdatePropertyValueRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.put(`/property-values/${id}`, data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка обновления значения свойства');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updatePropertyValue,
    loading,
    error,
  };
};