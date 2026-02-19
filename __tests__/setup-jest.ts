import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

// Mock Notion API response
const mockNotionResponse = {
  results: [],
  has_more: false,
};

beforeEach(() => {
  fetchMock.resetMocks();
  fetchMock.mockResponseOnce(JSON.stringify(mockNotionResponse));
});

// Test that fetch is mocked
test('fetch is mocked', () => {
  expect(fetchMock).toHaveBeenCalledTimes(0);
  
  // This would normally call fetch
  // But with jest-fetch-mock, it's mocked
  expect(typeof fetch).toBe('function');
});