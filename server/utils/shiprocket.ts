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

// Create an adhoc shipment/order in Shiprocket
export async function createShipment(order: any, items: any[]) {
  const token = await getAuthToken();
  const url = 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc';
  const payload = {
    order_id: order.id,
    order_date: new Date().toISOString(),
    pickup_location: 'Primary',
    channel_id: 1,
    billing_customer_name: '', // TODO: provide customer name
    billing_address: order.shippingAddress || '',
    billing_city: '', billing_state: '', billing_country: '', billing_pincode: '',
    billing_email: '', billing_phone: '',
    shipping_is_billing: true,
    order_items: items.map(i => ({
      name: i.productId,
      sku: i.productId,
      units: i.quantity,
      selling_price: i.price,
    })),
  };
  const resp = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
  return resp.data;
}
