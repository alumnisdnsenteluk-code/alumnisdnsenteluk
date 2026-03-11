/**
 * Alumni SDN 1 Senteluk 2017 - Admin Panel JavaScript
 */

// ============================================
// Admin Auth
// ============================================
const AdminAuth = {
  init() {
    this.requireAuth();
    this.setupLogin();
    this.setupLogout();
  },

  requireAuth() {
    const path = window.location.pathname;
    if (path.includes('admin/') && !path.includes('login.html')) {
      if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
      }
    }
  },

  setupLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('login-error');

      if (Auth.login(username, password)) {
        window.location.href = 'dashboard.html';
      } else {
        errorMsg.textContent = 'Username atau password salah!';
        errorMsg.style.display = 'block';
      }
    });
  },

  setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }
  }
};

// ============================================
// Admin Dashboard
// ============================================
const AdminDashboard = {
  stats: {
    alumni: 0,
    agenda: 0,
    galeri: 0
  },

  init() {
    this.loadStats();
    this.loadRecentActivity();
  },

  loadStats() {
    const alumni = DataManager.alumni.getAll();
    const agenda = DataManager.agenda.getAll();
    const galeri = DataManager.galeri.getAll();

    this.stats = {
      alumni: alumni.length,
      agenda: agenda.length,
      galeri: galeri.length
    };

    this.renderStats();
  },

  renderStats() {
    const alumniCount = document.getElementById('stat-alumni-count');
    if (alumniCount) alumniCount.textContent = this.stats.alumni;

    const agendaCount = document.getElementById('stat-agenda-count');
    if (agendaCount) agendaCount.textContent = this.stats.agenda;

    const galeriCount = document.getElementById('stat-galeri-count');
    if (galeriCount) galeriCount.textContent = this.stats.galeri;
  },

  loadRecentActivity() {
    const activityList = document.getElementById('recent-activity');
    if (!activityList) return;

    const activities = [
      { title: 'Dashboard diakses', time: 'Baru saja', icon: 'primary' },
      { title: 'Sistem berjalan normal', time: 'Online', icon: 'success' }
    ];

    activityList.innerHTML = activities.map(activity => `
      <div class="admin-activity-item">
        <div class="admin-activity-icon ${activity.icon}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="admin-activity-content">
          <div class="admin-activity-title">${activity.title}</div>
          <div class="admin-activity-time">${activity.time}</div>
      </div>
    `).join('');
  }
};

// ============================================
// Admin Alumni Management
// ============================================
const AdminAlumni = {
  alumni: [],
  editingId: null,

  init() {
    this.loadAlumni();
    this.setupForm();
    this.setupImageUpload();
  },

  loadAlumni() {
    this.alumni = DataManager.alumni.getAll();
    this.renderTable();
  },

  renderTable() {
    const tbody = document.getElementById('alumni-table-body');
    if (!tbody) return;

    if (this.alumni.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">Tidak ada data alumni</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.alumni.map(alumni => {
      let fotoSrc = alumni.foto || 'assets/img/alumni/default.svg';
      const uploadedImg = ImageUpload.getProfileImage(alumni.id);
      if (uploadedImg) {
        fotoSrc = uploadedImg.data;
      }
      
      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${fotoSrc}" 
                   alt="${alumni.nama}" 
                   style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; cursor: pointer;"
                   onclick="AdminAlumni.showPhotoLightbox(${alumni.id})"
                   onerror="this.src='assets/img/alumni/default.svg'">
              ${Utils.escapeHtml(alumni.nama)}
            </div>
          </td>
          <td>${Utils.escapeHtml(alumni.pekerjaan || '-')}</td>
          <td>${alumni.tahun_lulus || '-'}</td>
          <td>
            <span class="status-badge active">${alumni.status || 'Aktif'}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn edit" onclick="AdminAlumni.edit(${alumni.id})" title="Edit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="table-action-btn delete" onclick="AdminAlumni.delete(${alumni.id})" title="Hapus">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  setupForm() {
    const form = document.getElementById('alumni-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });
  },

  setupImageUpload() {
    const input = document.getElementById('alumni-foto-upload');
    const preview = document.getElementById('alumni-foto-preview');
    
    if (input && preview) {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.match(/image.*/)) {
            alert('Silakan pilih file gambar!');
            return;
          }
          if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar! Maksimal 5MB.');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },

  showPhotoLightbox(id) {
    const alumni = this.alumni.find(a => a.id === id);
    if (!alumni) return;
    
    let fotoSrc = alumni.foto || 'assets/img/alumni/default.svg';
    const uploadedImg = ImageUpload.getProfileImage(id);
    if (uploadedImg) {
      fotoSrc = uploadedImg.data;
    }
    
    Lightbox.show(fotoSrc, alumni.nama, alumni.pekerjaan || '', alumni.tahun_lulus ? `Lulus: ${alumni.tahun_lulus}` : '');
  },

  add() {
    this.editingId = null;
    document.getElementById('modal-title').textContent = 'Tambah Alumni';
    this.resetForm();
    Modal.show('alumni-modal');
  },

  edit(id) {
    const alumni = this.alumni.find(a => a.id === id);
    if (!alumni) return;

    this.editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Alumni';

    document.getElementById('alumni-nama').value = alumni.nama || '';
    document.getElementById('alumni-jenis-kelamin').value = alumni.jenis_kelamin || '';
    document.getElementById('alumni-pekerjaan').value = alumni.pekerjaan || '';
    document.getElementById('alumni-tahun').value = alumni.tahun_lulus || '';
    document.getElementById('alumni-alamat').value = alumni.alamat || '';
    document.getElementById('alumni-email').value = alumni.kontak ? alumni.kontak.email : '';
    document.getElementById('alumni-whatsapp').value = alumni.kontak ? alumni.kontak.whatsapp : '';
    document.getElementById('alumni-facebook').value = alumni.kontak ? alumni.kontak.facebook : '';
    document.getElementById('alumni-instagram').value = alumni.kontak ? alumni.kontak.instagram : '';
    document.getElementById('alumni-tiktok').value = alumni.kontak ? alumni.kontak.tiktok : '';
    document.getElementById('alumni-status').value = alumni.status || 'Aktif';

    const preview = document.getElementById('alumni-foto-preview');
    if (preview) {
      let fotoSrc = alumni.foto || 'assets/img/alumni/default.svg';
      const uploadedImg = ImageUpload.getProfileImage(id);
      if (uploadedImg) {
        fotoSrc = uploadedImg.data;
      }
      preview.src = fotoSrc;
      preview.style.display = 'block';
    }

    Modal.show('alumni-modal');
  },

  async save() {
    const nama = document.getElementById('alumni-nama').value.trim();
    const jenis_kelamin = document.getElementById('alumni-jenis-kelamin').value;
    const pekerjaan = document.getElementById('alumni-pekerjaan').value.trim();
    const tahun_lulus = document.getElementById('alumni-tahun').value.trim();
    const alamat = document.getElementById('alumni-alamat').value.trim();
    const email = document.getElementById('alumni-email').value.trim();
    const whatsapp = document.getElementById('alumni-whatsapp').value.trim();
    const facebook = document.getElementById('alumni-facebook').value.trim();
    const instagram = document.getElementById('alumni-instagram').value.trim();
    const tiktok = document.getElementById('alumni-tiktok').value.trim();
    const status = document.getElementById('alumni-status').value;

    if (!nama) {
      alert('Nama alumni harus diisi!');
      return;
    }

    if (!jenis_kelamin) {
      alert('Jenis kelamin harus diisi!');
      return;
    }

    // Generate ID - use existing ID if editing, otherwise create new one
    const alumniId = this.editingId || Date.now();

    // Handle image upload
    const fotoInput = document.getElementById('alumni-foto-upload');
    let foto = 'assets/img/alumni/default.svg';
    
    // Check if new photo was uploaded
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
      const file = fotoInput.files[0];
      const result = await ImageUpload.uploadProfileImage(alumniId, file);
      if (result.success) {
        foto = result.fullPath;
      }
    } else if (this.editingId) {
      // Keep existing photo
      const alumni = this.alumni.find(a => a.id === this.editingId);
      if (alumni) {
        foto = alumni.foto || 'assets/img/alumni/default.svg';
      }
    } else {
      // Set default based on gender
      if (jenis_kelamin === 'Laki-laki') {
        foto = 'assets/img/alumni/default-male.svg';
      } else if (jenis_kelamin === 'Perempuan') {
        foto = 'assets/img/alumni/default.svg';
      }
    }

    const alumniData = {
      id: alumniId,
      nama,
      jenis_kelamin,
      pekerjaan,
      tahun_lulus,
      alamat,
      foto,
      kontak: {
        email,
        whatsapp,
        facebook,
        instagram,
        tiktok
      },
      status
    };

    if (this.editingId) {
      DataManager.alumni.update(this.editingId, alumniData);
      Utils.showToast('Alumni berhasil diperbarui!');
    } else {
      DataManager.alumni.add(alumniData);
      Utils.showToast('Alumni berhasil ditambahkan!');
    }

    // Auto-sync to cloud
    this.triggerCloudSync();

    Modal.hide('alumni-modal');
    this.loadAlumni();
    this.resetForm();
  },

  delete(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus alumni ini?')) return;

    // Delete uploaded image
    ImageUpload.deleteImage(ImageUpload.STORAGE_KEYS.PROFILE, id);
    
    DataManager.alumni.delete(id);
    
    // Auto-sync to cloud
    this.triggerCloudSync();
    
    Utils.showToast('Alumni berhasil dihapus!');
    this.loadAlumni();
  },

  async triggerCloudSync() {
    if (CloudSync.isActive()) {
      try {
        await CloudSync.autoSync();
        console.log('Alumni data synced to cloud');
      } catch (e) {
        console.error('Cloud sync failed:', e);
      }
    }
  },

  resetForm() {
    document.getElementById('alumni-form').reset();
    const preview = document.getElementById('alumni-foto-preview');
    if (preview) {
      preview.src = 'assets/img/alumni/default.svg';
      preview.style.display = 'block';
    }
    this.editingId = null;
  }
};

// ============================================
// Admin Agenda Management
// ============================================
const AdminAgenda = {
  agenda: [],
  editingId: null,

  init() {
    this.loadAgenda();
    this.setupForm();
  },

  loadAgenda() {
    this.agenda = DataManager.agenda.getAll();
    this.renderTable();
  },

  renderTable() {
    const tbody = document.getElementById('agenda-table-body');
    if (!tbody) return;

    if (this.agenda.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">Tidak ada data agenda</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.agenda.map(agenda => `
      <tr>
        <td>${Utils.escapeHtml(agenda.judul)}</td>
        <td>${Utils.formatDate(agenda.tanggal)}</td>
        <td>${agenda.tahun}</td>
        <td>${agenda.lokasi ? Utils.escapeHtml(agenda.lokasi) : '-'}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn edit" onclick="AdminAgenda.edit(${agenda.id})" title="Edit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn delete" onclick="AdminAgenda.delete(${agenda.id})" title="Hapus">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  setupForm() {
    const form = document.getElementById('agenda-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });
  },

  add() {
    this.editingId = null;
    document.getElementById('agenda-modal-title').textContent = 'Tambah Agenda';
    this.resetForm();
    Modal.show('agenda-modal');
  },

  edit(id) {
    const agenda = this.agenda.find(a => a.id === id);
    if (!agenda) return;

    this.editingId = id;
    document.getElementById('agenda-modal-title').textContent = 'Edit Agenda';

    document.getElementById('agenda-judul').value = agenda.judul || '';
    document.getElementById('agenda-tanggal').value = agenda.tanggal || '';
    document.getElementById('agenda-waktu').value = agenda.waktu || '';
    document.getElementById('agenda-lokasi').value = agenda.lokasi || '';
    document.getElementById('agenda-deskripsi').value = agenda.deskripsi || '';

    Modal.show('agenda-modal');
  },

  save() {
    const judul = document.getElementById('agenda-judul').value.trim();
    const tanggal = document.getElementById('agenda-tanggal').value;
    const waktu = document.getElementById('agenda-waktu').value.trim();
    const lokasi = document.getElementById('agenda-lokasi').value.trim();
    const deskripsi = document.getElementById('agenda-deskripsi').value.trim();

    if (!judul || !tanggal) {
      alert('Judul dan tanggal harus diisi!');
      return;
    }

    const tahun = new Date(tanggal).getFullYear().toString();

    const agendaData = {
      id: this.editingId || Date.now(),
      judul,
      tanggal,
      tahun,
      waktu,
      lokasi,
      deskripsi
    };

    if (this.editingId) {
      DataManager.agenda.update(this.editingId, agendaData);
      Utils.showToast('Agenda berhasil diperbarui!');
    } else {
      DataManager.agenda.add(agendaData);
      Utils.showToast('Agenda berhasil ditambahkan!');
    }

    // Auto-sync to cloud
    this.triggerCloudSync();

    Modal.hide('agenda-modal');
    this.loadAgenda();
    this.resetForm();
  },

  delete(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus agenda ini?')) return;

    DataManager.agenda.delete(id);
    
    // Auto-sync to cloud
    this.triggerCloudSync();
    
    Utils.showToast('Agenda berhasil dihapus!');
    this.loadAgenda();
  },

  async triggerCloudSync() {
    if (CloudSync.isActive()) {
      try {
        await CloudSync.autoSync();
        console.log('Agenda data synced to cloud');
      } catch (e) {
        console.error('Cloud sync failed:', e);
      }
    }
  },

  resetForm() {
    document.getElementById('agenda-form').reset();
    this.editingId = null;
  }
};

// ============================================
// Admin Galeri Management
// ============================================
const AdminGaleri = {
  galeri: [],
  editingId: null,

  init() {
    this.loadGaleri();
    this.loadAgenda();
    this.setupForm();
    this.setupImageUpload();
  },

  loadGaleri() {
    this.galeri = DataManager.galeri.getAll();
    this.renderTable();
  },

  loadAgenda() {
    const agenda = DataManager.agenda.getAll();
    const select = document.getElementById('galeri-agenda');
    
    if (select && agenda.length > 0) {
      let html = '<option value="">Pilih Agenda</option>';
      agenda.forEach(a => {
        html += `<option value="${a.id}">${Utils.escapeHtml(a.judul)}</option>`;
      });
      select.innerHTML = html;
    }
  },

  renderTable() {
    const tbody = document.getElementById('galeri-table-body');
    if (!tbody) return;

    if (this.galeri.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">Tidak ada data galeri</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.galeri.map(galeri => {
      let fotoSrc = galeri.foto || '../assets/img/galeri/default.svg';
      const uploadedImg = ImageUpload.getGaleriImage(galeri.id);
      if (uploadedImg) {
        fotoSrc = uploadedImg.data;
      }
      
      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${fotoSrc}" 
                   alt="${galeri.judul}" 
                   style="width: 60px; height: 40px; border-radius: 4px; object-fit: cover; cursor: pointer;"
                   onclick="AdminGaleri.showPhotoLightbox(${galeri.id})"
                   onerror="this.src='../assets/img/galeri/default.svg'">
              ${Utils.escapeHtml(galeri.judul || 'Tanpa judul')}
            </div>
          </td>
          <td>${Utils.formatDate(galeri.tanggal)}</td>
          <td>${galeri.agenda_id ? 'Ya' : '-'}</td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn edit" onclick="AdminGaleri.edit(${galeri.id})" title="Edit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="table-action-btn delete" onclick="AdminGaleri.delete(${galeri.id})" title="Hapus">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  setupForm() {
    const form = document.getElementById('galeri-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });
  },

  setupImageUpload() {
    const input = document.getElementById('galeri-foto-upload');
    const preview = document.getElementById('galeri-foto-preview');
    
    if (input && preview) {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.match(/image.*/)) {
            alert('Silakan pilih file gambar!');
            return;
          }
          if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar! Maksimal 5MB.');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },

  showPhotoLightbox(id) {
    const galeri = this.galeri.find(g => g.id === id);
    if (!galeri) return;
    
    let fotoSrc = galeri.foto || '../assets/img/galeri/default.svg';
    const uploadedImg = ImageUpload.getGaleriImage(id);
    if (uploadedImg) {
      fotoSrc = uploadedImg.data;
    }
    
    Lightbox.show(fotoSrc, galeri.judul || 'Foto Galeri', galeri.deskripsi || '', Utils.formatDate(galeri.tanggal));
  },

  add() {
    this.editingId = null;
    document.getElementById('galeri-modal-title').textContent = 'Tambah Foto Galeri';
    this.resetForm();
    Modal.show('galeri-modal');
  },

  edit(id) {
    const galeri = this.galeri.find(g => g.id === id);
    if (!galeri) return;

    this.editingId = id;
    document.getElementById('galeri-modal-title').textContent = 'Edit Foto Galeri';

    document.getElementById('galeri-judul').value = galeri.judul || '';
    document.getElementById('galeri-tanggal').value = galeri.tanggal || '';
    document.getElementById('galeri-deskripsi').value = galeri.deskripsi || '';
    document.getElementById('galeri-agenda').value = galeri.agenda_id || '';

    const preview = document.getElementById('galeri-foto-preview');
    if (preview) {
      let fotoSrc = galeri.foto || '../assets/img/galeri/default.svg';
      const uploadedImg = ImageUpload.getGaleriImage(id);
      if (uploadedImg) {
        fotoSrc = uploadedImg.data;
      }
      preview.src = fotoSrc;
      preview.style.display = 'block';
    }

    Modal.show('galeri-modal');
  },

  async save() {
    const judul = document.getElementById('galeri-judul').value.trim();
    const tanggal = document.getElementById('galeri-tanggal').value;
    const deskripsi = document.getElementById('galeri-deskripsi').value.trim();
    const agendaId = document.getElementById('galeri-agenda').value;

    if (!tanggal) {
      alert('Tanggal harus diisi!');
      return;
    }

    const galeriId = this.editingId || Date.now();

    const fotoInput = document.getElementById('galeri-foto-upload');
    let foto = '../assets/img/galeri/default.svg';
    
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
      const file = fotoInput.files[0];
      const result = await ImageUpload.uploadGaleriImage(galeriId, file);
      if (result.success) {
        foto = result.fullPath;
      }
    } else if (this.editingId) {
      const galeri = this.galeri.find(g => g.id === this.editingId);
      if (galeri) {
        foto = galeri.foto || '../assets/img/galeri/default.svg';
      }
    }

    const galeriData = {
      id: galeriId,
      judul: judul || 'Foto ' + new Date().toLocaleDateString('id-ID'),
      tanggal,
      deskripsi,
      agenda_id: agendaId ? parseInt(agendaId) : null,
      foto
    };

    if (this.editingId) {
      DataManager.galeri.update(this.editingId, galeriData);
      Utils.showToast('Foto galeri berhasil diperbarui!');
    } else {
      DataManager.galeri.add(galeriData);
      Utils.showToast('Foto galeri berhasil ditambahkan!');
    }

    // Auto-sync to cloud
    this.triggerCloudSync();

    Modal.hide('galeri-modal');
    this.loadGaleri();
    this.resetForm();
  },

  delete(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return;

    ImageUpload.deleteImage(ImageUpload.STORAGE_KEYS.GALERI, id);
    
    DataManager.galeri.delete(id);
    
    // Auto-sync to cloud
    this.triggerCloudSync();
    
    Utils.showToast('Foto galeri berhasil dihapus!');
    this.loadGaleri();
  },

  async triggerCloudSync() {
    if (CloudSync.isActive()) {
      try {
        await CloudSync.autoSync();
        console.log('Galeri data synced to cloud');
      } catch (e) {
        console.error('Cloud sync failed:', e);
      }
    }
  },

  resetForm() {
    document.getElementById('galeri-form').reset();
    const preview = document.getElementById('galeri-foto-preview');
    if (preview) {
      preview.src = '../assets/img/galeri/default.svg';
      preview.style.display = 'block';
    }
    this.editingId = null;
  }
};

// ============================================
// Admin Settings
// ============================================
const AdminSettings = {
  // Default cloud sync credentials
  DEFAULT_BIN_ID: '69b119d4d746013455b0a8bc',
  DEFAULT_API_KEY: '$2a$10$xbBrXLenPoHz1D/q8sX8N.xMlSJ.gmy5W1SXUfduj1LgkxU.RIDce',

  init() {
    this.loadSettings();
    this.loadCloudSyncConfig();
    this.setupForm();
    this.setupCloudSync();
    // Auto-activate cloud sync with default credentials
    this.autoActivateCloudSync();
  },

  // Auto-activate cloud sync on page load
  autoActivateCloudSync() {
    // Check if cloud sync is already configured
    const existingConfig = CloudSync.loadConfig();
    
    if (!existingConfig || !existingConfig.isActive) {
      // Use default credentials from this application
      if (this.DEFAULT_BIN_ID && this.DEFAULT_API_KEY) {
        console.log('Auto-activating cloud sync with default credentials...');
        CloudSync.setup({
          binId: this.DEFAULT_BIN_ID,
          apiKey: this.DEFAULT_API_KEY
        });
        this.updateCloudSyncStatus(true);
        
        // Try to pull data from cloud on first load
        this.pullCloudDataOnFirstLoad();
      }
    }
  },

  async pullCloudDataOnFirstLoad() {
    try {
      const result = await CloudSync.pullData();
      if (result.success && result.data) {
        CloudSync.mergeCloudData(result.data);
        console.log('Cloud data pulled successfully on first load');
        
        // Reload data in DataManager
        if (DataManager.initData) {
          await DataManager.initData();
        }
        
        // Dispatch event for UI to refresh
        window.dispatchEvent(new CustomEvent('cloudDataLoaded'));
      }
    } catch (e) {
      console.error('Failed to pull cloud data on first load:', e);
    }
  },

  loadSettings() {
    const config = DataManager.config.get();
    
    if (document.getElementById('setting-nama')) {
      document.getElementById('setting-nama').value = config.nama_website || '';
    }
    if (document.getElementById('setting-tagline')) {
      document.getElementById('setting-tagline').value = config.tagline || '';
    }
    if (document.getElementById('setting-email')) {
      document.getElementById('setting-email').value = config.kontak ? config.kontak.email : '';
    }
    if (document.getElementById('setting-whatsapp')) {
      document.getElementById('setting-whatsapp').value = config.kontak ? config.kontak.whatsapp : '';
    }
    if (document.getElementById('setting-instagram')) {
      document.getElementById('setting-instagram').value = config.kontak ? config.kontak.instagram : '';
    }
  },

  loadCloudSyncConfig() {
    // Load saved cloud sync config
    const cloudConfig = CloudSync.loadConfig();
    if (cloudConfig) {
      if (document.getElementById('setting-bin-id')) {
        document.getElementById('setting-bin-id').value = cloudConfig.binId || '';
      }
      if (document.getElementById('setting-api-key')) {
        document.getElementById('setting-api-key').value = cloudConfig.apiKey || '';
      }
      this.updateCloudSyncStatus(cloudConfig.isActive);
    }
  },

  setupForm() {
    const form = document.getElementById('settings-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });
  },

  setupCloudSync() {
    const testBtn = document.getElementById('test-connection-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.testCloudConnection();
      });
    }
  },

  updateCloudSyncStatus(isActive) {
    const statusEl = document.getElementById('cloud-sync-status');
    if (statusEl) {
      if (isActive) {
        statusEl.textContent = 'Aktif';
        statusEl.classList.remove('inactive');
        statusEl.classList.add('active');
      } else {
        statusEl.textContent = 'Tidak Aktif';
        statusEl.classList.remove('active');
        statusEl.classList.add('inactive');
      }
    }
  },

  async testCloudConnection() {
    const binId = document.getElementById('setting-bin-id').value.trim();
    const apiKey = document.getElementById('setting-api-key').value.trim();
    const resultEl = document.getElementById('connection-result');
    const testBtn = document.getElementById('test-connection-btn');

    if (!binId || !apiKey) {
      this.showConnectionResult(resultEl, false, 'Silakan masukkan BIN_ID dan API_KEY terlebih dahulu.');
      return;
    }

    // Show loading state
    testBtn.disabled = true;
    testBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px; animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      Menguji...
    `;
    resultEl.style.display = 'none';

    // Temporarily setup CloudSync with input values
    CloudSync.setup({ binId, apiKey });
    
    // Test connection
    const result = await CloudSync.testConnection();
    
    // Reset button
    testBtn.disabled = false;
    testBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      Test Koneksi
    `;

    if (result.success) {
      this.showConnectionResult(resultEl, true, 'Koneksi berhasil! Cloud sync dapat digunakan.');
      this.updateCloudSyncStatus(true);
    } else {
      this.showConnectionResult(resultEl, false, result.message);
      this.updateCloudSyncStatus(false);
    }
  },

  showConnectionResult(element, isSuccess, message) {
    element.style.display = 'flex';
    element.className = 'connection-result ' + (isSuccess ? 'success' : 'error');
    element.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${isSuccess 
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
          : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
        }
      </svg>
      <span>${message}</span>
    `;
  },

  save() {
    const configData = {
      nama_website: document.getElementById('setting-nama').value.trim(),
      tagline: document.getElementById('setting-tagline').value.trim(),
      kontak: {
        email: document.getElementById('setting-email').value.trim(),
        whatsapp: document.getElementById('setting-whatsapp').value.trim(),
        instagram: document.getElementById('setting-instagram').value.trim()
      }
    };

    DataManager.config.update(configData);

    // Save Cloud Sync configuration - requires password "update"
    const password = document.getElementById('setting-admin-password').value.trim();
    const binId = document.getElementById('setting-bin-id').value.trim();
    const apiKey = document.getElementById('setting-api-key').value.trim();
    
    if (password === 'update') {
      if (binId && apiKey) {
        CloudSync.setup({ binId, apiKey });
        this.updateCloudSyncStatus(true);
        Utils.showToast('Pengaturan & Cloud Sync berhasil disimpan!');
      } else {
        Utils.showToast('Pengaturan berhasil disimpan! (Cloud Sync dilewati - BIN_ID/API_KEY kosong)');
      }
    } else if (binId || apiKey) {
      // If user entered binId or apiKey but wrong password
      Utils.showToast('Pengaturan berhasil disimpan! (Cloud Sync: Gunakan password "update" untuk menyimpan)');
    } else {
      Utils.showToast('Pengaturan berhasil disimpan!');
    }
  }
};

// ============================================
// Initialize Admin
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize data first
  DataManager.initData().then(() => {
    AdminAuth.init();
    
    if (document.getElementById('admin-dashboard')) {
      AdminDashboard.init();
    }
    
    if (document.getElementById('admin-alumni')) {
      AdminAlumni.init();
    }
    
    if (document.getElementById('admin-agenda')) {
      AdminAgenda.init();
    }
    
    if (document.getElementById('admin-galeri')) {
      AdminGaleri.init();
    }
    
    if (document.getElementById('admin-settings')) {
      AdminSettings.init();
    }
    
    initMobileSidebar();
  });
});

function initMobileSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('admin-toggle');
  const closeBtn = document.getElementById('sidebar-close');
  
  if (!sidebar) return;
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('sidebar-open');
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    });
  }
  
  const menuItems = document.querySelectorAll('.admin-menu-item');
  menuItems.forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('sidebar-open');
      }
    });
  });
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  });
}

window.AdminAlumni = AdminAlumni;
window.AdminAgenda = AdminAgenda;
window.AdminGaleri = AdminGaleri;
window.AdminSettings = AdminSettings;
