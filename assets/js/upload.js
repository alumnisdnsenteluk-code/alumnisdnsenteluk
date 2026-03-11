/**
 * Alumni SDN 1 Senteluk 2017 - Image Upload Handler
 * Handles image uploads for profile photos and agenda images
 */

// ============================================
// Image Upload Manager
// ============================================
const ImageUpload = {
  // Storage keys
  STORAGE_KEYS: {
    PROFILE: 'alumni_profile_images',
    AGENDA: 'agenda_images',
    GALERI: 'galeri_images'
  },

  // Initialize storage if not exists
  init() {
    if (!localStorage.getItem(this.STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.AGENDA)) {
      localStorage.setItem(this.STORAGE_KEYS.AGENDA, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.GALERI)) {
      localStorage.setItem(this.STORAGE_KEYS.GALERI, JSON.stringify({}));
    }
  },

  // Convert file to base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Upload profile image for alumni
  async uploadProfileImage(alumniId, file) {
    try {
      const base64 = await this.fileToBase64(file);
      const images = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PROFILE) || '{}');
      
      // Generate unique filename
      const ext = file.name.split('.').pop();
      const filename = `profile_${alumniId}_${Date.now()}.${ext}`;
      
      images[alumniId] = {
        filename: filename,
        data: base64,
        uploadedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(images));
      
      return {
        success: true,
        path: `localStorage:${filename}`,
        fullPath: base64
      };
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload agenda image
  async uploadAgendaImage(agendaId, file) {
    try {
      const base64 = await this.fileToBase64(file);
      const images = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.AGENDA) || '{}');
      
      const ext = file.name.split('.').pop();
      const filename = `agenda_${agendaId}_${Date.now()}.${ext}`;
      
      images[agendaId] = {
        filename: filename,
        data: base64,
        uploadedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEYS.AGENDA, JSON.stringify(images));
      
      return {
        success: true,
        path: `localStorage:${filename}`,
        fullPath: base64
      };
    } catch (error) {
      console.error('Error uploading agenda image:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload galeri image
  async uploadGaleriImage(galeriId, file) {
    try {
      const base64 = await this.fileToBase64(file);
      const images = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.GALERI) || '{}');
      
      const ext = file.name.split('.').pop();
      const filename = `galeri_${galeriId}_${Date.now()}.${ext}`;
      
      images[galeriId] = {
        filename: filename,
        data: base64,
        uploadedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEYS.GALERI, JSON.stringify(images));
      
      return {
        success: true,
        path: `localStorage:${filename}`,
        fullPath: base64
      };
    } catch (error) {
      console.error('Error uploading galeri image:', error);
      return { success: false, error: error.message };
    }
  },

  // Get profile image
  getProfileImage(alumniId) {
    const images = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PROFILE) || '{}');
    return images[alumniId] || null;
  },

  // Get agenda image
  getAgendaImage(agendaId) {
    const images = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.AGENDA) || '{}');
    return images[agendaId] || null;
  },

  // Get galeri image
  getGaleriImage(galeriId) {
    const images = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.GALERI) || '{}');
    return images[galeriId] || null;
  },

  // Delete image
  deleteImage(storageKey, id) {
    const images = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (images[id]) {
      delete images[id];
      localStorage.setItem(storageKey, JSON.stringify(images));
      return true;
    }
    return false;
  },

  // Get image src - handles both localStorage and file path
  getImageSrc(imageData) {
    if (!imageData) return null;
    
    // If it's already a base64 string
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If it's a localStorage reference
    if (imageData.startsWith('localStorage:')) {
      return imageData; // Will be resolved by getImage functions
    }
    
    // If it's a regular file path
    return imageData;
  }
};

// ============================================
// Image Preview Helper
// ============================================
const ImagePreview = {
  // Setup preview for file input
  setup(inputId, previewId, defaultSrc = 'assets/img/alumni/default.svg') {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.match(/image.*/)) {
          alert('Silakan pilih file gambar!');
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Ukuran file terlalu besar! Maksimal 5MB.');
          return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  },

  // Setup preview with remove button
  setupWithRemove(inputId, previewId, removeBtnId, defaultSrc) {
    this.setup(inputId, previewId, defaultSrc);
    
    const removeBtn = document.getElementById(removeBtnId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        input.value = '';
        preview.src = defaultSrc;
        preview.dataset.removed = 'true';
      });
    }
  }
};

// ============================================
// Initialize on DOM ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  ImageUpload.init();
});

// Export to window
window.ImageUpload = ImageUpload;
window.ImagePreview = ImagePreview;

