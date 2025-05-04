import axios from 'axios';
import SettingModel from '../models/Setting';

interface ServiceabilityParams {
  pickup_pincode: string;
  delivery_pincode: string;
  weight: number; // in kg
  cod: number; // 1 or 0
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const settings = await SettingModel.findOne();
  if (!settings) throw new Error('Shiprocket settings not configured');
  const { shiprocketApiKey: email, shiprocketApiSecret: password } = settings;
  const resp = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    { email, password }
  );
  const { token, expires_in } = resp.data;
  cachedToken = token;
  tokenExpiry = Date.now() + (expires_in - 60) * 1000;
  return token;
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
  const settings = await SettingModel.findOne();
  if (!settings) throw new Error('Shiprocket settings not configured');
  const token = await getAuthToken();
  const url = 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc';
  const payload = {
    order_id: order.id,
    order_date: new Date().toISOString(),
    pickup_location: settings.shiprocketPickupLocation || 'Primary',
    channel_id: settings.shiprocketChannelId,
    billing_customer_name: order.billingCustomerName || '',
    billing_last_name: order.billingLastName || '',
    billing_address: order.billingAddress || '',
    billing_city: order.billingCity || '',
    billing_state: order.billingState || '',
    billing_country: order.billingCountry || '',
    billing_pincode: order.billingPincode || '',
    billing_email: order.billingEmail || '',
    billing_phone: order.billingPhone || '',
    shipping_is_billing: order.shippingIsBilling ?? true,
    shipping_address: order.shippingAddress || '',
    shipping_city: order.shippingCity || '',
    shipping_state: order.shippingState || '',
    shipping_country: order.shippingCountry || '',
    shipping_pincode: order.shippingPincode || '',
    order_items: items.map(i => ({
      name: i.name || i.productId,
      sku: i.sku || i.productId,
      units: i.units || i.quantity,
      selling_price: i.sellingPrice || i.price,
    })),
  };
  const resp = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
  return resp.data;
}
