/* eslint-disable react/display-name */
import { ToastProps } from '@/Components/Util/Toast';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { ToastProvider, useToast } from './ToastProvider';

// Mocking the Toast component
jest.mock(
  '@/Components/Util/Toast',
  () =>
    ({ open, message, onClose, severity, position }: ToastProps) => {
      return (
        open && (
          <div data-testid="toast" role="alert">
            <p>{message}</p>
            <span>{severity}</span>
            <span>{position?.toString()}</span>
            <button onClick={onClose}>Close</button>
          </div>
        )
      );
    }
);

const TestComponent = ({ children }: { children: ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

const ComponentUsingToast = () => {
  const { showToast } = useToast();

  return (
    <button
      onClick={() =>
        showToast('Test message', 'success', { v: 'top', h: 'left' })
      }
    >
      Show Toast
    </button>
  );
};

describe('ToastProvider', () => {
  it('should not render the toast when there is no message', () => {
    render(
      <TestComponent>
        <ComponentUsingToast />
      </TestComponent>
    );
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('should render a toast when showToast is called', async () => {
    render(
      <TestComponent>
        <ComponentUsingToast />
      </TestComponent>
    );

    userEvent.click(screen.getByText('Show Toast'));

    expect(await screen.findByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(
      screen.getByText({ v: 'top', h: 'left' }.toString())
    ).toBeInTheDocument();
  });

  it('should close the toast when the close button is clicked', async () => {
    render(
      <TestComponent>
        <ComponentUsingToast />
      </TestComponent>
    );

    userEvent.click(screen.getByText('Show Toast'));

    const toast = await screen.findByTestId('toast');
    expect(toast).toBeInTheDocument();

    // Simulate close button click
    userEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(toast).not.toBeInTheDocument();
    });
  });
});
