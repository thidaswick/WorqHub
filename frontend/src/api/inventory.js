/**
 * Inventory API. All calls include JWT; backend scopes by tenantId.
 */
import client from './client';

export const list = (params) => client.get('/inventory', { params }).then((res) => res.data);
export const get = (id) => client.get(`/inventory/${id}`).then((res) => res.data);
export const create = (data) => client.post('/inventory', data).then((res) => res.data);
export const update = (id, data) => client.put(`/inventory/${id}`, data).then((res) => res.data);
export const remove = (id) => client.delete(`/inventory/${id}`).then((res) => res.data);
