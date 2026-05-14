/* ============================================
   VANITY FUR CLUB — Product Collections
   Renders dynamic product cards with custom cart
   ============================================ */

const domain = 'n5mpxs-vd.myshopify.com';
const storefrontAccessToken = '771e6d7291c9d5e6a332b7557d4643c8';

async function fetchShopifyCollections() {
  const query = `{
    collections(first: 20) {
      edges { node {
        title handle
        products(first: 20) {
          edges { node {
            id title handle description availableForSale onlineStoreUrl
            variants(first: 1) { edges { node { id } } }
            images(first: 3) { edges { node { url altText } } }
            priceRange { minVariantPrice { amount currencyCode } }
          }}
        }
      }}
    }
  }`;

  try {
    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query }),
    });
    const result = await res.json();
    return result.data.collections.edges.map(e => e.node);
  } catch (err) {
    console.error('Shopify fetch error:', err);
    return [];
  }
}

/* ---- Modal ---- */
function injectModal() {
  if (document.getElementById('vfc-product-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'vfc-product-modal';
  modal.innerHTML = `
    <div class="vfc-modal__backdrop" id="vfc-modal-backdrop"></div>
    <div class="vfc-modal__panel" role="dialog" aria-modal="true" aria-labelledby="vfc-modal-title">
      <button class="vfc-modal__close" id="vfc-modal-close" aria-label="Close">&#x2715;</button>
      <div class="vfc-modal__image-wrap">
        <img id="vfc-modal-img" src="" alt="">
      </div>
      <div class="vfc-modal__body">
        <p class="vfc-modal__eyebrow" id="vfc-modal-eyebrow"></p>
        <h2 class="vfc-modal__title" id="vfc-modal-title"></h2>
        <p class="vfc-modal__price" id="vfc-modal-price"></p>
        <p class="vfc-modal__desc" id="vfc-modal-desc"></p>
        <div class="vfc-modal__actions">
          <button class="vfc-modal__atc btn btn--primary" id="vfc-modal-atc">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.classList.remove('vfc-modal--open');
  document.getElementById('vfc-modal-close').addEventListener('click', close);
  document.getElementById('vfc-modal-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

function openModal(product, variantId, fmtPrice) {
  const modal = document.getElementById('vfc-product-modal');
  const imageUrl = product.images.edges.length ? product.images.edges[0].node.url : '';
  document.getElementById('vfc-modal-img').src = imageUrl;
  document.getElementById('vfc-modal-img').alt = product.title;
  document.getElementById('vfc-modal-eyebrow').textContent = 'Vanity Fur Provisions';
  document.getElementById('vfc-modal-title').textContent = product.title;
  document.getElementById('vfc-modal-price').textContent = fmtPrice;
  document.getElementById('vfc-modal-desc').textContent = product.description;

  const atcBtn = document.getElementById('vfc-modal-atc');
  if (product.availableForSale && variantId) {
    atcBtn.textContent = 'Add to Cart';
    atcBtn.style.opacity = '1';
    atcBtn.onclick = () => { vfcAddToCart(variantId); modal.classList.remove('vfc-modal--open'); };
  } else {
    atcBtn.textContent = 'Out of Stock';
    atcBtn.style.opacity = '0.5';
    atcBtn.onclick = null;
  }

  modal.classList.add('vfc-modal--open');
}

function injectModalStyles() {
  if (document.getElementById('vfc-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'vfc-modal-styles';
  style.textContent = `
    #vfc-product-modal { display: none; position: fixed; inset: 0; z-index: 9999; }
    #vfc-product-modal.vfc-modal--open { display: block; }
    .vfc-modal__backdrop {
      position: absolute; inset: 0;
      background: rgba(42,33,29,0.55);
      backdrop-filter: blur(4px);
      animation: vfc-fade-in 0.25s ease;
    }
    .vfc-modal__panel {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #F5F0EB;
      width: min(92vw, 760px);
      max-height: 90dvh;
      overflow-y: auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid #D9D3CB;
      animation: vfc-slide-up 0.3s ease;
    }
    @media (max-width: 600px) {
      .vfc-modal__panel { grid-template-columns: 1fr; width: 95vw; }
    }
    .vfc-modal__close {
      position: absolute; top: 1rem; right: 1rem;
      background: none; border: none;
      font-size: 1.125rem; cursor: pointer;
      color: #2A211D; z-index: 2; line-height: 1;
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
    }
    .vfc-modal__image-wrap { overflow: hidden; aspect-ratio: 1/1; }
    .vfc-modal__image-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .vfc-modal__body {
      padding: 2.5rem 2rem;
      display: flex; flex-direction: column; justify-content: center;
    }
    .vfc-modal__eyebrow {
      font-family: var(--font-sans, sans-serif);
      font-size: 0.65rem; letter-spacing: 0.18em;
      text-transform: uppercase; color: #8A7E74;
      margin: 0 0 0.75rem;
    }
    .vfc-modal__title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.5rem; font-weight: 400;
      color: #2A211D; margin: 0 0 0.5rem;
    }
    .vfc-modal__price {
      font-family: var(--font-sans, sans-serif);
      font-size: 1rem; color: #2A211D;
      margin: 0 0 1.25rem;
    }
    .vfc-modal__desc {
      font-family: var(--font-sans, sans-serif);
      font-size: 0.875rem; color: #8A7E74;
      line-height: 1.7; margin: 0 0 2rem;
      flex: 1;
    }
    .vfc-modal__atc { width: 100%; }
    @keyframes vfc-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes vfc-slide-up { from { transform: translate(-50%, -44%); opacity: 0; } to { transform: translate(-50%, -50%); opacity: 1; } }

    /* Card hover cursor */
    .provisions__card { cursor: pointer; transition: box-shadow 0.2s ease, transform 0.2s ease; }
    .provisions__card:hover { box-shadow: 0 8px 32px rgba(42,33,29,0.1); transform: translateY(-2px); }
  `;
  document.head.appendChild(style);
}

function renderCollections(collections) {
  const container = document.getElementById('shopify-collections-container');
  if (!container) return;

  container.innerHTML = '';

  const valid = collections.filter(c => c.products.edges.length > 0 && c.handle !== 'frontpage');
  const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
  const toRender = isHome ? valid.slice(0, 1) : valid;

  toRender.forEach(collection => {
    const html = `
      <div class="collection-section" style="margin-bottom:4rem;">
        <h3 class="reveal" style="margin-top:3rem;margin-bottom:2rem;font-family:var(--font-serif);font-size:1.5rem;color:var(--charcoal);">${collection.title}</h3>
        <div class="provisions__grid reveal-stagger">
          ${collection.products.edges.map(({ node: p }) => {
            const variantId  = p.variants.edges.length ? p.variants.edges[0].node.id : null;
            const imageUrl   = p.images.edges.length ? p.images.edges[0].node.url : 'assets/images/texture.png';
            const altText    = p.images.edges.length && p.images.edges[0].node.altText ? p.images.edges[0].node.altText : p.title;
            const price      = parseFloat(p.priceRange.minVariantPrice.amount);
            const fmtPrice   = new Intl.NumberFormat('en-US', { style:'currency', currency: p.priceRange.minVariantPrice.currencyCode || 'USD', minimumFractionDigits:0 }).format(price);
            const shortDesc  = p.description.length > 200 ? p.description.substring(0, 200) + '...' : p.description;
            const available  = p.availableForSale;
            const productJson = JSON.stringify(p).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

            const btnHtml = available && variantId
              ? `<button onclick="event.stopPropagation();vfcAddToCart('${variantId}')" style="font-size:0.6875rem;font-weight:400;text-transform:uppercase;letter-spacing:0.1em;color:#8A7E74;border:none;border-bottom:1px solid #C4C0B9;padding-bottom:2px;background:none;cursor:pointer;">Add to Cart</button>`
              : `<span style="font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.1em;color:#C4C0B9;">Out of Stock</span>`;

            return `
              <div class="provisions__card" style="background:#F5F0EB;border:1px solid #D9D3CB;padding:1.5rem;opacity:${available ? '1' : '0.8'};"
                   onclick="openModal(JSON.parse(this.dataset.product), '${variantId}', '${fmtPrice}')"
                   data-product="${productJson}">
                <img src="${imageUrl}" alt="${altText}" loading="lazy" style="width:100%;aspect-ratio:1/1;object-fit:cover;margin-bottom:1.25rem;background:#EDE8E1;filter:${available ? 'none' : 'grayscale(30%)'};">
                <h3 style="font-family:'Playfair Display',Georgia,serif;font-size:1.0625rem;font-weight:400;color:#2A211D;margin-bottom:0.375rem;">${p.title}</h3>
                <p style="font-size:0.8125rem;color:#8A7E74;margin-bottom:0.75rem;line-height:1.5;">${shortDesc}</p>
                <p style="font-size:0.875rem;font-weight:400;color:#2A211D;margin-bottom:1rem;">${fmtPrice}</p>
                ${btnHtml}
              </div>`;
          }).join('')}
        </div>
      </div>`;

    container.innerHTML += html;
  });

  setTimeout(() => {
    container.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('visible'));
  }, 100);
}

document.addEventListener('DOMContentLoaded', async () => {
  injectModalStyles();
  injectModal();
  const collections = await fetchShopifyCollections();
  renderCollections(collections);
});
