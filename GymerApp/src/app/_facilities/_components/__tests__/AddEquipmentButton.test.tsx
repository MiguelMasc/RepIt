import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {AddEquipmentButton} from '../AddEquipmentButton';
import {useSession} from '@clerk/nextjs';

jest.mock('@clerk/nextjs', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({...props}: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({...props}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  SelectTrigger: ({children}: {children: React.ReactNode}) => (
    <button>{children}</button>
  ),
  SelectValue: () => <span>Select value</span>,
  SelectContent: ({children}: {children: React.ReactNode}) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <div onClick={onClick}>{children}</div>,
}));

describe('AddEquipmentButton', () => {
  const mockSession = {user: {id: 'user-123'}};
  const osm_id = 'facility-1';
  const facilityName = 'Test Facility';

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({session: mockSession});
  });

  it('renders the button and opens the form on click', () => {
    render(<AddEquipmentButton osm_id={osm_id} facilityName={facilityName} />);
    const button = screen.getByTestId('open-equipment-form');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    const formTitle = screen.getByText(`Add Equipment - ${facilityName}`);
    expect(formTitle).toBeInTheDocument();
  });

  it('displays an error message if user is not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({session: null});
    render(<AddEquipmentButton osm_id={osm_id} facilityName={facilityName} />);
    fireEvent.click(screen.getByTestId('open-equipment-form'));
    const submitButton = screen.getByTestId('submit-equipment-form');
    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByText('User not authenticated')).toBeInTheDocument(),
    );
  });

  it('submits the form with valid data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }),
    ) as jest.Mock;

    render(<AddEquipmentButton osm_id={osm_id} facilityName={facilityName} />);
    fireEvent.click(screen.getByTestId('open-equipment-form'));

    fireEvent.change(screen.getByPlaceholderText('Enter equipment name'), {
      target: {value: 'Treadmill'},
    });
    fireEvent.change(
      screen.getByPlaceholderText('Enter equipment description'),
      {
        target: {value: 'High-quality treadmill for cardio workouts'},
      },
    );
    fireEvent.change(screen.getByPlaceholderText('Enter quantity'), {
      target: {value: '2'},
    });

    const submitButton = screen.getByTestId('submit-equipment-form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/equipment',
        expect.any(Object),
      );
    });
  });

  it('shows an error message when the API call fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({error: 'Failed to add equipment'}),
      }),
    ) as jest.Mock;

    render(<AddEquipmentButton osm_id={osm_id} facilityName={facilityName} />);
    fireEvent.click(screen.getByTestId('open-equipment-form'));

    fireEvent.change(screen.getByPlaceholderText('Enter equipment name'), {
      target: {value: 'Bike'},
    });

    const submitButton = screen.getByTestId('submit-equipment-form');
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText('Failed to add equipment')).toBeInTheDocument(),
    );
  });
});
