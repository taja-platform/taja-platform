import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useCurrentLocation = (onSuccess) => {
    const [isLoading, setIsLoading] = useState(false);
    const abortCtrlRef = useRef(null);
    const watchIdRef = useRef(null);

    // Cleanup any ongoing request/watch
    const cleanup = useCallback(() => {
        if (abortCtrlRef.current) {
            abortCtrlRef.current.abort();
            abortCtrlRef.current = null;
        }
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    const requestLocation = useCallback(() => {
        // Prevent multiple clicks
        if (isLoading) return;

        setIsLoading(true);
        toast.info('Requesting your location...');

        // Cancel any previous request
        cleanup();

        const controller = new AbortController();
        abortCtrlRef.current = controller;

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,      // 15 seconds
            maximumAge: 60000,   // Accept up to 1-minute-old location
        };

        // Use watchPosition to keep trying until we get a good fix
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                if (controller.signal.aborted) return;

                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);

                onSuccess({ lat, lng });
                toast.success('Location captured!');

                cleanup();
                setIsLoading(false);
            },
            (error) => {
                if (controller.signal.aborted) return;

                let message = 'Could not get your location.';
                if (error.code === error.PERMISSION_DENIED) {
                    message = 'Location access denied. Please enable it in browser settings.';
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = 'Location information is unavailable.';
                } else if (error.code === error.TIMEOUT) {
                    message = 'Location request timed out. Try again.';
                }

                toast.error(message);
                console.error('Geolocation error:', error);
                setIsLoading(false);
            },
            options
        );

        watchIdRef.current = watchId;

        // Fallback: if no response after timeout + buffer
        const fallbackTimeout = setTimeout(() => {
            if (watchIdRef.current !== null) {
                toast.error('Location request took too long.');
                cleanup();
                setIsLoading(false);
            }
        }, options.timeout + 5000);

        controller.signal.addEventListener('abort', () => {
            clearTimeout(fallbackTimeout);
        });
    }, [isLoading, cleanup, onSuccess]);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by this browser.');
            return;
        }
        requestLocation();
    }, [requestLocation]);

    // Optional: cleanup on unmount
    // useEffect(() => cleanup, [cleanup]);

    return { getLocation, isLoading };
};