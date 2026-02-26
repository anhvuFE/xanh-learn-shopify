// API related types and interfaces

export interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Record<string, any>;
}

export interface RESTEndpoint {
  method: HTTPMethod;
  path: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface WebhookPayload<T = any> {
  id: string;
  topic: WebhookTopic;
  shop: string;
  createdAt: Date;
  data: T;
}

export type WebhookTopic =
  | 'APP_UNINSTALLED'
  | 'APP_SUBSCRIPTIONS_UPDATE'
  | 'APP_PURCHASES_ONE_TIME_UPDATE'
  | 'CARTS_CREATE'
  | 'CARTS_UPDATE'
  | 'CHECKOUTS_CREATE'
  | 'CHECKOUTS_UPDATE'
  | 'CHECKOUTS_DELETE'
  | 'COLLECTIONS_CREATE'
  | 'COLLECTIONS_UPDATE'
  | 'COLLECTIONS_DELETE'
  | 'CUSTOMERS_CREATE'
  | 'CUSTOMERS_UPDATE'
  | 'CUSTOMERS_DELETE'
  | 'CUSTOMER_GROUPS_CREATE'
  | 'CUSTOMER_GROUPS_UPDATE'
  | 'CUSTOMER_GROUPS_DELETE'
  | 'DRAFT_ORDERS_CREATE'
  | 'DRAFT_ORDERS_UPDATE'
  | 'DRAFT_ORDERS_DELETE'
  | 'FULFILLMENTS_CREATE'
  | 'FULFILLMENTS_UPDATE'
  | 'FULFILLMENT_EVENTS_CREATE'
  | 'FULFILLMENT_EVENTS_DELETE'
  | 'INVENTORY_ITEMS_CREATE'
  | 'INVENTORY_ITEMS_UPDATE'
  | 'INVENTORY_ITEMS_DELETE'
  | 'INVENTORY_LEVELS_CONNECT'
  | 'INVENTORY_LEVELS_UPDATE'
  | 'INVENTORY_LEVELS_DISCONNECT'
  | 'ORDERS_CREATE'
  | 'ORDERS_UPDATE'
  | 'ORDERS_DELETE'
  | 'ORDERS_CANCELLED'
  | 'ORDERS_FULFILLED'
  | 'ORDERS_PAID'
  | 'ORDERS_PARTIALLY_FULFILLED'
  | 'ORDER_TRANSACTIONS_CREATE'
  | 'PRODUCTS_CREATE'
  | 'PRODUCTS_UPDATE'
  | 'PRODUCTS_DELETE'
  | 'PRODUCT_LISTINGS_ADD'
  | 'PRODUCT_LISTINGS_UPDATE'
  | 'PRODUCT_LISTINGS_REMOVE'
  | 'REFUNDS_CREATE'
  | 'SHOP_UPDATE'
  | 'THEMES_CREATE'
  | 'THEMES_UPDATE'
  | 'THEMES_DELETE'
  | 'THEMES_PUBLISH';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface AdminAPIResponse<T = any> {
  data: T;
  rateLimit?: RateLimitInfo;
  nextPageInfo?: string;
  previousPageInfo?: string;
}

export interface BulkOperationResult {
  id: string;
  status: BulkOperationStatus;
  errorCode?: string;
  createdAt: Date;
  completedAt?: Date;
  objectCount?: number;
  fileSize?: number;
  url?: string;
  partialDataUrl?: string;
}

export type BulkOperationStatus =
  | 'CREATED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'CANCELED'
  | 'FAILED'
  | 'ACCESS_DENIED'
  | 'TIMED_OUT'
  | 'PARTIALLY_COMPLETED';

export interface ShopifyError {
  field?: string[];
  message: string;
  code?: string;
}

export interface RequestOptions {
  retries?: number;
  timeout?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}