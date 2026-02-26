// Product related types

import { BaseEntity } from './common.types';

export interface Product extends BaseEntity {
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: ProductStatus;
  publishedAt?: Date;
  variants: ProductVariant[];
  images: ProductImage[];
  options: ProductOption[];
  seo?: SEOData;
  collections?: string[];
  metafields?: Metafield[];
}

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductVariant extends BaseEntity {
  productId: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  inventoryQuantity: number;
  inventoryPolicy: 'deny' | 'continue';
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  requiresShipping: boolean;
  taxable: boolean;
  featuredImage?: ProductImage;
  position: number;
  options: VariantOption[];
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface ProductImage {
  id: string;
  src: string;
  alt?: string;
  position: number;
  width?: number;
  height?: number;
  variantIds?: string[];
}

export interface ProductOption {
  id: string;
  name: string;
  position: number;
  values: string[];
}

export interface Collection extends BaseEntity {
  title: string;
  description?: string;
  handle: string;
  image?: ProductImage;
  sortOrder: CollectionSortOrder;
  publishedAt?: Date;
  rules?: CollectionRule[];
  disjunctive: boolean; // false = AND, true = OR
  productsCount?: number;
  seo?: SEOData;
}

export type CollectionSortOrder =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'best-selling'
  | 'created-desc'
  | 'created-asc'
  | 'manual'
  | 'price-asc'
  | 'price-desc';

export interface CollectionRule {
  column: string;
  relation: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  condition: string;
}

export interface Inventory {
  productVariantId: string;
  locationId: string;
  quantity: number;
  available: number;
  incoming: number;
  committed: number;
  updatedAt: Date;
}

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface Metafield {
  namespace: string;
  key: string;
  value: string;
  type: MetafieldType;
}

export type MetafieldType =
  | 'string'
  | 'integer'
  | 'json'
  | 'boolean'
  | 'color'
  | 'date'
  | 'date_time'
  | 'dimension'
  | 'file_reference'
  | 'money'
  | 'multi_line_text_field'
  | 'page_reference'
  | 'product_reference'
  | 'rating'
  | 'url'
  | 'variant_reference'
  | 'volume'
  | 'weight';

export interface ProductFilter {
  status?: ProductStatus;
  vendor?: string;
  productType?: string;
  tags?: string[];
  collections?: string[];
  minPrice?: number;
  maxPrice?: number;
  query?: string;
}