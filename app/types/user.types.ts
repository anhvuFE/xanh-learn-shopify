// User and customer related types

import { BaseEntity } from './common.types';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  preferences?: UserPreferences;
}

export type UserRole = 'admin' | 'staff' | 'customer' | 'guest';

export interface Permission {
  resource: string;
  actions: PermissionAction[];
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface Customer extends BaseEntity {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing: boolean;
  acceptsMarketingUpdatedAt?: Date;
  marketingOptInLevel?: 'single_opt_in' | 'confirmed_opt_in' | 'unknown';
  tags: string[];
  note?: string;
  verifiedEmail: boolean;
  taxExempt: boolean;
  taxExemptions?: string[];
  defaultAddress?: CustomerAddress;
  addresses: CustomerAddress[];
  ordersCount: number;
  totalSpent: number;
  lastOrderId?: string;
  lastOrderName?: string;
  currency: string;
  state: CustomerState;
  metafields?: CustomerMetafield[];
}

export type CustomerState = 'disabled' | 'invited' | 'enabled' | 'declined';

export interface CustomerAddress extends BaseEntity {
  customerId: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  provinceCode?: string;
  country: string;
  countryCode: string;
  zip?: string;
  phone?: string;
  isDefault: boolean;
}

export interface CustomerMetafield {
  key: string;
  namespace: string;
  value: string;
  type: string;
}

export interface StaffMember extends User {
  departmentId?: string;
  managerId?: string;
  hireDate: Date;
  employeeId: string;
  accessLevel: AccessLevel;
}

export interface AccessLevel {
  orders: boolean;
  products: boolean;
  customers: boolean;
  analytics: boolean;
  marketing: boolean;
  discounts: boolean;
  settings: boolean;
  apps: boolean;
  themes: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}