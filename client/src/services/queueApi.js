import api from './api';

export const getServices = () => api.get('/services');
export const getQueueSummary = (serviceId) => api.get(`/tokens/queue/${serviceId}`);
export const bookToken = (payload) => api.post('/tokens', payload);
export const getTokenStatus = (tokenId) => api.get(`/tokens/${tokenId}`);
export const cancelToken = (tokenId) => api.patch(`/tokens/${tokenId}/cancel`);
export const reEnterQueue = (tokenId) => api.patch(`/tokens/${tokenId}/re-enter`);
export const submitRating = (tokenId, rating) => api.patch(`/tokens/${tokenId}/rating`, { rating });

export const listCounters = () => api.get('/counters');
export const createCounter = (payload) => api.post('/counters', payload);
export const updateCounter = (counterId, payload) => api.put(`/counters/${counterId}`, payload);
export const deleteCounter = (counterId) => api.delete(`/counters/${counterId}`);
export const assignStaffToCounter = (counterId, staffId) => api.patch(`/counters/${counterId}/assign-staff`, { staffId });
export const callNextToken = (counterId) => api.post(`/counters/${counterId}/call-next`);
export const markServed = (counterId) => api.patch(`/counters/${counterId}/served`);
export const markNoShow = (counterId) => api.patch(`/counters/${counterId}/no-show`);
export const setCounterStatus = (counterId, status) => api.patch(`/counters/${counterId}/status`, { status });

export const getDashboard = () => api.get('/admin/dashboard');
export const getAnalytics = (days = 7) => api.get(`/admin/analytics?days=${days}`);
export const getStaffSuggestion = () => api.get('/admin/staff-allocation-suggestion');
export const getStaffList = () => api.get('/admin/staff');
