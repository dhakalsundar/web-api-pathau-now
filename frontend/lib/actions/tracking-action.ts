"use client";

import axiosInstance from "../api/axios";

function extractMessage(error: any, fallback: string) {
  const msg = error?.response?.data?.message;
  if (msg) return msg;

  if (error?.response?.status === 404) {
    return "Tracking endpoint not found (404). Your backend tracking API is not added yet OR endpoint path is different.";
  }

  return error?.message || fallback;
}


export async function handleTrackParcel(trackingId: string) {
  try {
    const res = await axiosInstance.get(`/tracking/parcel/${trackingId}`);
    const result = res.data;

    if (result?.success) return { success: true, data: result.data };

    return { success: true, data: result?.data ?? result };
  } catch (err: any) {
    return { success: false, message: extractMessage(err, "Failed to track parcel") };
  }
}


export async function handleTrackCourier(trackingId: string) {
  try {
    const res = await axiosInstance.get(`/tracking/courier/${trackingId}`);
    const result = res.data;

    if (result?.success) return { success: true, data: result.data };

    return { success: true, data: result?.data ?? result };
  } catch (err: any) {
    return { success: false, message: extractMessage(err, "Failed to track courier") };
  }
}
