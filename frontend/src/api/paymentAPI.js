import axios from "axios";

const API_URL = 'http://192.168.1.252:5000/api/payment'

export const createPaymentMethod = async(data) => {
    const res = await axios.post(`${API_URL}/create`, data);
    return res.data;
}

export const getPaymentModes = async() => {
    const res = await axios.get(`${API_URL}/get`);
    return res.data;
}