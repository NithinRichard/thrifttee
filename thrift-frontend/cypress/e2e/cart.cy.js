describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.clearCart();
    cy.login();
  });

  it('adds item to cart', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.contains('Add to Cart').click({ multiple: true });
    cy.contains('View Cart').click({ multiple: true });
    
    cy.url().should('include', '/cart');
    cy.get('[data-testid="cart-item"]').should('have.length', 1);
  });

  it('updates item quantity', () => {
    cy.addToCart('test-product');
    cy.visit('/cart');
    
    cy.get('input[type="number"]').clear().type('3');
    cy.get('[data-testid="cart-item"]').should('contain', '3');
  });

  it('removes item from cart', () => {
    cy.addToCart('test-product');
    cy.visit('/cart');
    
    cy.contains('Remove').click({ multiple: true });
    cy.contains('Your cart is empty').should('be.visible');
  });

  it('displays correct total', () => {
    cy.addToCart('test-product');
    cy.visit('/cart');
    
    cy.get('[data-testid="cart-total"]').should('contain', '₹');
  });

  it('prevents checkout with empty cart', () => {
    cy.visit('/cart');
    cy.contains('Proceed to Checkout').should('be.disabled');
  });
});
