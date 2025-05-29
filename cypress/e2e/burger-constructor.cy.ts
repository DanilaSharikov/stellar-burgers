import Cypress from 'cypress';

const BASE_URL = 'https://norma.nomoreparties.space/api';
const CRYSTAL_INGREDIENT = `[data-cy=${'643d69a5c3f7b9001cfa0948'}]`;
const FALLEAN_FRUIT = `[data-cy=${'643d69a5c3f7b9001cfa0947'}]`;
const ANTARIAN_SAUCE = `[data-cy=${'643d69a5c3f7b9001cfa0945'}]`;
const FLUORESCENT_BUN = `[data-cy=${'643d69a5c3f7b9001cfa093d'}]`;

beforeEach(() => {
  cy.intercept('GET', `${BASE_URL}/ingredients`, {
    fixture: 'ingredients.json'
  }).as('getIngredients');

  cy.intercept('POST', `${BASE_URL}/auth/login`, {
    fixture: 'user.json'
  }).as('login');

  cy.intercept('GET', `${BASE_URL}/auth/user`, {
    fixture: 'user.json'
  }).as('getUser');

  cy.intercept('POST', `${BASE_URL}/orders`, (req) => {
    req.reply({
      statusCode: 200,
      fixture: 'orderResponse.json'
    });
  }).as('postOrder');

  cy.visit('/');
  cy.wait('@getIngredients');
  cy.viewport(1440, 800);
});

describe('Ingredient Management in Constructor', () => {
  it('should increment ingredient counter', () => {
    cy.get('.constructor').should('not.contain', 'Кристалл');
    cy.get(CRYSTAL_INGREDIENT).children('button').click();
    cy.get('.constructor').should('contain', 'Кристалл');

  });

  describe('Burger Assembly Process', () => {
    it('should add main ingredient and sauce', () => {
      cy.get(CRYSTAL_INGREDIENT).children('button').click();
      cy.get(ANTARIAN_SAUCE).children('button').click();
    });

    it('should add sauce before main ingredient', () => {
      cy.get('.constructor').should('not.contain', '643d69a5c3f7b9001cfa0945');
      cy.get(ANTARIAN_SAUCE).children('button').click();
      cy.get('.constructor').should('contain', '643d69a5c3f7b9001cfa0945');

      cy.get('.constructor').should('not.contain', '643d69a5c3f7b9001cfa0948');
      cy.get(CRYSTAL_INGREDIENT).children('button').click();
      cy.get('.constructor').should('contain', '643d69a5c3f7b9001cfa0948');
    });
  });

  describe('Ingredient Combinations', () => {
    it('should replace ingredient in empty constructor', () => {
      cy.get(CRYSTAL_INGREDIENT).children('button').click();
      cy.get(FALLEAN_FRUIT).children('button').click();
    });

    it('should replace ingredient with existing components', () => {
      cy.get(CRYSTAL_INGREDIENT).children('button').click();
      cy.get(ANTARIAN_SAUCE).children('button').click();
      cy.get(FALLEAN_FRUIT).children('button').click();
    });
  });
});

describe('Order Processing', () => {
  beforeEach(() => {
    window.localStorage.setItem('refreshToken', 'test_refresh_token_456');
    cy.setCookie('accessToken', 'test_access_token_789');
    cy.getAllLocalStorage().should('not.be.empty');
    cy.getCookie('accessToken').should('exist');
  });

  afterEach(() => {
    window.localStorage.clear();
    cy.clearAllCookies();
    cy.getAllLocalStorage().should('be.empty');
    cy.getAllCookies().should('be.empty');
  });

  it('should create and confirm order', () => {
    cy.get(FLUORESCENT_BUN).children('button').click();
    cy.get(CRYSTAL_INGREDIENT).children('button').click();
    cy.get(FALLEAN_FRUIT).children('button').click();
    
    cy.get("[data-cy='order-button']")
      .should('be.visible')
      .should('be.enabled')
      .click();
    
    cy.wait('@postOrder', { timeout: 15000 }).then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.body).to.have.property('order');
      expect(interception.response?.body.order).to.have.property('number');
      
      const orderNumber = interception.response?.body.order.number;

      cy.contains(orderNumber.toString(), { timeout: 10000 })
        .should('exist')
        .and('be.visible');
      cy.get('.constructor').children().should('have.length', 0);
    });
  });
});

describe('Ingredient Modal Windows', () => {
  beforeEach(() => {
    cy.get('#modals').as('modal');
  });

  it('should display ingredient details', () => {
    cy.get('@modal').should('not.exist');
    cy.get(CRYSTAL_INGREDIENT).children('a').click();
    cy.get('@modal').should('exist').and('contain', '643d69a5c3f7b9001cfa0948');
  });

  it('should close modal with button', () => {
    cy.get('@modal').should('be.empty');
    cy.get(CRYSTAL_INGREDIENT).children('a').click();
    cy.get('@modal').should('not.be.empty');
    cy.get('@modal').find('button').click();
    cy.get('@modal').should('be.empty');
  });

  it('should close modal by overlay click', () => {
    cy.get('@modal').should('be.empty');
    cy.get(CRYSTAL_INGREDIENT).children('a').click();
    cy.get('@modal').should('not.be.empty');
    cy.get("[data-cy='overlay']").click({ force: true });
    cy.get('@modal').should('be.empty');
  });

  it('should close modal with ESC key', () => {
    cy.get('@modal').should('be.empty');
    cy.get(CRYSTAL_INGREDIENT).children('a').click();
    cy.get('@modal').should('not.be.empty');
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('@modal').should('be.empty');
  });
});
