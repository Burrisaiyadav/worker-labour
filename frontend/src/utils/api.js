import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token // Matching backend middleware
    };
};

export const api = {
    get: async (endpoint) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (response.status === 401) {
                // Handle unauthorized (optional: redirect logic here or in component)
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Request failed');
            }

            return await response.json();
        } catch (err) {
            throw err;
        }
    },

    post: async (endpoint, body) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body)
            });

            if (response.status === 401) {
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Request failed');
            }

            return await response.json();
        } catch (err) {
            throw err;
        }
    }
};
