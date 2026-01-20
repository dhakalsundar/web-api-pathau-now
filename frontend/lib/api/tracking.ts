import axiosInstance from "./axios";


export async function trackParcelById(trackingId: string) {
  const res = await axiosInstance.get(`/tracking/parcel/${trackingId}`);
  return res.data;
}

export async function trackCourierById(trackingId: string) {
  const res = await axiosInstance.get(`/tracking/courier/${trackingId}`);
  return res.data;
}
