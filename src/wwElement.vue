<template>
  <div class="image-uploader" :style="cssVariables">
    <template v-if="allImages.length === 0">
      <div
        class="image-uploader__empty-state"
        :class="{ 'image-uploader__empty-state--dragging': isDragging }"
        @click="openFilePicker"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          :accept="acceptString"
          multiple
          class="image-uploader__input"
          @change="handleFileSelect"
        />
        
        <div class="image-uploader__empty-content">
          <svg class="image-uploader__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          
          <h3 class="image-uploader__header">{{ emptyStateHeaderText }}</h3>
          <p class="image-uploader__description">
            {{ emptyStateDescriptionText }}
            <span class="image-uploader__count">(Maximum: {{ allImages.length }}/{{ maxFilesValue }})</span>
          </p>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="image-uploader__grid">
        <div
          v-for="(url, index) in allImages"
          :key="'img-' + index"
          class="image-uploader__thumbnail"
        >
          <img :src="url" :alt="'Image ' + (index + 1)" class="image-uploader__image" />
          <button
            type="button"
            class="image-uploader__delete-btn"
            @click.stop="removeImage(url)"
            aria-label="Remove image"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div
          v-if="canAddMore"
          class="image-uploader__add-more"
          :class="{ 'image-uploader__add-more--dragging': isDragging }"
          @click="openFilePickerMore"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInputMore"
            type="file"
            :accept="acceptString"
            multiple
            class="image-uploader__input"
            @change="handleFileSelect"
          />
          
          <svg class="image-uploader__add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span class="image-uploader__add-text">Attach images</span>
          <span class="image-uploader__add-count">(Maximum: {{ allImages.length }}/{{ maxFilesValue }})</span>
        </div>
      </div>
    </template>

    <div v-if="isUploading" class="image-uploader__progress">
      <div class="image-uploader__progress-spinner"></div>
      <span>Uploading...</span>
    </div>

    <div v-if="errorMessage" class="image-uploader__error">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ errorMessage }}</span>
      <button type="button" @click="clearError" class="image-uploader__error-close">×</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  props: {
    uid: { type: String, required: true },
    content: { type: Object, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },

  emits: ['trigger-event'],

  setup(props, { emit }) {
    const fileInput = ref(null)
    const fileInputMore = ref(null)
    const isDragging = ref(false)
    const isUploading = ref(false)
    const errorMessage = ref('')

    const existingImages = ref([])
    const newImages = ref([])
    const removedUrls = ref([])

    const getSupabaseClient = () => {
      try {
        // Try multiple paths to find Supabase client
        // Path 1: wwLib.wwPlugins.supabase
        const supabasePlugin = wwLib?.wwPlugins?.supabase
        if (supabasePlugin) {
          // The client could be at different paths depending on plugin version
          if (supabasePlugin.client) return supabasePlugin.client
          if (supabasePlugin.instance) return supabasePlugin.instance
          if (supabasePlugin.supabase) return supabasePlugin.supabase
          // If plugin exists but client not found, log available keys for debugging
          console.log('Supabase plugin found, available keys:', Object.keys(supabasePlugin))
        }
        
        // Path 2: Direct wwLib access
        if (wwLib?.supabase) return wwLib.supabase
        
        // Path 3: Window-based access
        if (typeof window !== 'undefined') {
          if (window.supabase) return window.supabase
          if (window.weweb?.plugins?.supabase?.client) return window.weweb.plugins.supabase.client
        }
        
        console.warn('Supabase client not found. Available wwLib.wwPlugins:', wwLib?.wwPlugins ? Object.keys(wwLib.wwPlugins) : 'none')
        return null
      } catch (e) {
        console.warn('Error getting Supabase client:', e)
        return null
      }
    }

    const maxFilesValue = computed(() => props.content?.maxFiles || 5)
    
    const allowedFormats = computed(() => props.content?.allowedFormats || ['jpg', 'jpeg', 'png', 'webp'])
    
    const acceptString = computed(() => allowedFormats.value.map(ext => '.' + ext).join(','))
    
    const allImages = computed(() => [...existingImages.value, ...newImages.value])
    
    const canAddMore = computed(() => allImages.value.length < maxFilesValue.value)

    const emptyStateHeaderText = computed(() => props.content?.emptyStateHeader || 'Attach images')
    
    const emptyStateDescriptionText = computed(() => props.content?.emptyStateDescription || '.png or .jpg 1024×1024')

    const cssVariables = computed(() => ({
      '--thumbnail-size': props.content?.thumbnailSize || '120px',
      '--thumbnail-gap': props.content?.thumbnailGap || '12px',
      '--border-radius': props.content?.borderRadius || '12px',
      '--empty-state-padding': props.content?.emptyStatePadding || '48px',
      '--border-color': props.content?.borderColor || '#d1d5db',
      '--text-color': props.content?.textColor || '#6b7280',
      '--header-color': props.content?.headerColor || '#374151',
      '--delete-btn-color': props.content?.deleteButtonColor || '#374151',
      '--background-color': props.content?.backgroundColor || '#f9fafb',
    }))

    const { setValue: setImageUrlsVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'imageUrls',
      type: 'array',
      defaultValue: [],
    })

    const { setValue: setRemovedUrlsVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'removedUrls',
      type: 'array',
      defaultValue: [],
    })

    const { setValue: setNewUrlsVar } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'newUrls',
      type: 'array',
      defaultValue: [],
    })

    const updateVariables = (emitEvent = true) => {
      const currentUrls = [...existingImages.value, ...newImages.value]
      setImageUrlsVar(currentUrls)
      setRemovedUrlsVar([...removedUrls.value])
      setNewUrlsVar([...newImages.value])

      // Only emit event when triggered by user action, not external data changes
      if (emitEvent) {
        // If maxFiles is 1, return single string (last URL or empty string)
        // Otherwise return array of URLs
        const eventValue = maxFilesValue.value === 1
          ? (currentUrls[currentUrls.length - 1] || '')
          : currentUrls

        emit('trigger-event', {
          name: 'images-changed',
          event: {
            value: eventValue,
          },
        })
      }
    }

    watch(
      () => props.content?.initialImages,
      (newValue) => {
        if (Array.isArray(newValue)) {
          existingImages.value = [...newValue]
        } else {
          existingImages.value = []
        }
        // Don't emit event when initialImages changes externally - prevents infinite loops
        updateVariables(false)
      },
      { immediate: true, deep: true }
    )

    const openFilePicker = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }

    const openFilePickerMore = () => {
      if (fileInputMore.value) {
        fileInputMore.value.click()
      }
    }

    const clearError = () => {
      errorMessage.value = ''
    }

    const validateFile = (file) => {
      const maxSizeMB = props.content?.maxSizeMB || 5
      const maxSizeBytes = maxSizeMB * 1024 * 1024

      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!allowedFormats.value.includes(extension)) {
        return {
          valid: false,
          error: 'Invalid file format. Allowed: ' + allowedFormats.value.join(', '),
        }
      }

      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: 'File too large. Maximum size: ' + maxSizeMB + 'MB',
        }
      }

      if (allImages.value.length >= maxFilesValue.value) {
        return {
          valid: false,
          error: 'Maximum ' + maxFilesValue.value + ' images allowed',
        }
      }

      return { valid: true }
    }

    const uploadFile = async (file) => {
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        // Check if we're in local dev mode (serving from localhost)
        const isLocalDev = typeof window !== 'undefined' && 
          window.location?.hostname === 'localhost'
        
        if (isLocalDev) {
          // Only use blob URLs in local development
          console.log('Using local preview (no Supabase in dev mode)')
          return URL.createObjectURL(file)
        }
        
        throw new Error('Supabase client not available. Please ensure the Supabase plugin is configured and you are logged in.')
      }

      const bucketName = props.content?.bucketName || 'images'
      const storagePath = props.content?.storagePath || 'uploads'
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)  // 6 char random string
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const path = storagePath 
        ? storagePath + '/' + timestamp + '_' + random + '_' + safeName 
        : timestamp + '_' + random + '_' + safeName

      const { error } = await supabase.storage.from(bucketName).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        throw error
      }

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(path)

      return urlData?.publicUrl
    }

    const handleFileSelect = async (event) => {
      const files = Array.from(event.target?.files || [])
      if (files.length === 0) return

      if (event.target) {
        event.target.value = ''
      }

      await processFiles(files)
    }

    const processFiles = async (files) => {
      isUploading.value = true
      errorMessage.value = ''

      const remainingSlots = maxFilesValue.value - allImages.value.length
      const filesToProcess = files.slice(0, remainingSlots)

      for (const file of filesToProcess) {
        const validation = validateFile(file)
        
        if (!validation.valid) {
          errorMessage.value = validation.error
          emit('trigger-event', {
            name: 'validation-error',
            event: { error: validation.error, file: file },
          })
          continue
        }

        try {
          const url = await uploadFile(file)
          newImages.value.push(url)
          updateVariables()

          emit('trigger-event', {
            name: 'upload-success',
            event: { value: url },
          })
        } catch (error) {
          const errorMsg = error?.message || 'Upload failed'
          errorMessage.value = errorMsg
          emit('trigger-event', {
            name: 'upload-error',
            event: { error: errorMsg, file: file },
          })
        }
      }

      isUploading.value = false
    }

    const extractPathFromUrl = (url, bucketName) => {
      try {
        const urlObj = new URL(url)
        // Try multiple URL patterns
        // Pattern 1: /storage/v1/object/public/bucket/path
        let pathParts = urlObj.pathname.split('/storage/v1/object/public/' + bucketName + '/')
        if (pathParts[1]) {
          console.log('Extracted path (pattern 1):', pathParts[1])
          return pathParts[1]
        }
        
        // Pattern 2: /storage/v1/object/sign/bucket/path (signed URLs)
        pathParts = urlObj.pathname.split('/storage/v1/object/sign/' + bucketName + '/')
        if (pathParts[1]) {
          console.log('Extracted path (pattern 2):', pathParts[1].split('?')[0])
          return pathParts[1].split('?')[0]
        }
        
        // Pattern 3: Just bucket/path at the end
        const fullPath = urlObj.pathname
        const bucketIndex = fullPath.indexOf('/' + bucketName + '/')
        if (bucketIndex > -1) {
          const path = fullPath.substring(bucketIndex + bucketName.length + 2)
          console.log('Extracted path (pattern 3):', path)
          return path
        }
        
        console.warn('Could not extract path from URL:', url)
        return null
      } catch (e) {
        console.warn('Error extracting path from URL:', e)
        return null
      }
    }

    const removeImage = async (url) => {
      const newIndex = newImages.value.indexOf(url)

      if (newIndex > -1) {
        // Check if it's a blob URL (editor mode preview)
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
          console.log('Revoked blob URL')
        } else {
          // Try to delete from Supabase storage
          const supabase = getSupabaseClient()
          const bucketName = props.content?.bucketName || 'images'
          
          console.log('Attempting to delete from Supabase:', { url, bucketName, hasSupabase: !!supabase })
          
          if (supabase) {
            const path = extractPathFromUrl(url, bucketName)
            console.log('Extracted path for deletion:', path)
            
            if (path) {
              try {
                const { data, error } = await supabase.storage.from(bucketName).remove([path])
                if (error) {
                  console.error('Supabase delete error:', error)
                  errorMessage.value = 'Failed to delete: ' + error.message
                } else {
                  console.log('Successfully deleted from Supabase:', data)
                }
              } catch (e) {
                console.error('Failed to delete file from storage:', e)
                errorMessage.value = 'Failed to delete: ' + (e.message || 'Unknown error')
              }
            } else {
              console.warn('Could not extract path from URL for deletion')
            }
          } else {
            console.warn('Supabase client not available for deletion')
          }
        }

        newImages.value.splice(newIndex, 1)
        emit('trigger-event', {
          name: 'image-removed',
          event: { url: url, isExisting: false },
        })
      } else {
        const existingIndex = existingImages.value.indexOf(url)
        if (existingIndex > -1) {
          removedUrls.value.push(url)
          existingImages.value.splice(existingIndex, 1)
          emit('trigger-event', {
            name: 'image-removed',
            event: { url: url, isExisting: true },
          })
        }
      }

      updateVariables()
    }

    const handleDragOver = () => {
      isDragging.value = true
    }

    const handleDragLeave = () => {
      isDragging.value = false
    }

    const handleDrop = async (event) => {
      isDragging.value = false
      const files = Array.from(event.dataTransfer?.files || [])
      await processFiles(files)
    }

    return {
      fileInput,
      fileInputMore,
      isDragging,
      isUploading,
      errorMessage,
      maxFilesValue,
      acceptString,
      allImages,
      canAddMore,
      emptyStateHeaderText,
      emptyStateDescriptionText,
      cssVariables,
      openFilePicker,
      openFilePickerMore,
      clearError,
      removeImage,
      handleFileSelect,
      handleDragOver,
      handleDragLeave,
      handleDrop,
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'polaris-weweb-styles';

.image-uploader {
  @include polaris-tokens;
  
  width: 100%;
  font-family: var(--p-font-family-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  &__empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--empty-state-padding, 48px);
    background: var(--background-color, #f9fafb);
    border: 2px dashed var(--border-color, #d1d5db);
    border-radius: var(--border-radius, 12px);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      border-color: #9ca3af;
      background: #f3f4f6;
    }

    &--dragging {
      border-color: #3b82f6;
      background: #eff6ff;
    }
  }

  &__empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    color: var(--text-color, #6b7280);
    margin-bottom: 8px;
  }

  &__header {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--header-color, #374151);
    line-height: 1.4;
  }

  &__description {
    margin: 0;
    font-size: 14px;
    color: var(--text-color, #6b7280);
    line-height: 1.4;
  }

  &__count {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: var(--text-color, #6b7280);
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--thumbnail-gap, 12px);
  }

  &__thumbnail {
    position: relative;
    width: var(--thumbnail-size, 120px);
    height: var(--thumbnail-size, 120px);
    border-radius: var(--border-radius, 12px);
    overflow: hidden;
    background: #f9fafb;
    flex-shrink: 0;

    &:hover .image-uploader__delete-btn {
      opacity: 1;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__delete-btn {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--delete-btn-color, #374151);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 1;

    @media (hover: hover) {
      opacity: 0;
    }

    &:hover {
      background: #dc2626;
      transform: scale(1.1);
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &__add-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: var(--thumbnail-size, 120px);
    height: var(--thumbnail-size, 120px);
    background: var(--background-color, #f9fafb);
    border: 2px dashed var(--border-color, #d1d5db);
    border-radius: var(--border-radius, 12px);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    flex-shrink: 0;
    padding: 8px;
    text-align: center;

    &:hover {
      border-color: #9ca3af;
      background: #f3f4f6;
    }

    &--dragging {
      border-color: #3b82f6;
      background: #eff6ff;
    }
  }

  &__add-icon {
    width: 28px;
    height: 28px;
    color: var(--text-color, #6b7280);
    margin-bottom: 4px;
  }

  &__add-text {
    font-size: 11px;
    font-weight: 500;
    color: var(--header-color, #374151);
    line-height: 1.2;
  }

  &__add-count {
    font-size: 10px;
    color: var(--text-color, #6b7280);
    line-height: 1.2;
    margin-top: 2px;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 12px 16px;
    background: #eff6ff;
    border-radius: 8px;
    font-size: 14px;
    color: #1e40af;
  }

  &__progress-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #93c5fd;
    border-top-color: #1e40af;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 12px 16px;
    background: #fef2f2;
    border-radius: 8px;
    font-size: 14px;
    color: #991b1b;

    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    span {
      flex: 1;
    }
  }

  &__error-close {
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    color: #991b1b;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
