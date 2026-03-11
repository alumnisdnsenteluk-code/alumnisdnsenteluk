/**
 * Cloud Sync Module - JSONBin.io Integration
 */

const CloudSync = {
  config: {
    binId: null,
    apiKey: null,
    isActive: false,
    autoSync: true
  },

  STORAGE_KEY: 'cloudsync_config',

  /**
   * Initialize CloudSync with configuration
   * @param {Object} config - { binId, apiKey, autoSync }
   */
  setup(config) {
    if (config && config.binId && config.apiKey) {
      this.config.binId = config.binId;
      this.config.apiKey = config.apiKey;
      this.config.autoSync = config.autoSync !== false;
      this.config.isActive = true;
      this.saveConfig();
      console.log('CloudSync initialized with BIN_ID:', config.binId);
      return true;
    }
    this.config.isActive = false;
    return false;
  },

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
  },

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.config = JSON.parse(stored);
        return this.config;
      } catch (e) {
        console.error('Error parsing CloudSync config:', e);
      }
    }
    return null;
  },

  /**
   * Get current configuration
   */
  getConfig() {
    return this.config;
  },

  /**
   * Check if cloud sync is active
   */
  isActive() {
    return this.config.isActive && this.config.binId && this.config.apiKey;
  },

  /**
   * Test connection to JSONBin.io
   */
  async testConnection() {
    if (!this.config.binId || !this.config.apiKey) {
      return { success: false, message: 'Konfigurasi belum lengkap. Silakan isi BIN_ID dan API_KEY terlebih dahulu.' };
    }

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.config.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: 'Koneksi berhasil!',
          data: data
        };
      } else if (response.status === 404) {
        return { success: false, message: 'BIN_ID tidak ditemukan. Pastikan BIN_ID benar.' };
      } else if (response.status === 401) {
        return { success: false, message: 'API_KEY tidak valid. Pastikan API_KEY benar.' };
      } else {
        return { success: false, message: `Error: ${response.status} - ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, message: `Gagal terhubung ke server: ${error.message}` };
    }
  },

  /**
   * Get all data from JSONBin
   */
  async getData() {
    if (!this.isActive()) {
      return { success: false, message: 'Cloud sync tidak aktif. Silakan konfigurasi terlebih dahulu.' };
    }

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.config.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.record };
      } else {
        return { success: false, message: `Error: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Save all data to JSONBin
   */
  async saveAllData(data) {
    if (!this.isActive()) {
      return { success: false, message: 'Cloud sync tidak aktif.' };
    }

    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.config.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.config.apiKey
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return { success: true, message: 'Data berhasil disimpan ke cloud!' };
      } else {
        return { success: false, message: `Error: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  /**
   * Sync all local data to cloud (manual trigger)
   */
  async syncToCloud() {
    const data = {
      alumni: DataManager.alumni.getAll(),
      agenda: DataManager.agenda.getAll(),
      galeri: DataManager.galeri.getAll(),
      config: DataManager.config.get(),
      lastSync: new Date().toISOString()
    };
    
    return await this.saveAllData(data);
  },

  /**
   * Sync from cloud to local (manual trigger)
   */
  async syncFromCloud() {
    const result = await this.getData();
    
    if (result.success && result.data) {
      const cloudData = result.data;
      
      // Restore data to localStorage
      if (cloudData.alumni) {
        DataManager.setData('alumni_data', cloudData.alumni);
      }
      if (cloudData.agenda) {
        DataManager.setData('agenda_data', cloudData.agenda);
      }
      if (cloudData.galeri) {
        DataManager.setData('galeri_data', cloudData.galeri);
      }
      if (cloudData.config) {
        DataManager.setData('config_data', cloudData.config);
      }
      
      return { success: true, message: 'Data berhasil disinkronisasi dari cloud!' };
    }
    
    return result;
  },

  /**
   * Auto sync - push data to cloud when local data changes
   */
  async autoSync() {
    if (!this.isActive() || !this.config.autoSync) {
      return { success: false, message: 'Auto sync tidak aktif' };
    }
    
    return await this.syncToCloud();
  },

  /**
   * Clear configuration
   */
  clearConfig() {
    this.config = {
      binId: null,
      apiKey: null,
      isActive: false,
      autoSync: true
    };
    localStorage.removeItem(this.STORAGE_KEY);
  },

  /**
   * Pull data from cloud (alias for getData)
   */
  async pullData() {
    return await this.getData();
  },

  /**
   * Merge cloud data with local data
   */
  mergeCloudData(cloudData) {
    if (!cloudData) return;
    
    // Save cloud data to localStorage
    if (cloudData.alumni) {
      localStorage.setItem('alumni_data', JSON.stringify(cloudData.alumni));
    }
    if (cloudData.agenda) {
      localStorage.setItem('agenda_data', JSON.stringify(cloudData.agenda));
    }
    if (cloudData.galeri) {
      localStorage.setItem('galeri_data', JSON.stringify(cloudData.galeri));
    }
    if (cloudData.config) {
      localStorage.setItem('config_data', JSON.stringify(cloudData.config));
    }
    
    console.log('Cloud data merged to localStorage');
  }
};

// Auto-load config on script load
CloudSync.loadConfig();

// Auto-sync on page load - pull data from cloud if sync is active
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for DataManager to be ready
  if (typeof DataManager !== 'undefined') {
    await DataManager.initData();
    
    // If cloud sync is configured, try to pull data from cloud
    if (CloudSync.isActive()) {
      console.log('Cloud sync active, pulling data from cloud...');
      try {
        const result = await CloudSync.pullData();
        if (result.success && result.data) {
          // Merge cloud data with local data
          CloudSync.mergeCloudData(result.data);
          console.log('Data pulled from cloud successfully');
          
          // Reload data in DataManager
          if (DataManager.initData) {
            await DataManager.initData();
          }
          
          // Dispatch event for UI to refresh
          window.dispatchEvent(new CustomEvent('cloudDataLoaded'));
        }
      } catch (e) {
        console.error('Failed to pull data from cloud:', e);
      }
    }
  }
});

