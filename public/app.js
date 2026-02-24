let currentUser = null;
let allKayitlar = [];
let editingId = null;

// Check authentication on load
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('newRecordBtn').addEventListener('click', showNewRecordForm);
    document.getElementById('kayitForm').addEventListener('submit', handleSubmit);
    document.getElementById('cancelBtn').addEventListener('click', hideForm);
    document.getElementById('searchBox').addEventListener('input', handleSearch);
}

async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginScreen();
        return;
    }

    try {
        const response = await fetch('/api/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            showMainApp();
            fetchKayitlar();
        } else {
            localStorage.removeItem('token');
            showLoginScreen();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLoginScreen();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            errorDiv.classList.add('hidden');
            showMainApp();
            fetchKayitlar();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = 'Bağlantı hatası';
        errorDiv.classList.remove('hidden');
    }
}

async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('token');
    currentUser = null;
    showLoginScreen();
}

async function fetchKayitlar() {
    const loading = document.getElementById('loading');
    const table = document.getElementById('kayitTable');
    
    loading.classList.remove('hidden');
    table.classList.add('hidden');

    try {
        const response = await fetch('/api/kayitlar', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        allKayitlar = await response.json();
        renderKayitlar(allKayitlar);
        
        loading.classList.add('hidden');
        table.classList.remove('hidden');
    } catch (error) {
        console.error('Fetch error:', error);
        loading.textContent = 'Yükleme hatası';
    }
}

function renderKayitlar(kayitlar) {
    const tbody = document.getElementById('kayitTableBody');
    
    if (kayitlar.length === 0) {
        tbody.innerHTML = '<tr><td colspan="16" class="empty-state">Henüz kayıt yok.</td></tr>';
        return;
    }

    tbody.innerHTML = kayitlar.map(kayit => `
        <tr>
            <td>${kayit.bolum || ''}</td>
            <td>${kayit.teklif_no || ''}</td>
            <td>${kayit.musteri_ismi || ''}</td>
            <td>${kayit.teklif_tarihi || ''}</td>
            <td>${kayit.onay_tarihi || ''}</td>
            <td>${kayit.uretime_verilme_tarihi || ''}</td>
            <td>${kayit.uretim_numarasi || ''}</td>
            <td>${kayit.cam_siparis_tarihi || ''}</td>
            <td>${kayit.cam_siparis_numarasi || ''}</td>
            <td>${kayit.cam_adedi || ''}</td>
            <td>${kayit.uretim_planlama_tarihi || ''}</td>
            <td>${kayit.paketleme_tarihi || ''}</td>
            <td>${kayit.kasetleme_tarihi || ''}</td>
            <td>${kayit.sevk_tarihi || ''}</td>
            <td class="notlar-cell">${kayit.notlar || ''}</td>
            <td class="actions">
                <button onclick="editKayit(${kayit.id})" class="btn btn-success">
                    ${currentUser.role === 'admin' ? 'Düzenle' : 'Not Ekle'}
                </button>
                ${currentUser.role === 'admin' ? `
                    <button onclick="deleteKayit(${kayit.id})" class="btn btn-danger">Sil</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function showNewRecordForm() {
    editingId = null;
    document.getElementById('formTitle').textContent = 'Yeni Kayıt';
    document.getElementById('adminForm').innerHTML = getAdminFormHTML();
    document.getElementById('adminForm').classList.remove('hidden');
    document.getElementById('userForm').classList.add('hidden');
    document.getElementById('submitBtn').textContent = 'Kaydet';
    document.getElementById('formSection').classList.remove('hidden');
}

function editKayit(id) {
    const kayit = allKayitlar.find(k => k.id === id);
    if (!kayit) return;

    editingId = id;
    document.getElementById('formSection').classList.remove('hidden');

    if (currentUser.role === 'user') {
        document.getElementById('formTitle').textContent = 'Not Ekle';
        document.getElementById('adminForm').classList.add('hidden');
        document.getElementById('userForm').classList.remove('hidden');
        document.getElementById('notInput').value = '';
        document.getElementById('submitBtn').textContent = 'Not Ekle';
    } else {
        document.getElementById('formTitle').textContent = 'Kayıt Düzenle';
        document.getElementById('adminForm').innerHTML = getAdminFormHTML(kayit);
        document.getElementById('adminForm').classList.remove('hidden');
        document.getElementById('userForm').classList.add('hidden');
        document.getElementById('submitBtn').textContent = 'Güncelle';
    }
}

async function deleteKayit(id) {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;

    try {
        await fetch(`/api/kayitlar/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        fetchKayitlar();
    } catch (error) {
        alert('Silme hatası');
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    if (currentUser.role === 'user') {
        const notlar = document.getElementById('notInput').value;
        await fetch(`/api/kayitlar/${editingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ notlar })
        });
    } else {
        const formData = getFormData();
        const url = editingId ? `/api/kayitlar/${editingId}` : '/api/kayitlar';
        const method = editingId ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });
    }

    hideForm();
    fetchKayitlar();
}

function getFormData() {
    return {
        bolum: document.getElementById('bolum').value,
        teklif_no: document.getElementById('teklif_no').value,
        musteri_ismi: document.getElementById('musteri_ismi').value,
        teklif_tarihi: document.getElementById('teklif_tarihi').value,
        onay_tarihi: document.getElementById('onay_tarihi').value,
        uretime_verilme_tarihi: document.getElementById('uretime_verilme_tarihi').value,
        uretim_numarasi: document.getElementById('uretim_numarasi').value,
        cam_siparis_tarihi: document.getElementById('cam_siparis_tarihi').value,
        cam_siparis_numarasi: document.getElementById('cam_siparis_numarasi').value,
        cam_adedi: document.getElementById('cam_adedi').value,
        uretim_planlama_tarihi: document.getElementById('uretim_planlama_tarihi').value,
        paketleme_tarihi: document.getElementById('paketleme_tarihi').value,
        kasetleme_tarihi: document.getElementById('kasetleme_tarihi').value,
        sevk_tarihi: document.getElementById('sevk_tarihi').value,
        notlar: document.getElementById('notlar').value
    };
}

function getAdminFormHTML(kayit = {}) {
    return `
        <div class="form-group">
            <label>Bölüm</label>
            <input type="text" id="bolum" value="${kayit.bolum || ''}">
        </div>
        <div class="form-group">
            <label>Teklif Numarası</label>
            <input type="text" id="teklif_no" value="${kayit.teklif_no || ''}">
        </div>
        <div class="form-group">
            <label>Müşteri İsmi</label>
            <input type="text" id="musteri_ismi" value="${kayit.musteri_ismi || ''}">
        </div>
        <div class="form-group">
            <label>Teklif Tarihi</label>
            <input type="date" id="teklif_tarihi" value="${kayit.teklif_tarihi || ''}">
        </div>
        <div class="form-group">
            <label>Onay Tarihi</label>
            <input type="date" id="onay_tarihi" value="${kayit.onay_tarihi || ''}">
        </div>
        <div class="form-group">
            <label>Üretime Verilme Tarihi</label>
            <input type="date" id="uretime_verilme_tarihi" value="${kayit.uretime_verilme_tarihi || ''}">
        </div>
        <div class="form-group">
            <label>Üretim Numarası</label>
            <input type="text" id="uretim_numarasi" value="${kayit.uretim_numarasi || ''}">
        </div>
        <div class="form-group">
            <label>Cam Sipariş Tarihi</label>
            <input type="date" id="cam_siparis_tarihi" value="${kayit.cam_siparis_tarihi || ''}">
        </div>
        <div class="form-group">
            <label>Cam Sipariş Numarası</label>
            <input type="text" id="cam_siparis_numarasi" value="${kayit.cam_siparis_numarasi || ''}">
        </div>
        <div class="form-group">
            <label>Cam Adedi</label>
            <input type="text" id="cam_adedi" value="${kayit.cam_adedi || ''}">
        </div>
        <div class="form-group">
            <label>Üretim Planlama Tarihi</label>
            <input type="date" id="uretim_planlama_tarihi" value="${kayit.uretim_planlama_tarihi || ''}">
        </div>
        <div class="form-group">
            <label>Paketleme Tarihi</label>
            <input type="date" id="paketleme_tarihi" value="${kayit.paketleme_tarihi || ''}">
        </div>
        <div class="form-group">
            <label>Kasetleme Tarihi</label>
            <input type="date" id="kasetleme_tarihi" value="${kayit.kasetleme_tarihi || ''}">
        </div>
        <div class="form-group">
            <label>Sevk Tarihi</label>
            <input type="date" id="sevk_tarihi" value="${kayit.sevk_tarihi || ''}">
        </div>
        <div class="form-group full-width">
            <label>Notlar</label>
            <textarea id="notlar">${kayit.notlar || ''}</textarea>
        </div>
    `;
}

function hideForm() {
    document.getElementById('formSection').classList.add('hidden');
    editingId = null;
}

function handleSearch(e) {
    const search = e.target.value.toLowerCase();
    const filtered = allKayitlar.filter(kayit => 
        Object.values(kayit).some(val => 
            String(val).toLowerCase().includes(search)
        )
    );
    renderKayitlar(filtered);
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    document.getElementById('userBadge').textContent = currentUser.role === 'admin' ? 'Admin' : 'User';
    
    if (currentUser.role === 'admin') {
        document.getElementById('newRecordBtn').classList.remove('hidden');
    } else {
        document.getElementById('newRecordBtn').classList.add('hidden');
    }
}
