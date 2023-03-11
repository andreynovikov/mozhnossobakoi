/// <reference types="cypress" />

describe('Navigate to places', () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/v0/locations/", {
            fixture: 'locations.json'
        }).as("places")
        cy.intercept("GET", "/api/v0/places/", {
            fixture: 'places.json'
        }).as("places")
        cy.intercept("GET", "/api/v0/places/*", {
            fixture: 'places.json'
        }).as("places")
        cy.visit('https://localhost:3000/');
        cy.get('header a[href="/places"]').contains('Список мест').click();
    });

    it('Opens places list', () => {
        cy.location('pathname').should('include', 'places');
        cy.go('back');
        cy.location('pathname').should('not.include', 'places');
    });

    it('Reload places list', () => {
        cy.reload();
        cy.location('pathname').should('include', 'places');
    });
});