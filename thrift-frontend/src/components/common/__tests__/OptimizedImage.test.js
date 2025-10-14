import { render, screen } from '@testing-library/react';
import OptimizedImage from '../OptimizedImage';

describe('OptimizedImage', () => {
  test('renders with src and alt', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test image" />);
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });

  test('applies lazy loading by default', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('disables lazy loading when priority is true', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test" priority />);
    const img = screen.getByAltText('Test');
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  test('applies custom className', () => {
    render(<OptimizedImage src="/test.jpg" alt="Test" className="custom-class" />);
    const img = screen.getByAltText('Test');
    expect(img).toHaveClass('custom-class');
  });
});
