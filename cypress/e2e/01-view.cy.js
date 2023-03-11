/// <reference types="cypress" />

describe('Site view', () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/v0/places/", {
            fixture: 'places.json'
        }).as("places")
    });

    it('Opens map', () => {
        // Open index page
        cy.visit('https://localhost:3000/');
        // Check page is displayed
        cy.get('h1.MuiTypography-root').should('contain', '#можноссобакой');
        cy.wait("@places");
        // Check Leaflet map is loaded
        cy.get('.leaflet-control-attribution > a').should('contain', 'Leaflet');
        // Check Yandex layer is loaded
        cy.get('.ymaps-2-1-79-copyright__link').should('contain', 'Условия использования');
        // Check dadata plugin is loaded
        cy.get('.react-dadata__input').invoke('attr', 'placeholder').should('contain', 'Введите адрес');
    });

    it('Displays marker', () => {
        // Open index page
        cy.visit('https://localhost:3000/#map=17/59.962992/30.300905');
        cy.wait("@places");
        // Check marker visible
        cy.get('svg[kind="cafe"]').parent().parent('.leaflet-marker-icon').should('be.visible');
    });

    it('Has add button', () => {
        // Open index page
        cy.visit('https://localhost:3000/');
        // Check add button exists
        cy.get('.MuiButton-contained').should('contain', 'Добавить место');
    });
});