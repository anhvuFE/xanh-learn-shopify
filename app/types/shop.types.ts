// Shop and store related types

import { BaseEntity } from './common.types';

export interface Shop extends BaseEntity {
  domain: string;
  name: string;
  email: string;
  shopOwner: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  phone?: string;
  planName?: string;
  currency: string;
  timezone: string;
  country: string;
  province?: string;
  city?: string;
  taxesIncluded: boolean;
  taxShipping: boolean;
  weightUnit: 'kg' | 'lb';
  myshopifyDomain: string;
}

export interface Address {
  id?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface ShopSettings {
  shopId: string;
  notifications: NotificationSettings;
  checkout: CheckoutSettings;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  taxes: TaxSettings;
}

export interface NotificationSettings {
  orderPlaced: boolean;
  orderCancelled: boolean;
  orderFulfilled: boolean;
  lowStock: boolean;
  newCustomer: boolean;
}

export interface CheckoutSettings {
  requirePhone: boolean;
  requireCompany: boolean;
  autoArchiveOrders: boolean;
  skipShippingForDigital: boolean;
}

export interface ShippingSettings {
  zones: ShippingZone[];
  defaultRate?: number;
  freeShippingThreshold?: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  conditions?: {
    minWeight?: number;
    maxWeight?: number;
    minPrice?: number;
    maxPrice?: number;
  };
}

export interface PaymentSettings {
  providers: PaymentProvider[];
  capturePaymentManually: boolean;
  supportedCurrencies: string[];
}

export interface PaymentProvider {
  id: string;
  name: string;
  enabled: boolean;
  testMode: boolean;
  settings?: Record<string, any>;
}

export interface TaxSettings {
  autoCalculate: boolean;
  includedInPrice: boolean;
  shippingTaxable: boolean;
  rates: TaxRate[];
}

export interface TaxRate {
  id: string;
  country: string;
  province?: string;
  rate: number;
  name: string;
}