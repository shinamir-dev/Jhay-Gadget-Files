import axios from 'axios';

const API_URL = 'http://localhost:5000/api/inventory'

export const getSummary = async (status = "available") => {
    try {
        const response = await axios.get(`${API_URL}/summary`, {
            params: { status }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching the summary", error);
        throw error;
    }
}

export const addUnit = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/add/unit`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

