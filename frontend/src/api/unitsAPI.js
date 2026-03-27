import axios from 'axios';

const API_URL = 'http://localhost:5000/api/unit'


export const getProducts = async () => {
  const res = await axios.get(`${API_URL}/get/products`);
  return res.data;
};

export const getColors = async () => {
  const res = await axios.get(`${API_URL}/get/colors`);
  return res.data;
};