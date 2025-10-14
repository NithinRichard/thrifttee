import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockCartItem } from '../../../utils/test-utils';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <div data-testid="cart-item">
    <h3>{item.tshirt.title}</h3>
    <p>₹{item.tshirt.price}</p>
    <input
      type="number"
      value={item.quantity}
      onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
      min="1"
    />
    <button onClick={() => onRemove(item.id)}>Remove</button>
  </div>
);

describe('CartItem', () => {
  const mockUpdateQuantity = jest.fn();
  const mockRemove = jest.fn();

  test('renders cart item details', () => {
    renderWithProviders(
      <CartItem
        item={mockCartItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );
    
    expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('₹500.00')).toBeInTheDocument();
  });

  test('calls onUpdateQuantity when quantity changes', () => {
    renderWithProviders(
      <CartItem
        item={mockCartItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '3' } });
    
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });

  test('calls onRemove when remove button clicked', () => {
    renderWithProviders(
      <CartItem
        item={mockCartItem}
        onUpdateQuantity={mockUpdateQuantity}
        onRemove={mockRemove}
      />
    );
    
    fireEvent.click(screen.getByText('Remove'));
    expect(mockRemove).toHaveBeenCalledWith(1);
  });
});
