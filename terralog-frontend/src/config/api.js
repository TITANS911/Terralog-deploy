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

export default API_BASE_URL;
