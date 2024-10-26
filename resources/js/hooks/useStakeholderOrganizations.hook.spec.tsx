import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { fetchStakeholderOrganizations } from '../axios/fetchStakeholderOrganizations.axios';
import { useStakeholderOrganizations } from './useStakeholderOrganizations.hook';

jest.mock('../axios/fetchStakeholderOrganizations.axios');

const mockedFetchStakeholderOrganizations =
  fetchStakeholderOrganizations as jest.MockedFunction<
    typeof fetchStakeholderOrganizations
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

describe('useStakeholderOrganizations', () => {
  it('should return loading state initially', () => {
    // Arrange
    mockedFetchStakeholderOrganizations.mockReturnValue(new Promise(() => {}));

    // Act
    const { result } = renderHook(() => useStakeholderOrganizations(), {
      wrapper: createWrapper(),
    });

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.stakeholderOrganizations).toEqual([]);
  });

  it('should return stakeholder organizations on success', async () => {
    // Arrange
    const stakeholderData = [
      { id: 1, name: 'Organization 1' },
      { id: 2, name: 'Organization 2' },
    ];
    mockedFetchStakeholderOrganizations.mockResolvedValue(stakeholderData);

    // Act
    const { result } = renderHook(() => useStakeholderOrganizations(), {
      wrapper: createWrapper(),
    });

    // Wait for the hook to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.stakeholderOrganizations).toEqual(stakeholderData);
  });

  it('should handle error state', async () => {
    // Arrange
    mockedFetchStakeholderOrganizations.mockRejectedValue(
      new Error('Failed to fetch')
    );

    // Act
    const { result } = renderHook(() => useStakeholderOrganizations(), {
      wrapper: createWrapper(),
    });

    // Wait for the hook to finish the request and update the state
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.stakeholderOrganizations).toEqual([]);
  });
});
