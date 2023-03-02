// import cookie from 'react-cookies';

export const placeKeys = {
    all: ['places'],
    lists: () => [...placeKeys.all, 'list'],
    list: (kind, address) => [...placeKeys.lists(), { kind, address }],
    details: () => [...placeKeys.all, 'detail'],
    detail: (id) => [...placeKeys.details(), id],
};

export const reviewKeys = {
    all: ['reviews'],
    lists: () => [...reviewKeys.all, 'list'],
    list: (place) => [...reviewKeys.lists(), { place }],
};

export const locationKeys = {
    all: ['locations'],
    lists: () => [...locationKeys.all, 'list'],
};

export const API = window.location.origin + '/api/v0/';

export function loadPlaces(kind, address, page=undefined) {
    const url = new URL(API + 'places/');

    if (Array.isArray(kind))
        for (var item of kind)
            url.searchParams.append('kind', item);
    else if (kind)
        url.searchParams.set('kind', kind);
    if (address)
        url.searchParams.set('address', address);
    if (page)
        url.searchParams.set('page', page);
    return fetch(url)
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
}

export function loadPlace(id) {
    return fetch(API + 'places/' + id + '/')
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
}

export function createPlace(data) {
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        //'X-CSRFTOKEN': cookie.load('csrftoken')
    }
    var body = JSON.stringify(data);

    return fetch(API + 'places/', {headers, body, method: 'POST'})
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
}

export function patchPlace(id, data) {
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        //'X-CSRFTOKEN': cookie.load('csrftoken')
    }
    var body = JSON.stringify({...data, id: id});

    return fetch(API + 'places/' + id + '/', {headers, body, method: 'PATCH'})
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
}

export function createReview(place, data) {
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        //'X-CSRFTOKEN': cookie.load('csrftoken')
    }
    var body = JSON.stringify(data);

    return fetch(API + 'places/' + place + '/reviews/', {headers, body, method: 'POST'})
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
}

export function loadLocations() {
    const url = new URL(API + 'locations/');

    return fetch(url)
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
}
