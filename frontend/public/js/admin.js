const BASE_URL = 'http://localhost:3000';
const ADMIN_API_URL = `${BASE_URL}/api/admin/products`;

const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const statusBox = document.getElementById('status-box');
const imageInput = document.getElementById('image');
const previewImage = document.getElementById('image-preview');
const tableBody = document.getElementById('products-tbody');

const idInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const priceInput = document.getElementById('price');
const categoryInput = document.getElementById('category');

let editingProductId = null;
let productsCache = [];

function showStatus(message, type = 'info') {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function clearStatus() {
  statusBox.textContent = '';
  statusBox.className = 'status';
}

function buildImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${BASE_URL}${imageUrl}`;
  return `${BASE_URL}/${imageUrl}`;
}

function formatPrice(price) {
  return Number(price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function setPreviewFromFile(file) {
  if (!file) {
    previewImage.style.display = 'none';
    previewImage.removeAttribute('src');
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  previewImage.src = objectUrl;
  previewImage.style.display = 'block';
}

function setPreviewFromUrl(url) {
  if (!url) {
    previewImage.style.display = 'none';
    previewImage.removeAttribute('src');
    return;
  }

  previewImage.src = buildImageUrl(url);
  previewImage.style.display = 'block';
}

function resetFormState() {
  editingProductId = null;
  idInput.value = '';
  form.reset();
  formTitle.textContent = 'Cadastrar produto';
  submitBtn.textContent = 'Salvar produto';
  cancelEditBtn.style.display = 'none';
  setPreviewFromUrl('');
  clearStatus();
}

async function listProductsAdmin() {
  const response = await fetch(ADMIN_API_URL);
  if (!response.ok) {
    throw new Error(`Erro ao listar produtos (${response.status})`);
  }
  return response.json();
}

function renderProductsTable(products) {
  if (!products.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">Nenhum produto cadastrado.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = products.map((product) => {
    const imageSrc = buildImageUrl(product.image_url);
    return `
      <tr>
        <td>
          ${imageSrc
            ? `<img src="${imageSrc}" alt="${product.name}" class="table-image">`
            : '<span class="no-image">Sem imagem</span>'}
        </td>
        <td>${product.name || '-'}</td>
        <td>${formatPrice(product.price)}</td>
        <td>${product.category || '-'}</td>
        <td>
          <button class="btn btn-edit" data-id="${product.id}">Editar</button>
        </td>
        <td>
          <button class="btn btn-delete" data-id="${product.id}">Deletar</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function refreshProductsTable() {
  try {
    const products = await listProductsAdmin();
    productsCache = products;
    renderProductsTable(products);
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

function fillFormForEdit(product) {
  editingProductId = product.id;
  idInput.value = String(product.id);
  nameInput.value = product.name || '';
  descriptionInput.value = product.description || '';
  priceInput.value = product.price;
  categoryInput.value = product.category || '';
  imageInput.value = '';
  setPreviewFromUrl(product.image_url);
  formTitle.textContent = `Editar produto #${product.id}`;
  submitBtn.textContent = 'Atualizar produto';
  cancelEditBtn.style.display = 'inline-block';
  showStatus('Modo edicao ativado. Atualize os campos e salve.', 'info');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function createOrUpdateProduct(event) {
  event.preventDefault();
  clearStatus();

  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const price = priceInput.value;
  const category = categoryInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!name) {
    showStatus('Informe o nome do produto.', 'error');
    return;
  }

  if (!price || Number.isNaN(Number(price))) {
    showStatus('Informe um preco valido.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', price);
  formData.append('category', category);
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const isEdit = Boolean(editingProductId);
  const requestUrl = isEdit ? `${ADMIN_API_URL}/${editingProductId}` : ADMIN_API_URL;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(requestUrl, {
      method,
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Erro ao salvar produto');
    }

    showStatus(
      isEdit ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.',
      'success'
    );
    resetFormState();
    await refreshProductsTable();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

async function deleteProduct(productId) {
  const confirmed = window.confirm('Deseja realmente deletar este produto?');
  if (!confirmed) return;

  try {
    const response = await fetch(`${ADMIN_API_URL}/${productId}`, { method: 'DELETE' });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'Erro ao deletar produto');
    }
    showStatus('Produto deletado com sucesso.', 'success');
    if (editingProductId === productId) {
      resetFormState();
    }
    await refreshProductsTable();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

function handleTableClick(event) {
  const target = event.target;
  const rowId = Number(target.dataset.id);
  if (!rowId) return;

  if (target.classList.contains('btn-edit')) {
    const product = productsCache.find((item) => item.id === rowId);
    if (!product) {
      showStatus('Produto nao encontrado para edicao.', 'error');
      return;
    }
    fillFormForEdit(product);
    return;
  }

  if (target.classList.contains('btn-delete')) {
    deleteProduct(rowId);
  }
}

function initAdminPage() {
  form.addEventListener('submit', createOrUpdateProduct);
  cancelEditBtn.addEventListener('click', resetFormState);
  imageInput.addEventListener('change', () => setPreviewFromFile(imageInput.files[0]));
  tableBody.addEventListener('click', handleTableClick);
  refreshProductsTable();
}

document.addEventListener('DOMContentLoaded', initAdminPage);
