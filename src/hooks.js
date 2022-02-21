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

export function useUrlHash() {
    const location = useLocation();
    const hash = useMemo(() => {
        return location.hash.slice(1);
    }, [location.hash]);

    const navigate = useNavigate();
    const setHash = useCallback((nextHash, navigateOptions) => {
        navigate("#" + nextHash, navigateOptions);
    }, [navigate]);

    return [hash, setHash];
}
