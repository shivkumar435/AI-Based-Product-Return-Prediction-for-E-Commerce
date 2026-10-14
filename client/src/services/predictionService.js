import api from './api';

const normalizeList = (payload, key) => {
  if (Array.isArray(payload)) return payload.filter(Boolean);
  if (Array.isArray(payload?.[key])) return payload[key].filter(Boolean);
  if (Array.isArray(payload?.data)) return payload.data.filter(Boolean);
  return [];
};

const predictionService = {
  predict: async (data) => {
    const res = await api.post('/predict', data);
    return res.data?.prediction || res.data;
  },
  // GET /predict returns the logged-in user's predictions
  getPredictions: async () => {
    const res = await api.get('/predict');
    return normalizeList(res.data, 'predictions');
  },
  getAllPredictions: async () => {
    const res = await api.get('/predict/all');
    return normalizeList(res.data, 'predictions');
  }
};

export default predictionService;
