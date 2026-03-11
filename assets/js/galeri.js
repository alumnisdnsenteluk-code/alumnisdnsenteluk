
/**
 * Alumni SDN 1 Senteluk 2017 - Galeri Page JavaScript
 */

// ============================================
// Galeri Page
// ============================================
const GaleriPage = {
  galeri: [],
  filteredGaleri: [],
  selectedAlbum: 'all',
  searchTerm: '',
  currentImage: { src: '', title: '' },

  init() {
    // Initialize data first, then load galeri
    DataManager.initData().then(() => {
      this.loadGaleri();
      this.setupFilters();
      this.setupLightbox();
    });
  },

  loadGaleri() {
    try {
      let galeri = DataManager.galeri.getAll();
      
      // If empty, try to load from JSON
      if (!galeri || galeri.length === 0) {
        fetch('data/galeri.json')
          .then(response => response.json())
          .then(data => {
            DataManager.setData('galeri_data', data);
            this.galeri = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            this.filteredGaleri = [...this.galeri];
            this.renderGaleri();
            this.populateAlbumFilter();
            this.updateStats();
          })
          .catch(error => {
            console.error('Error loading galeri:', error);
            this.showError();
          });
        return;
      }
      
      this.galeri = galeri.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      this.filteredGaleri = [...this.galeri];
      this.renderGaleri();
      this.populateAlbumFilter();
      this.updateStats();
    } catch (error) {
      console.error('Error loading galeri:', error);
      this.showError();
    }
  },

  renderGaleri() {
    const container = document.getElementById('galeri-grid');
    if (!container) return;

    if (this.filteredGaleri.length === 0) {
      container.innerHTML = this.getEmptyState();
      return;
    }

    container.innerHTML = this.filteredGaleri.map(galeri => this.createGaleriItem(galeri)).join('');
  },

  createGaleriItem(galeri) {
    const defaultImage = 'assets/img/galeri/default.svg';
    
    let imageSrc = defaultImage;
    const uploadedImg = ImageUpload ? ImageUpload.getGaleriImage(galeri.id) : null;
    if (uploadedImg) {
      imageSrc = uploadedImg.data;
    } else if (galeri.foto) {
      imageSrc = galeri.foto;
    }

    return `
      <div class="galeri-item fade-in" onclick="GaleriPage.showLightbox(${galeri.id})">
        <img src="${imageSrc}" alt="${Utils.escapeHtml(galeri.judul)}" 
             onerror="this.src='${defaultImage}'">
        <div class="galeri-overlay">
          <div class="galeri-overlay-text">
            <h4 class="galeri-overlay-title">${Utils.escapeHtml(galeri.judul)}</h4>
            <p class="galeri-overlay-description">${Utils.formatDateShort(galeri.tanggal)}</p>
          </div>
        </div>
      </div>
    `;
  },

  setupFilters() {
    const searchInput = document.getElementById('galeri-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterGaleri();
      }, 300));
    }

    const albumFilter = document.getElementById('galeri-album-filter');
    if (albumFilter) {
      albumFilter.addEventListener('change', (e) => {
        this.selectedAlbum = e.target.value;
        this.filterGaleri();
      });
    }
  },

  setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const downloadBtn = document.getElementById('lightbox-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadImage();
      });
    }
  },

  populateAlbumFilter() {
    const select = document.getElementById('galeri-album-filter');
    if (!select) return;

    const albums = [...new Set(this.galeri.map(g => g.agenda_id))];
    const albumNames = {};
    
    const agenda = DataManager.agenda.getAll();
    agenda.forEach(a => {
      albumNames[a.id] = a.judul;
    });
    
    let html = '<option value="all">Semua Album</option>';
    
    albums.forEach(albumId => {
      if (albumId) {
        const name = albumNames[albumId] || 'Album ' + albumId;
        html += `<option value="${albumId}">${Utils.escapeHtml(name)}</option>`;
      }
    });

    select.innerHTML = html;
  },

  filterGaleri() {
    let filtered = [...this.galeri];

    if (this.selectedAlbum !== 'all') {
      filtered = filtered.filter(g => g.agenda_id == this.selectedAlbum);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(g => 
        g.judul.toLowerCase().includes(this.searchTerm) ||
        g.deskripsi?.toLowerCase().includes(this.searchTerm)
      );
    }

    this.filteredGaleri = filtered;
    this.renderGaleri();
  },

  updateStats() {
    const countElement = document.getElementById('galeri-count');
    if (countElement) {
      countElement.textContent = this.galeri.length;
    }
  },

  showLightbox(id) {
    const galeri = this.galeri.find(g => g.id === id);
    if (!galeri) return;

    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const defaultImage = 'assets/img/galeri/default.svg';
    
    let imageSrc = defaultImage;
    const uploadedImg = ImageUpload ? ImageUpload.getGaleriImage(galeri.id) : null;
    if (uploadedImg) {
      imageSrc = uploadedImg.data;
    } else if (galeri.foto) {
      imageSrc = galeri.foto;
    }

    this.currentImage = {
      src: imageSrc,
      title: galeri.judul || 'foto_galeri'
    };

    const image = lightbox.querySelector('.lightbox-image');
    const title = lightbox.querySelector('.lightbox-title');
    const description = lightbox.querySelector('.lightbox-description');

    image.src = imageSrc;
    image.alt = galeri.judul;
    title.textContent = galeri.judul;
    description.textContent = galeri.deskripsi || '';

    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  downloadImage() {
    if (!this.currentImage.src) return;
    
    const link = document.createElement('a');
    link.href = this.currentImage.src;
    link.download = this.currentImage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'foto';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  getEmptyState() {
    return `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <h3>Tidak ada foto ditemukan</h3>
        <p>Coba pilih album lain atau gunakan kata kunci lain.</p>
      </div>
    `;
  },

  showError() {
    const container = document.getElementById('galeri-grid');
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>Gagal memuat data galeri</h3>
          <p>Silakan refresh halaman atau coba lagi nanti.</p>
        </div>
      `;
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  GaleriPage.init();

  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        GaleriPage.closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      GaleriPage.closeLightbox();
    }
  });
});

window.GaleriPage = GaleriPage;

