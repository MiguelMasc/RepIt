import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  EquipmentProvider,
  useEquipment,
  EquipmentData,
} from '../EquipmentContext';

// Mock component to test the context
const MockComponent: React.FC = () => {
  const {equipmentList, addEquipment} = useEquipment();

  const handleAddEquipment = () => {
    const newEquipment: EquipmentData = {
      osm_id: '123',
      user_id: 'user_1',
      name: 'Treadmill',
      identifier: 'T123',
      type: 'cardio',
      condition: 'excellent',
      description: 'High-end treadmill with multiple features',
      maintenance_date: '2024-11-01',
      quantity: 1,
    };
    addEquipment(newEquipment);
  };

  return (
    <div>
      <button onClick={handleAddEquipment}>Add Equipment</button>
      {equipmentList.map(equipment => (
        <div key={equipment.osm_id}>{equipment.name}</div>
      ))}
    </div>
  );
};

describe('EquipmentContext', () => {
  it('renders children correctly', () => {
    render(
      <EquipmentProvider>
        <div>Test Child</div>
      </EquipmentProvider>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('throws an error if useEquipment is used outside EquipmentProvider', () => {
    const TestComponent = () => {
      useEquipment(); // This will throw an error
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useEquipment must be used within an EquipmentProvider',
    );
  });

  test('adds equipment correctly', async () => {
    render(
      <EquipmentProvider>
        <MockComponent />
      </EquipmentProvider>,
    );

    const addButton = screen.getByText('Add Equipment');
    await userEvent.click(addButton);

    expect(screen.getByText('Treadmill')).toBeInTheDocument();
  });
});
