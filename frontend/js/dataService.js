// Data Fetching Utility
const BASE_URL = 'http://localhost:5000'; // Backend server URL

async function fetchData(endpoint, method = 'GET', body = null) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const token = localStorage.getItem('userToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const options = {
            method,
            headers,
            ...(body ? { body: JSON.stringify(body) } : {})
        };

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(errorText || 'Something went wrong');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Received non-JSON response');
        }

        return {
            success: true,
            data: await response.json()
        };
    } catch (error) {
        console.error('Fetch error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

export { fetchData };
