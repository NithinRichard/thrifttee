describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.clearCart();
    cy.login();
  });

  it('completes full checkout process', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.contains('Add to Cart').click({ multiple: true });
    cy.contains('View Cart').click({ multiple: true });
    
    cy.url().should('include', '/cart');
    cy.get('[data-testid="cart-item"]').should('have.length.at.least', 1);
    
    cy.contains('Proceed to Checkout').click({ multiple: true });
    cy.url().should('include', '/checkout');
    
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('input[name="phone"]').type('9876543210');
    cy.get('textarea[name="address"]').type('123 Main Street, Delhi');
    cy.get('input[name="pincode"]').type('110001');
    
    cy.contains('Place Order').click({ multiple: true });
    cy.contains('Order Confirmed', { timeout: 10000 }).should('be.visible');
  });

  it('validates required fields', () => {
    cy.addToCart('test-product');
    cy.visit('/checkout');
    
    cy.contains('Place Order').click({ multiple: true });
    cy.contains('required').should('be.visible');
  });

  it('calculates shipping cost correctly', () => {
    cy.addToCart('test-product');
    cy.visit('/checkout');
    
    cy.get('input[name="pincode"]').type('110001');
    cy.contains('Calculate Shipping').click({ multiple: true });
    
    cy.get('[data-testid="shipping-cost"]').should('contain', '₹');
  });
});
