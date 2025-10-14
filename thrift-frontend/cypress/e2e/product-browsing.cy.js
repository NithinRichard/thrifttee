describe('Product Browsing', () => {
  it('displays product list', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
  });

  it('filters products by brand', () => {
    cy.visit('/products');
    cy.get('[data-testid="brand-filter"]').first().click();
    cy.url().should('include', 'brand=');
    cy.get('[data-testid="product-card"]').should('exist');
  });

  it('searches for products', () => {
    cy.visit('/products');
    cy.get('input[placeholder*="Search"]').type('shirt{enter}');
    cy.url().should('include', 'search=shirt');
  });

  it('views product details', () => {
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.url().should('include', '/products/');
    cy.get('h1').should('be.visible');
    cy.contains('Add to Cart').should('be.visible');
  });

  it('adds product to cart from detail page', () => {
    cy.login();
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();
    cy.contains('Add to Cart').click({ multiple: true });
    cy.contains('Added to cart').should('be.visible');
  });
});
