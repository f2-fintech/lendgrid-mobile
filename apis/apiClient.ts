import axios from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as any;
const api = axios.create({
  baseURL: extra?.API_URL || 'https://api.lendgrid.in',
});

export default api;
