// import cookie from 'react-cookies';

export const placeKeys = {
    all: ['places'],
    lists: () => [...placeKeys.all, 'list'],
    list: (kind) => [...placeKeys.lists(), { kind }],
    details: () => [...placeKeys.all, 'detail'],
    detail: (id) => [...placeKeys.details(), id],
};

export const API = window.location.origin + '/api/v0/';

export function loadPlaces(kind, filters) {
    const url = new URL(API + 'places/');

    if (kind !== undefined)
        url.searchParams.set('kind', kind);
    if (filters !== undefined)
        for (var filter of filters)
            url.searchParams.append(filter.field, filter.value);
    return fetch(url)
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
};

export function loadPlace(id) {
    return fetch(API + 'places/' + id + '/')
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        });
};

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
};

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
};
