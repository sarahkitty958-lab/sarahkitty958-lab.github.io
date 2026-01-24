import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = Deno.env.get('SHOPIFY_STORE_PERMANENT_DOMAIN') || 'yqvmik-xp.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
const SHOPIFY_API_VERSION = '2025-01';

async function shopifyAdminRequest(endpoint: string, method: string = 'GET', body?: object) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify API error:', errorText);
    throw new Error(`Shopify API error: ${response.status}`);
  }
  
  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, productId, ...productData } = await req.json();
    
    switch (action) {
      case 'list-products': {
        const data = await shopifyAdminRequest('products.json?limit=250');
        const products = data.products.map((p: any) => ({
          id: String(p.id),
          title: p.title,
          description: p.body_html?.replace(/<[^>]*>/g, '') || '',
          handle: p.handle,
          productType: p.product_type,
          tags: p.tags?.split(', ').filter(Boolean) || [],
          variants: p.variants.map((v: any) => ({
            id: String(v.id),
            price: v.price,
            sku: v.sku || '',
          })),
          images: p.images.map((img: any) => ({
            id: String(img.id),
            src: img.src,
            alt: img.alt || '',
          })),
        }));
        return new Response(JSON.stringify({ products }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'get-product': {
        const data = await shopifyAdminRequest(`products/${productId}.json`);
        const p = data.product;
        const product = {
          id: String(p.id),
          title: p.title,
          description: p.body_html?.replace(/<[^>]*>/g, '') || '',
          handle: p.handle,
          productType: p.product_type,
          tags: p.tags?.split(', ').filter(Boolean) || [],
          variants: p.variants.map((v: any) => ({
            id: String(v.id),
            price: v.price,
            sku: v.sku || '',
          })),
          images: p.images.map((img: any) => ({
            id: String(img.id),
            src: img.src,
            alt: img.alt || '',
          })),
        };
        return new Response(JSON.stringify({ product }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'create-product': {
        const payload = {
          product: {
            title: productData.title,
            body_html: productData.body || '',
            product_type: productData.product_type || 'Craft Kit',
            tags: productData.tags || '',
            variants: productData.variants?.map((v: any) => ({
              price: v.price || '0.00',
            })) || [{ price: '0.00' }],
            images: productData.images?.map((img: any) => ({
              src: img.file_path,
            })) || [],
          },
        };
        
        const data = await shopifyAdminRequest('products.json', 'POST', payload);
        return new Response(JSON.stringify({ success: true, product: data.product }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'update-product': {
        const payload: any = {
          product: {
            id: productId,
          },
        };
        
        if (productData.title) payload.product.title = productData.title;
        if (productData.body !== undefined) payload.product.body_html = productData.body;
        if (productData.product_type) payload.product.product_type = productData.product_type;
        if (productData.tags !== undefined) payload.product.tags = productData.tags;
        if (productData.variants) {
          payload.product.variants = productData.variants.map((v: any) => ({
            price: v.price || '0.00',
          }));
        }
        if (productData.images) {
          payload.product.images = productData.images.map((img: any) => ({
            src: img.file_path,
          }));
        }
        
        const data = await shopifyAdminRequest(`products/${productId}.json`, 'PUT', payload);
        return new Response(JSON.stringify({ success: true, product: data.product }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      case 'delete-product': {
        await shopifyAdminRequest(`products/${productId}.json`, 'DELETE');
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
