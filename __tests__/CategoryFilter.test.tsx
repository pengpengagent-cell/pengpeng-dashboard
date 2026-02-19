import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter from '../components/CategoryFilter';

describe('CategoryFilter', () => {
  it('renders all category buttons', () => {
    const mockOnChange = jest.fn();
    render(<CategoryFilter selectedCategory="all" onCategoryChange={mockOnChange} />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Model Releases')).toBeInTheDocument();
    expect(screen.getByText('API Updates')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('highlights selected category', () => {
    const mockOnChange = jest.fn();
    render(<CategoryFilter selectedCategory="model-release" onCategoryChange={mockOnChange} />);
    
    const modelReleaseButton = screen.getByText('Model Releases');
    expect(modelReleaseButton).toHaveClass('bg-purple-600');
  });

  it('calls onCategoryChange when clicking a category', () => {
    const mockOnChange = jest.fn();
    render(<CategoryFilter selectedCategory="all" onCategoryChange={mockOnChange} />);
    
    const newsButton = screen.getByText('News');
    fireEvent.click(newsButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('news');
  });
});
