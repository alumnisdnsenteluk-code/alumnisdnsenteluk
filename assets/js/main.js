/**
 * Alumni SDN 1 Senteluk 2017 - Main JavaScript
 * Contains common functions: Dark Mode, Navigation, Utils
 */

// ============================================
// Dark Mode
// ============================================
const DarkMode = {
  init() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (prefersDark) {
      this.setTheme('dark');
    }
    
    this.setupToggle();
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      const icon = toggle.querySelector('svg');
      if (icon) {
        icon.innerHTML = theme === 'dark' 
          ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
          : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      }
    }
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },

  setupToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  }
};

// ============================================
// Navigation
// ============================================
const Navigation = {
  init() {
    this.setupNavbar();
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setActiveLink();
  },

  setupNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });
  },

  setupMobileMenu() {
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
      });

      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          menu.classList.remove('active');
        });
      });
    }
  },

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  },

  setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
};

// ============================================
// Utilities
// ============================================
const Utils = {
  formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  },

  formatDateShort(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  showLoading() {
    const spinner = document.createElement('div');
    spinner.className = 'loading';
    spinner.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(spinner);
    return spinner;
  },

  hideLoading() {
    const spinner = document.querySelector('.loading');
    if (spinner) spinner.remove();
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ============================================
// Modal
// ============================================
const Modal = {
  show(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  },

  hide(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  init() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
          document.body.style.overflow = '';
        }
      });
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) {
          modal.classList.remove('show');
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
          modal.classList.remove('show');
          document.body.style.overflow = '';
        });
      }
    });
  }
};

// ============================================
// Data Manager
// ============================================
const DataManager = {
  getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  initData() {
    return new Promise((resolve) => {
      if (!localStorage.getItem('alumni_data')) {
        this.loadFromJSON('data/alumni.json', 'alumni_data');
      }
      if (!localStorage.getItem('agenda_data')) {
        this.loadFromJSON('data/agenda.json', 'agenda_data');
      }
      if (!localStorage.getItem('galeri_data')) {
        this.loadFromJSON('data/galeri.json', 'galeri_data');
      }
      if (!localStorage.getItem('config_data')) {
        this.loadFromJSON('data/config.json', 'config_data');
      }
      setTimeout(resolve, 100);
    });
  },

  async loadFromJSON(url, key) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      this.setData(key, data);
    } catch (error) {
      console.error(`Error loading ${url}:`, error);
    }
  },

  alumni: {
    getAll() {
      return DataManager.getData('alumni_data') || [];
    },
    
    getById(id) {
      const alumni = this.getAll();
      return alumni.find(a => a.id === id || a.id === parseInt(id));
    },
    
    add(alumni) {
      const data = this.getAll();
      if (!alumni.id) {
        alumni.id = Date.now();
      }
      data.push(alumni);
      DataManager.setData('alumni_data', data);
      return alumni;
    },
    
    update(id, updates) {
      const data = this.getAll();
      const index = data.findIndex(a => a.id === id || a.id === parseInt(id));
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        DataManager.setData('alumni_data', data);
        return data[index];
      }
      return null;
    },
    
    delete(id) {
      const data = this.getAll();
      const filtered = data.filter(a => a.id !== id && a.id !== parseInt(id));
      DataManager.setData('alumni_data', filtered);
      return true;
    }
  },

  agenda: {
    getAll() {
      return DataManager.getData('agenda_data') || [];
    },
    
    getById(id) {
      const agenda = this.getAll();
      return agenda.find(a => a.id === id || a.id === parseInt(id));
    },
    
    add(agenda) {
      const data = this.getAll();
      if (!agenda.id) {
        agenda.id = Date.now();
      }
      data.push(agenda);
      DataManager.setData('agenda_data', data);
      return agenda;
    },
    
    update(id, updates) {
      const data = this.getAll();
      const index = data.findIndex(a => a.id === id || a.id === parseInt(id));
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        DataManager.setData('agenda_data', data);
        return data[index];
      }
      return null;
    },
    
    delete(id) {
      const data = this.getAll();
      const filtered = data.filter(a => a.id !== id && a.id !== parseInt(id));
      DataManager.setData('agenda_data', filtered);
      return true;
    }
  },

  galeri: {
    getAll() {
      return DataManager.getData('galeri_data') || [];
    },
    
    getById(id) {
      const galeri = this.getAll();
      return galeri.find(g => g.id === id || g.id === parseInt(id));
    },
    
    add(galeri) {
      const data = this.getAll();
      if (!galeri.id) {
        galeri.id = Date.now();
      }
      data.push(galeri);
      DataManager.setData('galeri_data', data);
      return galeri;
    },
    
    update(id, updates) {
      const data = this.getAll();
      const index = data.findIndex(g => g.id === id || g.id === parseInt(id));
      if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        DataManager.setData('galeri_data', data);
        return data[index];
      }
      return null;
    },
    
    delete(id) {
      const data = this.getAll();
      const filtered = data.filter(g => g.id !== id && g.id !== parseInt(id));
      DataManager.setData('galeri_data', filtered);
      return true;
    }
  },

  config: {
    get() {
      return DataManager.getData('config_data') || {};
    },
    
    update(updates) {
      const data = this.get();
      const newData = { ...data, ...updates };
      DataManager.setData('config_data', newData);
      return newData;
    }
  }
};

// ============================================
// Auth Manager
// ============================================
const Auth = {
  USERNAME: 'admin',
  PASSWORD: 'senteluk2017',

  isLoggedIn() {
    return localStorage.getItem('admin_logged_in') === 'true';
  },

  login(username, password) {
    if (username === this.USERNAME && password === this.PASSWORD) {
      localStorage.setItem('admin_logged_in', 'true');
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem('admin_logged_in');
    window.location.href = 'login.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }
};

// ============================================
// Footer Manager
// ============================================
const FooterManager = {
  init() {
    this.loadFooterContent();
  },

  loadFooterContent() {
    const config = DataManager.config.get();
    
    const emailEl = document.getElementById('footer-email');
    const whatsappEl = document.getElementById('footer-whatsapp');
    const instagramEl = document.getElementById('footer-instagram');
    
    if (emailEl && config.kontak && config.kontak.email) {
      emailEl.textContent = config.kontak.email;
    }
    
    if (whatsappEl && config.kontak && config.kontak.whatsapp) {
      whatsappEl.textContent = config.kontak.whatsapp;
    }
    
    if (instagramEl && config.kontak && config.kontak.instagram) {
      instagramEl.textContent = config.kontak.instagram;
    }
  }
};

// ============================================
// Lightbox
// ============================================
const Lightbox = {
  init() {}
};

const LightboxImage = {
  currentSrc: '',
  currentTitle: '',
  
  init() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('show')) {
        this.close();
      }
    });

    const downloadBtn = document.getElementById('lightbox-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.download());
    }
  },

  show(imageSrc, title = '', description = '') {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    this.currentSrc = imageSrc;
    this.currentTitle = title || 'foto';

    const image = lightbox.querySelector('.lightbox-image');
    const titleEl = lightbox.querySelector('.lightbox-title');
    const descEl = lightbox.querySelector('.lightbox-description');

    if (image) {
      image.src = imageSrc;
      image.alt = title || 'Image';
    }
    if (titleEl) titleEl.textContent = title || '';
    if (descEl) descEl.textContent = description || '';

    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  download() {
    if (!this.currentSrc) return;
    
    const link = document.createElement('a');
    link.href = this.currentSrc;
    link.download = this.currentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'foto';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

function showImageLightbox(src, title = '', description = '') {
  LightboxImage.show(src, title, description);
}

// ============================================
// Cloud Sync Auto-Initialize
// ============================================
const CloudSyncAutoInit = {
  // Default cloud sync credentials
  DEFAULT_BIN_ID: '69b119d4d746013455b0a8bc',
  DEFAULT_API_KEY: '$2a$10$xbBrXLenPoHz1D/q8sX8N.xMlSJ.gmy5W1SXUfduj1LgkxU.RIDce',

  init() {
    // Wait for DataManager and CloudSync to be ready
    this.activateCloudSync();
  },

  async activateCloudSync() {
    // Check if CloudSync is available
    if (typeof CloudSync === 'undefined') {
      console.log('CloudSync not loaded yet, retrying...');
      setTimeout(() => this.activateCloudSync(), 500);
      return;
    }

    // Wait for DataManager to be ready
    await DataManager.initData();

    // Check if cloud sync is already configured and active
    const existingConfig = CloudSync.loadConfig();
    
    if (!existingConfig || !existingConfig.isActive) {
      // Use default credentials from this application
      if (this.DEFAULT_BIN_ID && this.DEFAULT_API_KEY) {
        console.log('Auto-activating cloud sync with default credentials...');
        CloudSync.setup({
          binId: this.DEFAULT_BIN_ID,
          apiKey: this.DEFAULT_API_KEY
        });
        
        // Try to pull data from cloud
        await this.pullCloudData();
      }
    } else {
      // Already configured, try to sync
      console.log('Cloud sync already configured, checking for updates...');
      await this.pullCloudData();
    }
  },

  async pullCloudData() {
    if (!CloudSync.isActive()) return;

    try {
      const result = await CloudSync.pullData();
      if (result.success && result.data) {
        CloudSync.mergeCloudData(result.data);
        console.log('Cloud data pulled successfully');
        
        // Reload data in DataManager
        await DataManager.initData();
        
        // Dispatch event for UI to refresh
        window.dispatchEvent(new CustomEvent('cloudDataLoaded'));
      }
    } catch (e) {
      console.error('Failed to pull cloud data:', e);
    }
  }
};

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init();
  Navigation.init();
  Modal.init();
  DataManager.initData();
  Lightbox.init();
  LightboxImage.init();
  FooterManager.init();
  
  // Initialize cloud sync
  CloudSyncAutoInit.init();
});

window.DarkMode = DarkMode;
window.Navigation = Navigation;
window.Utils = Utils;
window.Modal = Modal;
window.DataManager = DataManager;
window.Auth = Auth;
window.Lightbox = Lightbox;
window.LightboxImage = LightboxImage;
window.FooterManager = FooterManager;
window.showImageLightbox = showImageLightbox;
