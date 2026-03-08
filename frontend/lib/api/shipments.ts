import axios from './axios';

export async function fetchParcels({ page = 1, limit = 10, q = '', status = '' }: { page?: number; limit?: number; q?: string; status?: string }) {
  const params: any = { page, limit };
  if (q) params.q = q;
  if (status) params.status = status;
  const res = await axios.get('/parcels', { params });
  return res.data; // { success: true, data: { items, total } }
}

export async function fetchParcel(trackingNumber: string) {
  const res = await axios.get(`/parcels/${encodeURIComponent(trackingNumber)}`);
  return res.data; // { success: true, data: parcel }
}

export async function createParcel(payload: any) {
  const res = await axios.post('/parcels', payload);
  return res.data; // { success: true, data: created }
}
