
import { useState, useEffect } from 'react';
import { Property } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = () => {
    setIsLoading(true);
    try {
      const allProperties = JSON.parse(localStorage.getItem('apevenues_properties') || '[]');
      const userProperties = allProperties.filter((p: Property) => p.businessId === user?.id);
      setProperties(userProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    }
    setIsLoading(false);
  };

  const addProperty = (propertyData: Omit<Property, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    const newProperty: Property = {
      ...propertyData,
      id: Date.now().toString(),
      businessId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allProperties = JSON.parse(localStorage.getItem('apevenues_properties') || '[]');
    allProperties.push(newProperty);
    localStorage.setItem('apevenues_properties', JSON.stringify(allProperties));
    
    setProperties(prev => [...prev, newProperty]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const allProperties = JSON.parse(localStorage.getItem('apevenues_properties') || '[]');
    const propertyIndex = allProperties.findIndex((p: Property) => p.id === id);
    
    if (propertyIndex !== -1) {
      allProperties[propertyIndex] = {
        ...allProperties[propertyIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('apevenues_properties', JSON.stringify(allProperties));
      
      setProperties(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ));
    }
  };

  const deleteProperty = (id: string) => {
    const allProperties = JSON.parse(localStorage.getItem('apevenues_properties') || '[]');
    const filteredProperties = allProperties.filter((p: Property) => p.id !== id);
    localStorage.setItem('apevenues_properties', JSON.stringify(filteredProperties));
    
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return {
    properties,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
    refreshProperties: loadProperties,
  };
};
