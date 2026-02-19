import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../components/SearchBar';

// React 19用のテスト設定
describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search news...');
    expect(input).toBeInTheDocument();
  });

  it('calls onSearch when typing', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search news...');
    fireEvent.change(input, { target: { value: 'OpenAI' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('OpenAI');
  });

  it('updates input value when typing', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search news...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Claude' } });
    
    expect(input.value).toBe('Claude');
  });

  it('accepts custom placeholder', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} placeholder="Search articles..." />);
    
    const input = screen.getByPlaceholderText('Search articles...');
    expect(input).toBeInTheDocument();
  });
});
