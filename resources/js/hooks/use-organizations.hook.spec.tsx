import { OrganizationLi } from '@/types/organization-li.model';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { fetchOrganizations } from '../axios/fetchOrganizations.axios';
import { useOrganizations } from './use-organizations.hook';

jest.mock('../axios/fetchOrganizations.axios');

const mockedFetchOrganizations = fetchOrganizations as jest.MockedFunction<
  typeof fetchOrganizations
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retry to make error states predictable in tests
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOrganizations', () => {
  it('should return loading state initially', () => {
    // Arrange
    mockedFetchOrganizations.mockReturnValue(new Promise(() => {}));

    // Act
    const { result } = renderHook(() => useOrganizations(), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.organizations).toEqual([]);
  });

  it('should return organizations on success', async () => {
    // Arrange
    const organizationData = [
      { id: 1, name: 'Organization 1' },
      { id: 2, name: 'Organization 2' },
    ] as OrganizationLi[];
    mockedFetchOrganizations.mockResolvedValue(organizationData);

    // Act
    const { result } = renderHook(() => useOrganizations(), {
      wrapper: createWrapper(),
    });

    // Wait for the hook to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.organizations).toEqual(organizationData);
  });

  it('should handle error state', async () => {
    // Arrange
    mockedFetchOrganizations.mockRejectedValue(new Error('Failed to fetch'));

    // Act
    const { result } = renderHook(() => useOrganizations(), {
      wrapper: createWrapper(),
    });

    // Wait for the hook to finish the request and update the state
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.organizations).toEqual([]);
  });
});
