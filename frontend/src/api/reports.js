/**
 * Reports API. All calls include JWT; backend scopes by tenantId.
 */
import client from './client';

export const dashboard = () => client.get('/reports/dashboard').then((res) => res.data);
export const workOrderStats = (params) => client.get('/reports/work-orders', { params }).then((res) => res.data);
