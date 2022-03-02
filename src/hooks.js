import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


export function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

export function useEffectNoInitial(effect, dependencies) {
    const initialRender = useRef(true);

    useEffect(() => {
        var effectReturns = () => {};

        if (initialRender.current) {
            initialRender.current = false;
        } else {
            effectReturns = effect();
        }

        if (effectReturns && typeof effectReturns === 'function') {
            return effectReturns;
        }
        return undefined;
    }, dependencies);
}

export function usePrevious(value) {
    const prev = useRef();
    const curr = useRef();

    if (value !== curr.current) {
        prev.current = curr.current;
        curr.current = value;
    }

    return prev.current;
}

export function useDocumentTitle(title) {
    useEffect(() => {
        document.title = title;
    }, [title]);
}

export function useHashParams() {
    let location = useLocation();
    let hashParams = useMemo(() => {
        var match,
        search = /([^&=]+)=?([^&]*)/g,
        query  = location.hash.slice(1);

        let hashParams = {};
        // eslint-disable-next-line
        while (match = search.exec(query))
            hashParams[match[1]] = match[2];
        return hashParams;
    }, [location.hash]);

    let navigate = useNavigate();
    let setHashParams = useCallback((params, navigateOptions) => {
        navigate("#" + Object.keys(params).reduce(function(a, k) {
            a.push(k + '=' + params[k]); // we intentionally do not encode parameters as we want them to be human readable
            return a;
        }, []).join('&'), navigateOptions);
    }, [navigate]);

    return [hashParams, setHashParams];
}
