// ---------------------------
// Basic product data (edit these)
const PRODUCTS = [
  { id:1, title:"Embroidered Silk Saree", price:1499, category:"Sarees", img:"images/saree.jpg", desc:"Premium silk saree with zari embroidery."},
  { id:2, title:"Elegant Party Wear Dress", price:1799, category:"Western Wear", img:"images/dress.jpg", desc:"Slim-fit party wear dress."},
  { id:3, title:"Designer Lehenga", price:3499, category:"Lehengas", img:"images/lehenga.jpg", desc:"Bridal lehenga with heavy work."},
  { id:4, title:"Cotton Kurti", price:799, category:"Kurtis", img:"images/kurtis.jpg", desc:"Comfortable daily-wear cotton kurti."},
  { id:5, title:"Kids Party Frock", price:499, category:"Kids Wear", img:"images/kids.jpg", desc:"Cute party frock for kids."},
  { id:6, title:"Designer Blouse", price:699, category:"Blouses", img:"images/blouse.jpg", desc:"Match with your saree."},
  { id:7, title:"Handbag (Accessories)", price:1299, category:"Accessories", img:"images/bag.jpg", desc:"Stylish handbag."},
  { id:8, title:"Dress Material - Cotton", price:999, category:"Dress Materials", img:"images/material.jpg", desc:"Unstitched dress material."},
];

// ---------- Helpers & DOM
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('search');
const categoryChips = document.querySelectorAll('.chip');
const priceFilter = document.getElementById('priceFilter');
const sortBy = document.getElementById('sortBy');
const loadMoreBtn = document.getElementById('loadMore');
const cartBtn = document.getElementById('cartBtn');
const cartCountEl = document.getElementById('cartCount');

let shown = 6;
let activeCat = 'all';
let currentProducts = PRODUCTS.slice();
let CART = JSON.parse(localStorage.getItem('DIVA_CART') || '[]');

// Render products
function renderProducts(list, reset=true){
  if(reset) productGrid.innerHTML = '';
  list.slice(0, shown).forEach(p => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="card-body">
        <div>
          <h3 class="card-title">${p.title}</h3>
          <p class="small">${p.category}</p>
        </div>
        <div>
          <div class="card-price">₹${p.price}</div>
          <div class="card-actions">
            <button class="btn view" data-id="${p.id}">View</button>
            <button class="btn-outline add" data-id="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `;
    productGrid.appendChild(el);
  });
  loadMoreBtn.style.display = (list.length > shown) ? 'inline-block' : 'none';
}

// Initial
renderProducts(currentProducts);

// Search
searchInput && searchInput.addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p => (p.title + ' ' + p.category + ' ' + p.desc).toLowerCase().includes(q));
  currentProducts = filtered;
  shown = 6;
  renderProducts(currentProducts);
});

// Category chips
categoryChips.forEach(c => c.addEventListener('click', () => {
  categoryChips.forEach(x=>x.classList.remove('active'));
  c.classList.add('active');
  activeCat = c.dataset.cat;
  applyFilters();
}));

// Filters
priceFilter.addEventListener('change', applyFilters);
sortBy.addEventListener('change', applyFilters);

function applyFilters(){
  let filtered = PRODUCTS.slice();
  if(activeCat && activeCat !== 'all') filtered = filtered.filter(p=>p.category === activeCat);
  const priceVal = priceFilter.value;
  if(priceVal !== 'all'){
    if(priceVal === '5000') filtered = filtered.filter(p=>p.price >= 5000);
    else {
      const [min,max] = priceVal.split('-').map(Number);
      filtered = filtered.filter(p=>p.price >= min && p.price <= max);
    }
  }
  const q = (searchInput && searchInput.value.trim().toLowerCase()) || '';
  if(q) filtered = filtered.filter(p => (p.title + p.desc + p.category).toLowerCase().includes(q));
  const s = sortBy.value;
  if(s === 'price-asc') filtered.sort((a,b)=>a.price-b.price);
  if(s === 'price-desc') filtered.sort((a,b)=>b.price-a.price);
  currentProducts = filtered;
  shown = 6;
  renderProducts(currentProducts);
}

// Load more
loadMoreBtn.addEventListener('click', ()=>{
  shown += 6;
  renderProducts(currentProducts, true);
});

// Product view modal & add to cart
const modal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalDesc = document.getElementById('modalDesc');
const modalWhatsApp = document.getElementById('modalWhatsApp');
const addToCartBtn = document.getElementById('addToCartBtn');
let currentViewProduct = null;

document.addEventListener('click', (e) => {
  if(e.target.matches('.view')){
    const id = +e.target.dataset.id;
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    currentViewProduct = p;
    modalImg.src = p.img;
    modalTitle.textContent = p.title;
    modalPrice.textContent = `₹${p.price}`;
    modalDesc.textContent = p.desc;
    modalWhatsApp.href = `https://wa.me/919121440893?text=${encodeURIComponent('I want to order ' + p.title)}`;
    modal.setAttribute('aria-hidden','false');
  }
  if(e.target.matches('.add')){
    const id = +e.target.dataset.id;
    addToCartId(id);
  }
});

// modal close
document.getElementById('modalClose').addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click',(e)=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true')});

// add from modal
addToCartBtn.addEventListener('click', ()=> {
  if(currentViewProduct) addToCartId(currentViewProduct.id);
  modal.setAttribute('aria-hidden','true');
});

// CART logic
const cartModal = document.getElementById('cartModal');
const cartItemsEl = document.getElementById('cartItems');
const cartClose = document.getElementById('cartClose');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartTotalEl = document.getElementById('cartTotal');

function saveCart(){ localStorage.setItem('DIVA_CART', JSON.stringify(CART)); updateCartUI(); }
function updateCartUI(){
  cartCountEl.textContent = CART.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  let total = 0;
  CART.forEach(item => {
    const p = PRODUCTS.find(x=>x.id===item.id);
    total += p.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<img src="${p.img}" alt="${p.title}"><div style="flex:1"><strong>${p.title}</strong><div>₹${p.price} × ${item.qty}</div></div>
      <div><button class="btn small plus" data-id="${item.id}">+</button><button class="btn small minus" data-id="${item.id}">-</button><button class="btn-outline remove" data-id="${item.id}">Remove</button></div>`;
    cartItemsEl.appendChild(div);
  });
  cartTotalEl.textContent = `₹${total}`;
}
function addToCartId(id){
  const idx = CART.findIndex(x=>x.id===id);
  if(idx > -1) CART[idx].qty += 1;
  else CART.push({id, qty:1});
  saveCart();
}
function removeFromCartId(id){
  CART = CART.filter(x=>x.id!==id);
  saveCart();
}
function changeQty(id, delta){
  const it = CART.find(x=>x.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty < 1) removeFromCartId(id);
  else saveCart();
}

// cart modal controls
cartBtn.addEventListener('click', ()=> {
  cartModal.setAttribute('aria-hidden','false');
  updateCartUI();
});
cartClose.addEventListener('click', ()=> cartModal.setAttribute('aria-hidden','true'));
cartModal.addEventListener('click',(e)=>{ if(e.target===cartModal) cartModal.setAttribute('aria-hidden','true') });
cartItemsEl.addEventListener('click', (e)=> {
  if(e.target.matches('.plus')) changeQty(+e.target.dataset.id, 1);
  if(e.target.matches('.minus')) changeQty(+e.target.dataset.id, -1);
  if(e.target.matches('.remove')) removeFromCartId(+e.target.dataset.id);
});

// checkout via WhatsApp
checkoutBtn.addEventListener('click', ()=>{
  if(CART.length === 0){ alert('Cart is empty.'); return; }
  let msg = 'New order from website:%0A';
  CART.forEach(item => {
    const p = PRODUCTS.find(x=>x.id===item.id);
    msg += `${p.title} - Qty: ${item.qty} - ₹${p.price * item.qty}%0A`;
  });
  const total = CART.reduce((s,i)=>s + (PRODUCTS.find(p=>p.id===i.id).price * i.qty), 0);
  msg += `Total: ₹${total}%0AName: %0APhone: %0AAddress: `;
  window.open(`https://wa.me/919121440893?text=${encodeURIComponent(msg)}`, '_blank');
});

// render initial cart count
updateCartUI();

// Testimonials carousel simple auto move
const testi = document.getElementById('testiCarousel');
let testiIndex = 0;
setInterval(()=> {
  testiIndex = (testiIndex + 1) % Math.max(1, testi.children.length);
  testi.style.transform = `translateX(-${testiIndex * (testi.children[0].offsetWidth + 12)}px)`;
}, 3500);

// hero slider automated
const hero = document.getElementById('heroSlider');
let heroIndex = 0;
setInterval(()=> {
  heroIndex = (heroIndex + 1) % hero.children.length;
  hero.style.transform = `translateX(-${heroIndex * 100}%)`;
}, 4500);

// order form open wa
document.getElementById('orderForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get('name') || '';
  const phone = fd.get('phone') || '';
  const product = fd.get('product') || '';
  const notes = fd.get('notes') || '';
  const msg = `Order from ${name} (${phone})%0AProduct: ${product}%0ANotes: ${notes}`;
  window.open(`https://wa.me/919121440893?text=${encodeURIComponent(msg)}`, '_blank');
});

// mobile menu
document.getElementById('mobileMenuBtn').addEventListener('click', ()=>{
  const links = document.getElementById('navLinks');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
});
