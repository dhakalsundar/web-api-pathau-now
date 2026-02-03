import axios from './axios';

export async function fetchShipments({ page = 1, limit = 10, q = '', status = '' }: { page?: number; limit?: number; q?: string; status?: string }) {
  const params: any = { page, limit };
  if (q) params.q = q;
  if (status) params.status = status;
  const res = await axios.get('/shipments', { params });
  return res.data; // { success: true, data: { items, total } }
}

export async function fetchShipment(trackingNumber: string) {
  const res = await axios.get(`/shipments/${encodeURIComponent(trackingNumber)}`);
  return res.data; // { success: true, data: shipment }
}

export async function createShipment(payload: any) {
  const res = await axios.post('/shipments', payload);
  return res.data; // { success: true, data: created }
}
