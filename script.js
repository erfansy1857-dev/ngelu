// Data default jika localStorage masih kosong
const defaultProducts = [
  {
    id: 1,
    name: "Smartphone Premium",
    price: 12000000,
    desc: "Layar 120Hz AMOLED, RAM 12GB, Kamera 108MP, Baterai 5000mAh.\nPerforma super kencang untuk gaming dan multitasking seharian.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
    video: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];

// Ambil data dari localStorage saat pertama kali dimuat
let products = JSON.parse(localStorage.getItem('gadgetStoreProducts')) || defaultProducts;

let uploadedImageBase64 = "";
let uploadedVideoBase64 = "";
let isAdminLoggedIn = false;

// Fungsi untuk menyimpan perubahan ke localStorage
function saveToLocalStorage() {
  localStorage.setItem('gadgetStoreProducts', JSON.stringify(products));
}

// Navigasi Antar Halaman
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(pageId).classList.add('active');

  if (pageId === 'loginPage') {
    document.getElementById('btnNavLogin').classList.add('active');
  } else if (pageId === 'adminPage') {
    renderAdminTable();
  } else if (pageId === 'customerPage') {
    document.getElementById('btnNavCustomer').classList.add('active');
    renderCatalog();
  }
}

// Login Multi-Role
function handleLogin(event) {
  event.preventDefault();
  const role = document.getElementById('role').value;

  if (role === 'admin') {
    isAdminLoggedIn = true;
    document.getElementById('btnNavLogout').style.display = 'inline-block';
    alert("Login Berhasil sebagai Administrator.");
    switchPage('adminPage');
  } else {
    alert("Login Berhasil sebagai Pembeli.");
    switchPage('customerPage');
  }
}

// Logout Admin
function handleLogout() {
  isAdminLoggedIn = false;
  document.getElementById('btnNavLogout').style.display = 'none';
  cancelEdit();
  alert("Anda telah keluar dari Panel Admin.");
  switchPage('loginPage');
}

// Preview Foto (Base64)
function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imgPreview = document.getElementById('imagePreview');
      imgPreview.src = e.target.result;
      imgPreview.style.display = 'block';
      uploadedImageBase64 = e.target.result;
    }
    reader.readAsDataURL(file);
  }
}

// Preview Video (Base64 agar tersimpan permanen di localStorage)
function previewVideo(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const vidPreview = document.getElementById('videoPreview');
      vidPreview.src = e.target.result;
      vidPreview.style.display = 'block';
      uploadedVideoBase64 = e.target.result;
    }
    reader.readAsDataURL(file);
  }
}

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
}

// Simpan Produk (Tambah Baru / Edit)
function saveProduct(event) {
  event.preventDefault();

  const name = document.getElementById('prodName').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const desc = document.getElementById('prodDesc').value;
  const editIndex = parseInt(document.getElementById('editIndex').value);

  if (editIndex === -1) {
    // Mode Tambah Baru
    if (!uploadedImageBase64 || !uploadedVideoBase64) {
      alert("Harap pilih foto dan video dari galeri HP!");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: name,
      price: price,
      desc: desc,
      image: uploadedImageBase64,
      video: uploadedVideoBase64
    };

    products.push(newProduct);
    alert("Produk berhasil ditambahkan!");
  } else {
    // Mode Edit
    products[editIndex].name = name;
    products[editIndex].price = price;
    products[editIndex].desc = desc;

    if (uploadedImageBase64 !== "") {
      products[editIndex].image = uploadedImageBase64;
    }
    if (uploadedVideoBase64 !== "") {
      products[editIndex].video = uploadedVideoBase64;
    }

    alert("Produk berhasil diperbarui!");
  }

  // Simpan ke localStorage & Reset Form
  saveToLocalStorage();
  cancelEdit();
  renderAdminTable();
}

// Render Tabel Admin
function renderAdminTable() {
  const tbody = document.getElementById('adminProductTable');
  tbody.innerHTML = "";

  products.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${item.image}" class="table-thumb" alt="thumb"></td>
      <td><strong>${item.name}</strong></td>
      <td>${formatRupiah(item.price)}</td>
      <td>
        <button class="btn-action-edit" onclick="editProduct(${index})">Edit</button>
        <button class="btn-action-delete" onclick="deleteProduct(${index})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Edit Produk
function editProduct(index) {
  const product = products[index];
  document.getElementById('editIndex').value = index;
  document.getElementById('prodName').value = product.name;
  document.getElementById('prodPrice').value = product.price;
  document.getElementById('prodDesc').value = product.desc;

  document.getElementById('formTitle').innerText = "Panel Administrator - Edit Produk";
  document.getElementById('btnSubmitForm').innerText = "Update Produk";
  document.getElementById('btnCancelEdit').style.display = "block";

  const imgPreview = document.getElementById('imagePreview');
  imgPreview.src = product.image;
  imgPreview.style.display = 'block';
  document.getElementById('imgNote').innerText = "*Biarkan kosong jika tidak ingin mengubah gambar.";

  const vidPreview = document.getElementById('videoPreview');
  vidPreview.src = product.video;
  vidPreview.style.display = 'block';
  document.getElementById('vidNote').innerText = "*Biarkan kosong jika tidak ingin mengubah video.";

  uploadedImageBase64 = "";
  uploadedVideoBase64 = "";

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Batal Edit
function cancelEdit() {
  document.getElementById('editIndex').value = "-1";
  document.getElementById('productForm').reset();
  document.getElementById('formTitle').innerText = "Panel Administrator - Tambah Produk Baru";
  document.getElementById('btnSubmitForm').innerText = "Simpan Produk ke Database";
  document.getElementById('btnCancelEdit').style.display = "none";

  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('videoPreview').style.display = 'none';
  document.getElementById('imgNote').innerText = "";
  document.getElementById('vidNote').innerText = "";

  uploadedImageBase64 = "";
  uploadedVideoBase64 = "";
}

// Hapus Produk
function deleteProduct(index) {
  if (confirm(`Yakin ingin menghapus ${products[index].name}?`)) {
    products.splice(index, 1);
    saveToLocalStorage(); // Simpan perubahan setelah hapus
    renderAdminTable();
  }
}

// Render Katalog Pembeli
function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  grid.innerHTML = "";

  products.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => openModal(index);

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="product-info">
        <div class="product-title">${item.name}</div>
        <div class="product-price">${formatRupiah(item.price)}</div>
        <button class="btn-detail" onclick="event.stopPropagation(); openModal(${index})">Lihat Detail & Video</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Modal Popup Detail
function openModal(index) {
  const item = products[index];
  document.getElementById('modalImg').src = item.image;
  document.getElementById('modalTitle').innerText = item.name;
  document.getElementById('modalPrice').innerText = formatRupiah(item.price);
  document.getElementById('modalDesc').innerText = item.desc;

  const videoPlayer = document.getElementById('modalVideo');
  videoPlayer.src = item.video;

  document.getElementById('modalBuyBtn').onclick = function() {
    closeModal();
    processOrder(item.name);
  };

  document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('productModal');
  const videoPlayer = document.getElementById('modalVideo');
  videoPlayer.pause();
  modal.style.display = 'none';
}

function closeModalOnOverlay(event) {
  if (event.target.id === 'productModal') {
    closeModal();
  }
}

// Fitur Status Pesanan
function processOrder(productName) {
  const statuses = [
    "Pesanan belum dibayar",
    "Pesanan diproses",
    "Pesanan dikirim",
    "Pesanan selesai"
  ];

  let currentStatusIndex = 0;
  const container = document.getElementById('orderStatusContainer');
  const box = document.getElementById('orderStatusBox');

  container.style.display = 'block';
  box.innerHTML = `<strong>Produk:</strong> ${productName}<br><strong>Status:</strong> ${statuses[currentStatusIndex]}`;

  const interval = setInterval(() => {
    currentStatusIndex++;
    if (currentStatusIndex < statuses.length) {
      box.innerHTML = `<strong>Produk:</strong> ${productName}<br><strong>Status:</strong> ${statuses[currentStatusIndex]}`;
    } else {
      clearInterval(interval);
    }
  }, 2500);

  window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
}

// Inisialisasi Katalog
renderCatalog();