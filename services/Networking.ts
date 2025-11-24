import axios from 'axios';

// List of CORS proxies to try in order. This ensures if one is down/blocked, the OS still has internet.
const PROXY_STRATEGIES = [
    // Strategy 1: corsproxy.io (Fastest)
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    // Strategy 2: AllOrigins (Reliable backup)
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    // Strategy 3: ThingProxy (Fallback)
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
];

export interface NetworkResponse<T = any> {
    data: T;
    success: boolean;
    source: string;
}

/**
 * Robust fetcher that tries multiple strategies to bypass CORS and network restrictions.
 * Guarantees internet access for the OS modules.
 */
export const fetchExternal = async <T = string>(url: string): Promise<T> => {
    // If it's already a proxied URL or local, try direct
    if (url.startsWith('blob:') || url.startsWith('data:')) {
        const response = await axios.get(url);
        return response.data;
    }

    let lastError: any = null;

    for (const strategy of PROXY_STRATEGIES) {
        try {
            const proxyUrl = strategy(url);
            console.log(`[NetStack] Attempting connection via: ${proxyUrl}`);
            
            const response = await axios.get(proxyUrl, {
                timeout: 15000, // 15s timeout
                headers: {
                    'Accept': 'text/html,application/json,text/plain,*/*'
                }
            });

            if (response.status >= 200 && response.status < 300) {
                return response.data;
            }
        } catch (e) {
            console.warn(`[NetStack] Strategy failed. Retrying...`, e);
            lastError = e;
        }
    }

    console.error("[NetStack] Critical: No internet access or all proxies failed.");
    throw lastError || new Error("Network Unreachable");
};

/**
 * Checks if the actual host browser has internet access.
 */
export const checkConnection = (): boolean => {
    return navigator.onLine;
};
