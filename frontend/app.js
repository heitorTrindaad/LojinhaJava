/* ═══════════════════════════════════════════════════════════
   LOJINHA — app.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════
const state = {
  currentPage:     'auth',
  user:            null,   // { email, auth }
  products:        [],
  cart:            [],     // array of product objects
  detailProduct:   null,
  deleteProductId: null,
};

// ════════════════════════════════════════════════════════════
// API LAYER
// ════════════════════════════════════════════════════════════
const BASE_URL = '/api';

/**
 * Generic fetch wrapper.
 * Automatically injects the Basic Auth header from localStorage.
 * Throws { status, data } on non-OK responses.
 */
async function apiRequest(method, path, body = null, overrideAuth = null) {
  const headers = { 'Content-Type': 'application/json' };
  const auth = overrideAuth || localStorage.getItem('user_auth');
  if (auth) headers['Authorization'] = `Basic ${auth}`;

  const options = { method, headers };
  if (body !== null && Object.keys(body).length > 0) { // Só envia se o objeto não estiver vazio
    options.body = JSON.stringify(body);
}

  const response = await fetch(BASE_URL + path, options);
  const text = await response.text();

  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!response.ok) throw { status: response.status, data };
  return data;
}

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha  = document.getElementById('login-senha').value;
  const alert  = document.getElementById('login-alert');
  const btn    = document.getElementById('login-btn');

  if (!email || !senha) {
    showAlert(alert, 'Preencha todos os campos.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try {
    // 1. Enviamos APENAS o JSON, sem o 'auth' no final para não confundir o Spring
    const loginData = { email: email, senha: senha };
    
    // Note que aqui passamos 'null' no lugar do overrideAuth
    await apiRequest('POST', '/usuarios/login', loginData, null);

    // 2. Se o servidor respondeu 200 OK, agora sim salvamos as credenciais
    const auth = btoa(`${email}:${senha}`);
    localStorage.setItem('user_auth', auth);
    localStorage.setItem('user_email', email);

    state.user = { email, auth };
    onLoginSuccess();
  } catch (e) {
    // Se der erro 400 ou 401, ele cai aqui
    showAlert(alert, 'E-mail ou senha incorretos.');
    console.error("Erro detalhado:", e.data); // Olhe isso no F12 para ver o que o Java respondeu
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar na Lojinha';
  }
}


async function doCadastro() {
  const nome     = document.getElementById('cad-nome').value.trim();
  const email    = document.getElementById('cad-email').value.trim();
  const telefone = document.getElementById('cad-telefone').value.trim();
  const senha    = document.getElementById('cad-senha').value;
  const tipo     = document.getElementById('cad-tipo').value;
  const alert    = document.getElementById('cad-alert');
  const btn      = document.getElementById('cad-btn');

  if (!nome || !email || !telefone || !senha) {
    showAlert(alert, 'Preencha todos os campos.');
    return;
  }
  if (senha.length < 6) {
    showAlert(alert, 'A senha precisa ter pelo menos 6 caracteres.');
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Criando conta...';
  hideAlert(alert);

  try {
    await apiRequest('POST', '/usuarios/cadastrar', { nome, email, telefone, senha, tipo });
    showToast('Conta criada com sucesso! Faça o login.', 'success');
    switchAuthTab('login');
    document.getElementById('login-email').value = email;
  } catch (e) {
    showAlert(alert, e.data || 'Erro ao criar conta. Tente novamente.');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Criar minha conta';
  }
}

function doLogout() {
  localStorage.removeItem('user_auth');
  localStorage.removeItem('user_email');
  state.user = null;
  state.cart = [];
  updateCartBadges();
  showPage('auth');
}

/** Called after a successful login to set up the UI and navigate to the shop. */
function onLoginSuccess() {
  const email = state.user.email;
  const chip  = email.split('@')[0];

  ['nav-user-chip', 'detail-user-chip', 'cart-user-chip'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = chip;
  });

  showPage('shop');
  loadProducts();
}

// ════════════════════════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════════════════════════

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = `<div class="loading-grid"><div class="spinner"></div> Carregando produtos...</div>`;

  try {
    const data      = await apiRequest('GET', '/produtos');
    state.products  = Array.isArray(data) ? data : [];
    renderProducts(state.products);
  } catch {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Não foi possível carregar os produtos.</h3>
      </div>`;
  }
}

function filterProducts() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const tipo  = document.getElementById('filter-tipo').value;

  const filtered = state.products.filter(p => {
    const matchText = p.nome?.toLowerCase().includes(query) || p.descricao?.toLowerCase().includes(query);
    const matchTipo = !tipo || p.tipo === tipo;
    return matchText && matchTipo;
  });

  renderProducts(filtered);
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <h3>Nenhum produto encontrado.</h3>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick="showDetail(${p.id})">
      <div class="card-image">
        <span class="card-emoji">${tipoEmoji(p.tipo)}</span>
        <span class="card-badge">${tipoLabel(p.tipo)}</span>
      </div>
      <div class="card-body">
        <div class="card-name">${escHtml(p.nome)}</div>
        <div class="card-desc">${escHtml(p.descricao || 'Sem descrição.')}</div>
        <div class="card-footer">
          <div class="card-price"><span>R$</span> ${fmtPreco(p.preco)}</div>
          <div class="card-stock ${p.estoque > 0 ? 'stock-ok' : 'stock-out'}">
            ${p.estoque > 0 ? `${p.estoque} em estoque` : 'Esgotado'}
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button
          class="btn-add-cart"
          ${p.estoque <= 0 ? 'disabled' : ''}
          onclick="event.stopPropagation(); addToCart(${p.id})"
        >
          Adicionar ao carrinho
        </button>
        ${canDeleteProduct(p) ? `
          <button
            class="btn-danger"
            onclick="event.stopPropagation(); openDeleteModal(${p.id})"
          >🗑</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/** Returns true if the logged-in user is the seller of this product. */
function canDeleteProduct(product) {
  return state.user && product.vendedor && product.vendedor.email === state.user.email;
}

// ════════════════════════════════════════════════════════════
// PRODUCT DETAIL
// ════════════════════════════════════════════════════════════

function showDetail(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;

  state.detailProduct = product;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-visual">${tipoEmoji(product.tipo)}</div>
    <div class="detail-info">
      <span class="detail-tipo">${tipoLabel(product.tipo)}</span>
      <div class="detail-name">${escHtml(product.nome)}</div>
      <div class="detail-desc">${escHtml(product.descricao || 'Sem descrição detalhada.')}</div>
      <div class="detail-price">R$ ${fmtPreco(product.preco)}</div>
      <div class="detail-meta">
        <div class="detail-meta-item">
          <div class="detail-meta-label">Disponibilidade</div>
          <div class="detail-meta-value" style="color: ${product.estoque > 0 ? 'var(--success)' : 'var(--danger)'}">
            ${product.estoque > 0 ? `${product.estoque} unidades` : 'Esgotado'}
          </div>
        </div>
        ${product.vendedor ? `
          <div class="detail-meta-item">
            <div class="detail-meta-label">Vendedor</div>
            <div class="detail-meta-value">${escHtml(product.vendedor.nome || product.vendedor.email || '—')}</div>
          </div>
        ` : ''}
        <div class="detail-meta-item">
          <div class="detail-meta-label">ID</div>
          <div class="detail-meta-value" style="color: var(--muted)">#${product.id}</div>
        </div>
      </div>
      <div class="detail-actions">
        <button
          class="btn-primary"
          ${product.estoque <= 0 ? 'disabled' : ''}
          onclick="addToCart(${product.id}); showPage('cart')"
        >
          ${product.estoque > 0 ? '🛒  Adicionar ao carrinho' : 'Produto esgotado'}
        </button>
        ${canDeleteProduct(product) ? `
          <button
            class="btn-danger"
            style="padding: 14px 20px; font-size: 14px;"
            onclick="openDeleteModal(${product.id})"
          >🗑 Excluir</button>
        ` : ''}
      </div>
    </div>
  `;

  showPage('detail');
}

// ════════════════════════════════════════════════════════════
// CART
// ════════════════════════════════════════════════════════════

function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product || product.estoque <= 0) return;

  state.cart.push(product);
  updateCartBadges();
  showToast(`"${product.nome}" adicionado ao carrinho!`, 'success');
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  updateCartBadges();
  renderCart();
}

function updateCartBadges() {
  const count = state.cart.length;
  ['cart-badge', 'detail-cart-badge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });
}

function renderCart() {
  const layout = document.getElementById('cart-layout');

  if (state.cart.length === 0) {
    layout.innerHTML = `
      <div class="empty-cart">
        <div class="icon">🛒</div>
        <h3>Seu carrinho está vazio</h3>
        <button class="btn-primary" style="width: auto; padding: 12px 32px; margin-top: 8px" onclick="showPage('shop')">
          Explorar produtos
        </button>
      </div>`;
    return;
  }

  const total    = state.cart.reduce((sum, p) => sum + p.preco, 0);
  const countMap = {};
  state.cart.forEach(p => { countMap[p.tipo] = (countMap[p.tipo] || 0) + 1; });

  layout.innerHTML = `
    <div class="cart-items">
      ${state.cart.map((p, i) => `
        <div class="cart-item">
          <div class="cart-item-emoji">${tipoEmoji(p.tipo)}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${escHtml(p.nome)}</div>
            <div class="cart-item-tipo">${tipoLabel(p.tipo)}</div>
          </div>
          <div class="cart-item-price">R$ ${fmtPreco(p.preco)}</div>
          <button class="cart-remove" onclick="removeFromCart(${i})">✕</button>
        </div>
      `).join('')}
    </div>
    <div class="cart-summary">
      <div class="summary-title">Resumo</div>
      ${Object.entries(countMap).map(([tipo, count]) => `
        <div class="summary-row">
          <span>${tipoLabel(tipo)} (${count})</span>
          <span>—</span>
        </div>
      `).join('')}
      <div class="summary-row">
        <span>${state.cart.length} item${state.cart.length !== 1 ? 's' : ''}</span>
        <span>R$ ${fmtPreco(total)}</span>
      </div>
      <div class="summary-total">
        <span>Total</span>
        <span class="summary-total-value">R$ ${fmtPreco(total)}</span>
      </div>
      <button class="btn-primary" onclick="doCheckout()">Finalizar Compra</button>
      <button class="btn-secondary" style="width: 100%; margin-top: 10px; text-align: center;" onclick="showPage('shop')">
        Continuar comprando
      </button>
    </div>
  `;
}

async function doCheckout() {
  if (state.cart.length === 0) return;

  const productIds = state.cart.map(p => p.id);

  try {
    await apiRequest('POST', '/compras/finalizar', productIds);
    state.cart = [];
    updateCartBadges();
    showToast('Compra finalizada com sucesso! 🎉', 'success');
    await loadProducts();
    showPage('shop');
  } catch (e) {
    showToast(e.data || 'Erro ao finalizar compra.', 'error');
  }
}

// ════════════════════════════════════════════════════════════
// NEW PRODUCT
// ════════════════════════════════════════════════════════════

function openNewProductModal() {
  document.getElementById('np-nome').value      = '';
  document.getElementById('np-descricao').value = '';
  document.getElementById('np-preco').value     = '';
  document.getElementById('np-estoque').value   = '';
  hideAlert(document.getElementById('np-alert'));
  document.getElementById('modal-new-product').classList.add('show');
}

async function doNewProduct() {
  const nome      = document.getElementById('np-nome').value.trim();
  const descricao = document.getElementById('np-descricao').value.trim();
  const preco     = parseFloat(document.getElementById('np-preco').value);
  const estoque   = parseInt(document.getElementById('np-estoque').value, 10);
  const tipo      = document.getElementById('np-tipo').value;
  const alert     = document.getElementById('np-alert');

  if (!nome || !descricao || isNaN(preco) || isNaN(estoque)) {
    showAlert(alert, 'Preencha todos os campos corretamente.');
    return;
  }

  try {
    await apiRequest('POST', '/produtos', { nome, descricao, preco, estoque, tipo });
    closeModal('modal-new-product');
    showToast('Produto cadastrado com sucesso!', 'success');
    await loadProducts();
  } catch (e) {
    showAlert(alert, e.data || 'Erro ao cadastrar produto.');
  }
}

// ════════════════════════════════════════════════════════════
// DELETE PRODUCT
// ════════════════════════════════════════════════════════════

function openDeleteModal(id) {
  state.deleteProductId = id;
  document.getElementById('del-senha').value = '';
  hideAlert(document.getElementById('del-alert'));
  document.getElementById('modal-delete').classList.add('show');
}

async function confirmDelete() {
  const senha = document.getElementById('del-senha').value;
  const alert = document.getElementById('del-alert');

  if (!senha) {
    showAlert(alert, 'Digite sua senha para confirmar.');
    return;
  }

  try {
    await apiRequest('DELETE', `/produtos/${state.deleteProductId}?senhaConfirmacao=${encodeURIComponent(senha)}`);
    closeModal('modal-delete');
    showToast('Produto removido.', 'success');
    await loadProducts();
    if (state.currentPage === 'detail') showPage('shop');
  } catch (e) {
    showAlert(alert, e.data || 'Erro ao excluir. Verifique sua senha.');
  }
}

// ════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  state.currentPage = name;
  window.scrollTo(0, 0);

  if (name === 'cart')  renderCart();
  if (name === 'shop')  document.getElementById('btn-new-product').style.display = 'flex';
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'cadastro'));
  });
  document.getElementById('form-login').classList.toggle('active',    tab === 'login');
  document.getElementById('form-cadastro').classList.toggle('active', tab === 'cadastro');
}

// ════════════════════════════════════════════════════════════
// MODALS
// ════════════════════════════════════════════════════════════

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

// Close modal by clicking on the backdrop
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});

// ════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ════════════════════════════════════════════════════════════

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');

  toast.className   = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

// ════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════════════════════════

document.addEventListener('keydown', e => {
  // Enter to submit login
  if (e.key === 'Enter' && state.currentPage === 'auth') {
    const isLoginActive = document.getElementById('form-login').classList.contains('active');
    if (isLoginActive) doLogin();
  }

  // Escape to close any open modal
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
  }
});

// ════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ════════════════════════════════════════════════════════════

/** Show an alert element with a message. */
function showAlert(el, message) {
  el.textContent = message;
  el.classList.add('show');
}

/** Hide an alert element. */
function hideAlert(el) {
  el.classList.remove('show');
}

/** Escape HTML special characters to prevent XSS. */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Format a price number to Brazilian format (e.g. "29,90"). */
function fmtPreco(n) {
  return Number(n).toFixed(2).replace('.', ',');
}

/** Return a human-readable label for a product type. */
function tipoLabel(tipo) {
  const labels = { ELETRONICO: 'Eletrônico', VESTUARIO: 'Vestuário', ALIMENTO: 'Alimento' };
  return labels[tipo] || tipo || '—';
}

/** Return an emoji representing a product type. */
function tipoEmoji(tipo) {
  const emojis = { ELETRONICO: '💻', VESTUARIO: '👕', ALIMENTO: '🍎' };
  return emojis[tipo] || '📦';
}

// ════════════════════════════════════════════════════════════
// INIT — auto-login if session exists in localStorage
// ════════════════════════════════════════════════════════════

(function init() {
  const auth  = localStorage.getItem('user_auth');
  const email = localStorage.getItem('user_email');

  if (auth && email) {
    state.user = { email, auth };
    onLoginSuccess();
  }
})();
