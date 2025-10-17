// __tests__/FacilitySearchBar.test.tsx
import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {useRouter} from 'next/navigation';
import {FacilitySearchBar} from '../FacilitySearchBar';
import {act} from 'react-dom/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('use-debounce', () => ({
  useDebounce: (value: string) => [value],
}));

describe('FacilitySearchBar', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
    jest.clearAllMocks();
  });

  it('renders the search bar with initial state', () => {
    render(<FacilitySearchBar searchType="Nearby" />);
    expect(
      screen.getByPlaceholderText('Search facilities'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nearby Athletic Facilities')).toBeInTheDocument();
  });

  it('updates the search term when typing', () => {
    render(<FacilitySearchBar searchType="Nearby" />);
    const input = screen.getByPlaceholderText('Search facilities');
    fireEvent.change(input, {target: {value: 'gym'}});
    expect((input as HTMLInputElement).value).toBe('gym');
  });

  it('navigates to the correct route when search term is updated for Nearby', async () => {
    render(<FacilitySearchBar searchType="Nearby" />);
    const input = screen.getByPlaceholderText('Search facilities');

    // Simulate typing a query
    fireEvent.change(input, {target: {value: 'basketball'}});

    await act(async () => {
      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledWith('/facilities?search=basketball'),
      );
    });
  });

  it('navigates to the correct route when search term is updated for Tracked', async () => {
    render(<FacilitySearchBar searchType="Tracked" />);
    const input = screen.getByPlaceholderText('Search facilities');

    // Simulate typing a query
    fireEvent.change(input, {target: {value: 'swimming'}});

    await act(async () => {
      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledWith('/facilities?search=swimming'),
      );
    });
  });

  it('navigates to /facilities when the input is cleared', async () => {
    render(<FacilitySearchBar searchType="Nearby" />);
    const input = screen.getByPlaceholderText('Search facilities');

    // Simulate clearing the input
    fireEvent.change(input, {target: {value: ''}});

    await act(async () => {
      await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/facilities'));
    });
  });
});
