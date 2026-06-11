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

const normalizeUploadPath = (fotoPath) => {
    if (!fotoPath) return '';

    const cleanedPath = fotoPath.toString().trim();
    if (!cleanedPath) return '';

    if (cleanedPath.startsWith('http://') || cleanedPath.startsWith('https://')) {
        return cleanedPath;
    }

    const slashNormalizedPath = cleanedPath.replace(/\\/g, '/');
    const uploadsIndex = slashNormalizedPath.toLowerCase().lastIndexOf('/uploads/');
    const relativeUploadPath = uploadsIndex >= 0
        ? slashNormalizedPath.slice(uploadsIndex)
        : slashNormalizedPath.startsWith('uploads/')
            ? `/${slashNormalizedPath}`
            : slashNormalizedPath.startsWith('/uploads/')
                ? slashNormalizedPath
                : `/uploads/${slashNormalizedPath.split('/').pop()}`;
};

export const getUploadApiUrl = (fotoPath) => {
    const normalizedPath = normalizeUploadPath(fotoPath);
    if (!normalizedPath) return '';
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
        return normalizedPath;
    }
    return `${API_BASE_URL}${normalizedPath}`;
};

export const getUploadUrl = (fotoPath) => {
    const normalizedPath = normalizeUploadPath(fotoPath);
    if (!normalizedPath) return '';
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
        return normalizedPath;
    }

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

export const fetchUploadBlobUrl = async (fotoPath) => {
    const uploadUrl = getUploadApiUrl(fotoPath);
    if (!uploadUrl) return '';

    const response = await fetch(uploadUrl, { mode: 'cors' });
    if (!response.ok) {
        throw new Error(`Gagal memuat gambar (${response.status})`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
};

export const fetchTransaksiFotoDataUrl = async (transaksiId) => {
    if (!transaksiId) return '';

    const response = await fetch(`${API_BASE_URL}/api/transaksi/${transaksiId}/foto-data`, {
        mode: 'cors'
    });

    if (!response.ok) {
        throw new Error(`Gagal memuat foto transaksi (${response.status})`);
    }

    const payload = await response.json();
    if (!payload?.data || !payload?.mimeType) {
        return '';
    }

    return `data:${payload.mimeType};base64,${payload.data}`;
};

export default API_BASE_URL;
