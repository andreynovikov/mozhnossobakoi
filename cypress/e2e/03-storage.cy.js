/// <reference types="cypress" />

describe('Site view', () => {
    beforeEach(() => {
        cy.intercept("GET", "/api/v0/places/", {
            fixture: 'places.json'
        }).as("places")
    });

    it('Saves location', () => {
        // Open index page
        cy.visit('https://localhost:3000/#map=17/59.962992/30.300905').should(() => {
            expect(localStorage.getItem('mapCenter')).to.eq('{"lat":59.962992,"lng":30.300905}');
            expect(localStorage.getItem('mapZoom')).to.eq('17');
            expect(localStorage.getItem('tileLayer')).to.eq('"Yandex Map"');
        });
    });
});