import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockProduct } from '../../../utils/test-utils';

const ProductCard = ({ product, onAddToCart }) => (
  <div data-testid="product-card">
    <img src={product.images[0]?.image} alt={product.title} />
    <h3>{product.title}</h3>
    <p>{product.brand.name}</p>
    <p>₹{product.price}</p>
    <span>{product.condition}</span>
    <button onClick={() => onAddToCart(product)}>Add to Cart</button>
  </div>
);

describe('ProductCard', () => {
  const mockAddToCart = jest.fn();

  test('renders product information', () => {
    renderWithProviders(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('₹500.00')).toBeInTheDocument();
    expect(screen.getByText('excellent')).toBeInTheDocument();
  });

  test('displays product image', () => {
    renderWithProviders(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    const img = screen.getByAltText('Test T-Shirt');
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  test('calls onAddToCart when button clicked', () => {
    renderWithProviders(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
