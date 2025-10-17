// __tests__/AddFacilityButton.test.tsx
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {AddFacilityButton} from '../AddFacilityButton';
import {addFacility} from '@/server/api/facilities';

jest.mock('@/server/api/facilities', () => ({
  addFacility: jest.fn(),
}));

describe('AddFacilityButton', () => {
  const mockFacility = {
    osm_id: '456',
    id: '123',
    name: 'Test Facility',
    location: '123 Main St',
    type: 'Gym',
    contact: 'test@example.com',
    leisure: 'fitness',
    lat: 1,
    lon: 2,
    address: '1234 Street',
    accessibility: 'door',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button correctly', () => {
    render(<AddFacilityButton facility={mockFacility} />);

    const button = screen.getByRole('button', {name: /Add Facility/i});
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Add Facility');
  });

  it('calls addFacility with the correct facility data when clicked', () => {
    render(<AddFacilityButton facility={mockFacility} />);

    const button = screen.getByRole('button', {name: /Add Facility/i});
    fireEvent.click(button);

    expect(addFacility).toHaveBeenCalledTimes(1);
    expect(addFacility).toHaveBeenCalledWith(mockFacility);
  });

  it('does not fail when clicked multiple times', () => {
    render(<AddFacilityButton facility={mockFacility} />);

    const button = screen.getByRole('button', {name: /Add Facility/i});
    fireEvent.click(button);
    fireEvent.click(button);

    expect(addFacility).toHaveBeenCalledTimes(2);
    expect(addFacility).toHaveBeenCalledWith(mockFacility);
  });
});
