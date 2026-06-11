// Ensure the API URL always has the correct protocol
const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
let API_BASE_URL = rawApiUrl.trim();

// Add https:// if missing and it's not localhost
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
    if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
        API_BASE_URL = 'http://' + API_BASE_URL;
    } else {
        API_BASE_URL = 'https://' + API_BASE_URL;
    }
}

export const getUploadUrl = (fotoPath) => {
    if (!fotoPath) return '';

    const cleanedPath = fotoPath.toString().trim();
    if (!cleanedPath) return '';

    if (cleanedPath.startsWith('http://') || cleanedPath.startsWith('https://')) {
        return cleanedPath;
    }

    const normalizedPath = cleanedPath.startsWith('/uploads/')
        ? cleanedPath
        : cleanedPath.startsWith('uploads/')
            ? `/${cleanedPath}`
            : `/uploads/${cleanedPath}`;

    if (typeof window !== 'undefined') {
        const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (!isLocalhost) {
            return normalizedPath;
        }
    }

    return `${API_BASE_URL}${normalizedPath}`;
};

export default API_BASE_URL;
