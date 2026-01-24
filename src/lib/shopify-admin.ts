import { supabase } from '@/integrations/supabase/client';

export interface AdminProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  tags: string[];
  variants: {
    id: string;
    price: string;
    sku: string;
  }[];
  images: {
    id: string;
    src: string;
    alt: string;
  }[];
}

// These functions will call edge functions to interact with Shopify Admin API
// For now, we'll use the Storefront API where possible

export async function fetchAllAdminProducts(): Promise<AdminProduct[]> {
  // Use edge function for admin API access
  const { data, error } = await supabase.functions.invoke('shopify-admin', {
    body: { action: 'list-products' }
  });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data?.products || [];
}

export async function fetchAdminProductById(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase.functions.invoke('shopify-admin', {
    body: { action: 'get-product', productId: id }
  });
  
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data?.product || null;
}

export async function createAdminProduct(productData: {
  title: string;
  body?: string;
  product_type?: string;
  tags?: string;
  variants?: { price: string }[];
  images?: { file_path: string }[];
}): Promise<boolean> {
  const { error } = await supabase.functions.invoke('shopify-admin', {
    body: { action: 'create-product', ...productData }
  });
  
  if (error) {
    console.error('Error creating product:', error);
    return false;
  }
  
  return true;
}

export async function updateAdminProduct(id: string, productData: {
  title?: string;
  body?: string;
  product_type?: string;
  tags?: string;
  variants?: { price: string }[];
  images?: { file_path: string }[];
}): Promise<boolean> {
  const { error } = await supabase.functions.invoke('shopify-admin', {
    body: { action: 'update-product', productId: id, ...productData }
  });
  
  if (error) {
    console.error('Error updating product:', error);
    return false;
  }
  
  return true;
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  const { error } = await supabase.functions.invoke('shopify-admin', {
    body: { action: 'delete-product', productId: id }
  });
  
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  
  return true;
}
