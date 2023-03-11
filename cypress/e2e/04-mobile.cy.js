/// <reference types="cypress" />

describe('Mobile layout', () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/v0/places/", {
            fixture: 'places.json'
        }).as("places")
    });

    it('Sets layout for mobile', () => {
        // Open index page
        cy.visit('https://localhost:3000/');
        // Set mobile viewport
        cy.viewport('samsung-s10');
        // Check mobile layout applied
        cy.get('header button[aria-controls="menu-appbar"]').should('be.visible');
        cy.get('header a[href="/places"]').should('not.be.visible');
        cy.get('.map-container > .add-button').should('have.css', 'bottom', '25px'); 
        cy.get('.map-container > .add-button').should('have.css', 'left', '10px'); 
        cy.get('.map-container > .add-button').should('have.css', 'position', 'absolute'); 
    });
});