/* ============================================
   VANITY FUR CLUB — Custom Cart Drawer
   Uses Shopify Storefront API directly
   ============================================ */

const VFC_DOMAIN = 'n5mpxs-vd.myshopify.com';
const VFC_TOKEN  = '771e6d7291c9d5e6a332b7557d4643c8';
const VFC_API    = `https://${VFC_DOMAIN}/api/2024-01/graphql.json`;

let vfcCartId   = localStorage.getItem('vfc_cart_id') || null;
let vfcCartData = null;

/* --- Storefront fetch helper --- */
async function vfcFetch(query, variables = {}) {
  const res = await fetch(VFC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': VFC_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

/* --- GraphQL mutations --- */
const GQL_CREATE = `
  mutation cartCreate {
    cartCreate(input: {}) {
      cart { id checkoutUrl
        lines(first:20){ edges{ node{ id quantity
          merchandise { ... on ProductVariant {
            id title
            price { amount currencyCode }
            product { title }
            image { url altText }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } }
      }
    }
  }`;

const GQL_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl
        lines(first:20){ edges{ node{ id quantity
          merchandise { ... on ProductVariant {
            id title
            price { amount currencyCode }
            product { title }
            image { url altText }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } }
      }
    }
  }`;

const GQL_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl
        lines(first:20){ edges{ node{ id quantity
          merchandise { ... on ProductVariant {
            id title
            price { amount currencyCode }
            product { title }
            image { url altText }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } }
      }
    }
  }`;

const GQL_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl
        lines(first:20){ edges{ node{ id quantity
          merchandise { ... on ProductVariant {
            id title
            price { amount currencyCode }
            product { title }
            image { url altText }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } }
      }
    }
  }`;

/* --- Cart helpers --- */
async function vfcEnsureCart() {
  if (!vfcCartId) {
    const r = await vfcFetch(GQL_CREATE);
    vfcCartData = r.data.cartCreate.cart;
    vfcCartId   = vfcCartData.id;
    localStorage.setItem('vfc_cart_id', vfcCartId);
  }
}

window.vfcAddToCart = async function(variantId) {
  await vfcEnsureCart();
  const r = await vfcFetch(GQL_ADD, {
    cartId: vfcCartId,
    lines: [{ merchandiseId: variantId, quantity: 1 }],
  });
  vfcCartData = r.data.cartLinesAdd.cart;
  vfcRenderDrawer();
  vfcOpenDrawer();
};

window.vfcUpdateQty = async function(lineId, qty) {
  if (qty < 1) { window.vfcRemoveLine(lineId); return; }
  const r = await vfcFetch(GQL_UPDATE, {
    cartId: vfcCartId,
    lines: [{ id: lineId, quantity: qty }],
  });
  vfcCartData = r.data.cartLinesUpdate.cart;
  vfcRenderDrawer();
};

window.vfcRemoveLine = async function(lineId) {
  const r = await vfcFetch(GQL_REMOVE, {
    cartId: vfcCartId,
    lineIds: [lineId],
  });
  vfcCartData = r.data.cartLinesRemove.cart;
  vfcRenderDrawer();
};

/* --- Format price --- */
function vfcPrice(amount, code) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code || 'USD',
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

/* --- Render drawer contents --- */
function vfcRenderDrawer() {
  const lines     = vfcCartData?.lines?.edges || [];
  const count     = lines.reduce((s, e) => s + e.node.quantity, 0);
  const badge     = document.getElementById('cart-count');
  const itemsEl   = document.getElementById('vfc-cart-items');
  const subtotalEl= document.getElementById('vfc-cart-subtotal');
  const checkoutEl= document.getElementById('vfc-cart-checkout');
  const emptyEl   = document.getElementById('vfc-cart-empty');

  /* badge */
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  if (!itemsEl) return;

  if (lines.length === 0) {
    if (emptyEl)    emptyEl.style.display = 'block';
    itemsEl.innerHTML = '';
    if (subtotalEl) subtotalEl.textContent = '';
    if (checkoutEl) { checkoutEl.href = '#'; checkoutEl.style.opacity = '0.45'; }
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (checkoutEl) {
    checkoutEl.href    = vfcCartData.checkoutUrl;
    checkoutEl.style.opacity = '1';
  }

  itemsEl.innerHTML = lines.map(({ node: ln }) => {
    const v   = ln.merchandise;
    const img = v.image
      ? `<img src="${v.image.url}" alt="${v.image.altText || v.product.title}" style="width:72px;height:72px;object-fit:cover;flex-shrink:0;">`
      : `<div style="width:72px;height:72px;background:#EDE8E1;flex-shrink:0;"></div>`;
    return `
      <div style="display:flex;gap:1rem;padding:1.25rem 0;border-bottom:1px solid #EDE8E1;align-items:flex-start;">
        ${img}
        <div style="flex:1;min-width:0;">
          <p style="font-family:'Playfair Display',serif;font-size:0.9375rem;color:#2A211D;margin:0 0 0.25rem;">${v.product.title}</p>
          <p style="font-size:0.8125rem;color:#8A7E74;margin:0 0 0.75rem;">${vfcPrice(v.price.amount, v.price.currencyCode)}</p>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <button onclick="vfcUpdateQty('${ln.id}',${ln.quantity - 1})" style="background:none;border:1px solid #D9D3CB;width:28px;height:28px;cursor:pointer;font-size:1rem;color:#2A211D;display:flex;align-items:center;justify-content:center;">−</button>
            <span style="font-size:0.875rem;color:#2A211D;min-width:16px;text-align:center;">${ln.quantity}</span>
            <button onclick="vfcUpdateQty('${ln.id}',${ln.quantity + 1})" style="background:none;border:1px solid #D9D3CB;width:28px;height:28px;cursor:pointer;font-size:1rem;color:#2A211D;display:flex;align-items:center;justify-content:center;">+</button>
          </div>
        </div>
        <button onclick="vfcRemoveLine('${ln.id}')" style="background:none;border:none;cursor:pointer;color:#C4C0B9;font-size:1.375rem;padding:0;line-height:1;flex-shrink:0;">×</button>
      </div>`;
  }).join('');

  const sub = vfcCartData?.cost?.subtotalAmount;
  if (subtotalEl && sub) subtotalEl.textContent = vfcPrice(sub.amount, sub.currencyCode);
}

/* --- Open / close --- */
window.vfcOpenDrawer = function() {
  document.getElementById('vfc-cart-drawer')?.classList.add('vfc-open');
  document.getElementById('vfc-cart-overlay')?.classList.add('vfc-open');
  document.body.style.overflow = 'hidden';
};

window.vfcCloseDrawer = function() {
  document.getElementById('vfc-cart-drawer')?.classList.remove('vfc-open');
  document.getElementById('vfc-cart-overlay')?.classList.remove('vfc-open');
  document.body.style.overflow = '';
};

/* --- Inject drawer HTML + CSS once --- */
function vfcInjectDrawer() {
  if (document.getElementById('vfc-cart-drawer')) return;

  const style = document.createElement('style');
  style.textContent = `
    #vfc-cart-overlay { position:fixed;inset:0;background:rgba(42,33,29,0.35);z-index:998;opacity:0;pointer-events:none;transition:opacity 0.3s ease; }
    #vfc-cart-overlay.vfc-open { opacity:1;pointer-events:all; }
    #vfc-cart-drawer { position:fixed;top:0;right:0;height:100%;width:min(420px,100vw);background:#F5F0EB;z-index:999;transform:translateX(100%);transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;box-shadow:-4px 0 40px rgba(0,0,0,0.12); }
    #vfc-cart-drawer.vfc-open { transform:translateX(0); }
    #vfc-cart-checkout:hover { background:#8A7E74 !important; }
    .shopify-buy-frame--toggle { display:none !important; }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <div id="vfc-cart-overlay" onclick="vfcCloseDrawer()"></div>
    <div id="vfc-cart-drawer">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1.75rem 1.75rem 1.25rem;border-bottom:1px solid #EDE8E1;">
        <h2 style="font-family:'Playfair Display',serif;font-weight:400;font-size:1.25rem;color:#2A211D;margin:0;">Your Cart</h2>
        <button onclick="vfcCloseDrawer()" style="background:none;border:none;cursor:pointer;color:#8A7E74;font-size:1.75rem;padding:0;line-height:1;">×</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:0 1.75rem;">
        <p id="vfc-cart-empty" style="color:#8A7E74;font-size:0.875rem;text-align:center;padding:3rem 0;">Your cart is empty.</p>
        <div id="vfc-cart-items"></div>
      </div>
      <div style="padding:1.5rem 1.75rem;border-top:1px solid #EDE8E1;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;">
          <span style="font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.1em;color:#8A7E74;">Subtotal</span>
          <span id="vfc-cart-subtotal" style="font-family:'Playfair Display',serif;font-size:1rem;color:#2A211D;"></span>
        </div>
        <p style="font-size:0.75rem;color:#8A7E74;margin:0 0 1.25rem;">Shipping and taxes calculated at checkout.</p>
        <a id="vfc-cart-checkout" href="#" style="display:block;text-align:center;background:#2A211D;color:#FDFBF7;font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.12em;padding:1rem;text-decoration:none;opacity:0.45;transition:background 0.2s ease;">Checkout</a>
      </div>
    </div>
  `);
}

/* --- Wire the nav cart icon --- */
function vfcWireCartIcon() {
  const icon = document.getElementById('cart-icon-link');
  if (icon) {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      vfcOpenDrawer();
    });
  }
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  vfcInjectDrawer();
  vfcWireCartIcon();
});
