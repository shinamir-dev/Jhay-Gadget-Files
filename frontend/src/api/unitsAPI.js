import axios from 'axios';

const API_URL = 'http://192.168.1.189:5000/api/unit'


export const getProducts = async () => {
  const res = await axios.get(`${API_URL}/get/products`);
  return res.data;
};

export const getColors = async () => {
  const res = await axios.get(`${API_URL}/get/colors`);
  return res.data;
};

export const createProduct = async (data) => {
  const res = await axios.post(`${API_URL}/create`, data);
  return res.data;
};

export const createColor = async (data) => {
  const res = await axios.post(`${API_URL}/color`, data);
  return res.data;
};