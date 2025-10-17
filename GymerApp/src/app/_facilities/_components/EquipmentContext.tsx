'use client';

import React, {createContext, useContext, useState, ReactNode} from 'react';

export interface EquipmentData {
  osm_id: string;
  user_id: string;
  name: string;
  identifier: string;
  type?: string;
  condition?: string;
  description?: string;
  maintenance_date?: string;
  quantity?: number;
}

interface EquipmentContextType {
  equipmentList: EquipmentData[];
  addEquipment: (equipment: EquipmentData) => void;
}

interface EquipmentProviderProps {
  children: ReactNode;
}

const EquipmentContext = createContext<EquipmentContextType | null>(null);

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({
  children,
}) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentData[]>([]);

  const addEquipment = (equipment: EquipmentData) => {
    setEquipmentList(prev => [...prev, equipment]);
  };

  return (
    <EquipmentContext.Provider value={{equipmentList, addEquipment}}>
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipment = (): EquipmentContextType => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
};
