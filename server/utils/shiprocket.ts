import axios from 'axios';
import SettingModel from '../models/Setting';

interface ServiceabilityParams {
  pickup_pincode: string;
  delivery_pincode: string;
  weight: number; // in kg
  cod: number; // 1 or 0
}

async function getAuthToken(): Promise<string> {
  const settings = await SettingModel.findOne();
  if (!settings) throw new Error('Shiprocket settings not configured');
  const { shiprocketApiKey: email, shiprocketApiSecret: password } = settings;
  const resp = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    { email, password }
  );
  return resp.data.token;
}

export async function getServiceability(params: ServiceabilityParams) {
  const token = await getAuthToken();
  const url = 'https://apiv2.shiprocket.in/v1/external/courier/serviceability/';
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      pickup_postcode: params.pickup_pincode,
      delivery_postcode: params.delivery_pincode,
      weight: params.weight,
      cod: params.cod,
    },
  });
  return resp.data;
}
