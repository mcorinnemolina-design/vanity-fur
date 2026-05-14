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
            id title description availableForSale onlineStoreUrl
            variants(first: 1) { edges { node { id } } }
            images(first: 1) { edges { node { url altText } } }
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

            const btnHtml = available && variantId
              ? `<button onclick="vfcAddToCart('${variantId}')" style="font-size:0.6875rem;font-weight:400;text-transform:uppercase;letter-spacing:0.1em;color:#8A7E74;border:none;border-bottom:1px solid #C4C0B9;padding-bottom:2px;background:none;cursor:pointer;">Add to Cart</button>`
              : `<span style="font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.1em;color:#C4C0B9;">Out of Stock</span>`;

            return `
              <div class="provisions__card" style="background:#F5F0EB;border:1px solid #D9D3CB;padding:1.5rem;opacity:${available ? '1' : '0.8'};">
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
  const collections = await fetchShopifyCollections();
  renderCollections(collections);
});
