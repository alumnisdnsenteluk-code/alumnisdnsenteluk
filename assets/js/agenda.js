/**
 * Alumni SDN 1 Senteluk 2017 - Agenda Page JavaScript
 */

// ============================================
// Agenda Page
// ============================================
const AgendaPage = {
  agenda: [],
  filteredAgenda: [],
  selectedYear: 'all',
  searchTerm: '',

  init() {
    // Initialize data first, then load agenda
    DataManager.initData().then(() => {
      this.loadAgenda();
      this.setupFilters();
    });
  },

  loadAgenda() {
    try {
      let agenda = DataManager.agenda.getAll();
      
      // If empty, try to load from JSON
      if (!agenda || agenda.length === 0) {
        fetch('data/agenda.json')
          .then(response => response.json())
          .then(data => {
            DataManager.setData('agenda_data', data);
            this.agenda = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            this.filteredAgenda = [...this.agenda];
            this.renderAgenda();
            this.populateYearFilter();
            this.updateStats();
          })
          .catch(error => {
            console.error('Error loading agenda:', error);
            this.showError();
          });
        return;
      }
      
      this.agenda = agenda.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      this.filteredAgenda = [...this.agenda];
      this.renderAgenda();
      this.populateYearFilter();
      this.updateStats();
    } catch (error) {
      console.error('Error loading agenda:', error);
      this.showError();
    }
  },

  renderAgenda() {
    const container = document.getElementById('agenda-grid');
    if (!container) return;

    if (this.filteredAgenda.length === 0) {
      container.innerHTML = this.getEmptyState();
      return;
    }

    container.innerHTML = this.filteredAgenda.map(agenda => this.createAgendaCard(agenda)).join('');
  },

  createAgendaCard(agenda) {
    const date = new Date(agenda.tanggal);
    const formattedDate = Utils.formatDate(agenda.tanggal);
    const isUpcoming = date >= new Date();

    return `
      <div class="agenda-card fade-in">
        <div class="agenda-card-header">
          <div class="agenda-card-date">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formattedDate}
          </div>
          <h3 class="agenda-card-title">${Utils.escapeHtml(agenda.judul)}</h3>
          <span class="agenda-card-badge">${agenda.tahun}</span>
        </div>
        <div class="agenda-card-body">
          <p class="agenda-card-description">${Utils.escapeHtml(agenda.deskripsi)}</p>
          <div class="agenda-card-info">
            <div class="agenda-card-info-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${agenda.waktu || '-'}
            </div>
            <div class="agenda-card-info-item">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${Utils.escapeHtml(agenda.lokasi || '-')}
            </div>
        </div>
        <div class="agenda-card-footer">
          ${isUpcoming ? '<span class="badge badge-success">Akan Datang</span>' : '<span class="badge badge-primary">Selesai</span>'}
          <div class="agenda-card-actions">
            <button class="btn btn-outline btn-sm" onclick="AgendaPage.showDetail(${agenda.id})">
              Detail
            </button>
          </div>
      </div>
    `;
  },

  setupFilters() {
    const searchInput = document.getElementById('agenda-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.filterAgenda();
      }, 300));
    }

    const yearFilter = document.getElementById('agenda-year-filter');
    if (yearFilter) {
      yearFilter.addEventListener('change', (e) => {
        this.selectedYear = e.target.value;
        this.filterAgenda();
      });
    }
  },

  populateYearFilter() {
    const select = document.getElementById('agenda-year-filter');
    if (!select) return;

    const years = [...new Set(this.agenda.map(a => a.tahun))].sort().reverse();
    
    let html = '<option value="all">Semua Tahun</option>';
    
    years.forEach(year => {
      html += `<option value="${year}">${year}</option>`;
    });

    select.innerHTML = html;
  },

  filterAgenda() {
    let filtered = [...this.agenda];

    if (this.selectedYear !== 'all') {
      filtered = filtered.filter(a => a.tahun === this.selectedYear);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(a => 
        a.judul.toLowerCase().includes(this.searchTerm) ||
        (a.deskripsi && a.deskripsi.toLowerCase().includes(this.searchTerm)) ||
        (a.lokasi && a.lokasi.toLowerCase().includes(this.searchTerm))
      );
    }

    this.filteredAgenda = filtered;
    this.renderAgenda();
  },

  updateStats() {
    const countElement = document.getElementById('agenda-count');
    if (countElement) {
      countElement.textContent = this.agenda.length;
    }
  },

  showDetail(id) {
    const agenda = this.agenda.find(a => a.id === id);
    if (!agenda) return;

    const modal = document.getElementById('agenda-detail-modal');
    if (!modal) return;

    const content = modal.querySelector('.modal-body');
    const date = new Date(agenda.tanggal);
    const formattedDate = Utils.formatDate(agenda.tanggal);
    const isUpcoming = date >= new Date();

    content.innerHTML = `
      <div class="agenda-detail">
        <div class="text-center mb-4">
          <span class="badge ${isUpcoming ? 'badge-success' : 'badge-primary'} mb-2">${agenda.tahun}</span>
          <h2>${Utils.escapeHtml(agenda.judul)}</h2>
          <p class="text-secondary">${formattedDate}</p>
        </div>
        <div class="grid grid-2 gap-md mb-4">
          <div>
            <h4>Waktu</h4>
            <p>${agenda.waktu || '-'}</p>
          </div>
          <div>
            <h4>Lokasi</h4>
            <p>${Utils.escapeHtml(agenda.lokasi || '-')}</p>
          </div>
        <div>
          <h4>Deskripsi</h4>
          <p>${Utils.escapeHtml(agenda.deskripsi || '-')}</p>
        </div>
    `;

    Modal.show('agenda-detail-modal');
  },

  getEmptyState() {
    return `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <h3>Tidak ada agenda ditemukan</h3>
        <p>Coba pilih tahun lain atau gunakan kata kunci lain.</p>
      </div>
    `;
  },

  showError() {
    const container = document.getElementById('agenda-grid');
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>Gagal memuat data agenda</h3>
          <p>Silakan refresh halaman atau coba lagi nanti.</p>
        </div>
      `;
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AgendaPage.init();
});

window.AgendaPage = AgendaPage;
