import { fetchExternal } from './Networking';

export interface StoreAppDetails {
    xid: string; // XID-XXXX
    title: string;
    icon: string;
    developer: string;
    description: string;
    screenshots: string[];
    version: string;
    xosUrl: string;
}

export interface StoreData {
    version: string;
    heroApp: {
        url: string;
        bannerUrl: string;
        details?: StoreAppDetails | null;
    } | null;
    apps: StoreAppDetails[];
    lastUpdated: number;
}

/**
 * Cleans HTML content to extract pure text, removing tags that might interfere with parsing.
 */
const cleanText = (html: string): string => {
    if (typeof html !== 'string') return "";
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    } catch (e) {
        return html;
    }
};

/**
 * Extracts content between [TAG] and [\TAG] or [/TAG].
 * Case insensitive for tag name.
 */
const extractTag = (text: string, tagName: string): string | null => {
    if (!text) return null;
    try {
        const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Matches [TAG]...[\TAG] OR [TAG]...[/TAG]
        const regex = new RegExp(`\\[${escaped}\\]([\\s\\S]*?)\\[[\\\\\\/]${escaped}\\]`, 'i');
        const match = text.match(regex);
        return match && match[1] ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
};

const findXID = (text: string, url: string): string => {
    const match = text.match(/XID-[A-Z0-9]+/i);
    if (match) return match[0].toUpperCase();
    const urlMatch = url.match(/xid-[a-z0-9]+/i);
    if (urlMatch) return urlMatch[0].toUpperCase();
    return `XID-GEN-${Math.floor(Math.random() * 10000)}`;
};

export const fetchStoreData = async (localVersion: string | null): Promise<{ data: StoreData | null, status: 'UPDATE_NEEDED' | 'UP_TO_DATE' | 'ERROR' }> => {
    try {
        const mainUrl = 'https://xlosarrupdsrv.wordpress.com/xos-app-store-data/';
        console.log(`[AppStore] Connecting via NetStack...`);

        // Use the new robust fetchExternal from Networking service
        const rawHtml = await fetchExternal<string>(mainUrl);
        const text = cleanText(rawHtml);

        const serverVersion = extractTag(text, 'STORE-VERSION');
        console.log(`[AppStore] Version Check - Server: ${serverVersion}`);

        // Parsing Hero
        let heroApp = null;
        const heroSectionRaw = extractTag(text, 'Hero-Apps');
        if (heroSectionRaw) {
            const heroUrl = extractTag(heroSectionRaw, 'Hero1');
            const heroBanner = extractTag(heroSectionRaw, 'Hero1-Banner');

            if (heroUrl && heroBanner) {
                const cleanHeroUrl = heroUrl.replace(/[\n\r\s]/g, '');
                const heroDetails = await fetchAppDetails(cleanHeroUrl);
                heroApp = { 
                    url: cleanHeroUrl, 
                    bannerUrl: heroBanner.replace(/[\n\r\s]/g, ''),
                    details: heroDetails
                };
            }
        }

        // Parsing List
        const appsListSection = extractTag(text, 'APPS-LIST');
        const apps: StoreAppDetails[] = [];

        if (appsListSection) {
            let index = 1;
            const promises: Promise<StoreAppDetails | null>[] = [];

            while (true) {
                const appUrl = extractTag(appsListSection, index.toString());
                if (!appUrl) break; 
                const cleanUrl = appUrl.replace(/[\n\r\s]/g, '');
                if (cleanUrl.startsWith('http')) {
                    promises.push(fetchAppDetails(cleanUrl));
                }
                index++;
                if (index > 50) break;
            }

            const results = await Promise.all(promises);
            results.forEach(app => {
                if (app) apps.push(app);
            });
        }

        return {
            status: 'UPDATE_NEEDED',
            data: {
                version: serverVersion || '1.0',
                heroApp,
                apps,
                lastUpdated: Date.now()
            }
        };

    } catch (e) {
        console.error("[AppStore] Connection Failed:", e);
        return { data: null, status: 'ERROR' };
    }
};

const fetchAppDetails = async (url: string): Promise<StoreAppDetails | null> => {
    try {
        const rawHtml = await fetchExternal<string>(url);
        const text = cleanText(rawHtml);

        const title = extractTag(text, 'Title');
        const icon = extractTag(text, 'ICON');
        const dev = extractTag(text, 'DEV');
        const desc = extractTag(text, 'DESCRIPTION');
        const ver = extractTag(text, 'VER');
        const xos = extractTag(text, 'XOS-PACK');
        const xid = findXID(text, url);

        if (!title) return null;

        const screenshots: string[] = [];
        let i = 1;
        while (true) {
            const img = extractTag(text, `IMG-CAP${i}`);
            if (!img) break;
            screenshots.push(img.replace(/[\n\r\s]/g, ''));
            i++;
            if (i > 10) break; 
        }

        return {
            xid,
            title: title || 'Unknown',
            icon: icon ? icon.replace(/[\n\r\s]/g, '') : '',
            developer: dev || 'Unknown',
            description: desc || '',
            version: ver ? ver.trim() : '1.0',
            xosUrl: xos ? xos.replace(/[\n\r\s]/g, '') : '',
            screenshots
        };

    } catch (e) {
        return null;
    }
};

export const fetchXosFile = async (url: string): Promise<string | null> => {
    try {
        const content = await fetchExternal<string>(url);
        return typeof content === 'string' ? content : JSON.stringify(content);
    } catch (e) {
        return null;
    }
};
