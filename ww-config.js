export default {
  editor: {
    label: {
      en: 'Image Uploader',
    },
    icon: 'image',
  },
  properties: {
    // Initial images for edit mode
    initialImages: {
      label: { en: 'Initial Images' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      options: {
        expandable: true,
        getItemLabel(item, index) {
          return item?.url || item || `Image ${index + 1}`
        },
        item: {
          type: 'Text',
          defaultValue: '',
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of image URLs for pre-existing images',
      },
      propertyHelp: {
        tooltip: 'Pass existing image URLs when editing a record',
      },
      /* wwEditor:end */
    },

    // Upload settings
    maxFiles: {
      label: { en: 'Maximum Files' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 5,
      options: {
        min: 1,
        max: 20,
        step: 1,
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Maximum number of images allowed (1-20)',
      },
      /* wwEditor:end */
    },

    allowedFormats: {
      label: { en: 'Allowed Formats' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: ['jpg', 'jpeg', 'png', 'webp'],
      options: {
        expandable: true,
        getItemLabel(item) {
          return item || 'Format'
        },
        item: {
          type: 'Text',
          defaultValue: 'jpg',
        },
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Array of allowed file extensions (e.g., jpg, png, webp)',
      },
      /* wwEditor:end */
    },

    maxSizeMB: {
      label: { en: 'Max File Size (MB)' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 5,
      options: {
        min: 0.1,
        max: 50,
        step: 0.1,
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Maximum file size in megabytes',
      },
      /* wwEditor:end */
    },

    // Supabase settings
    bucketName: {
      label: { en: 'Bucket Name' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'images',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Supabase Storage bucket name',
      },
      propertyHelp: {
        tooltip: 'The Supabase Storage bucket to upload files to',
      },
      /* wwEditor:end */
    },

    storagePath: {
      label: { en: 'Storage Path' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'uploads',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Path prefix for uploaded files',
      },
      propertyHelp: {
        tooltip: 'Optional folder path within the bucket (e.g., "uploads/products")',
      },
      /* wwEditor:end */
    },

    // Empty state text
    emptyStateHeader: {
      label: { en: 'Empty State Header' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Attach images',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Header text shown in empty state',
      },
      /* wwEditor:end */
    },

    emptyStateDescription: {
      label: { en: 'Empty State Description' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '.png or .jpg 1024×1024',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Description text shown below header',
      },
      /* wwEditor:end */
    },

    // Visual customization
    thumbnailSize: {
      label: { en: 'Thumbnail Size' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '120px',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Size of image thumbnails',
      },
      /* wwEditor:end */
    },

    thumbnailGap: {
      label: { en: 'Thumbnail Gap' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '12px',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Gap between thumbnails',
      },
      /* wwEditor:end */
    },

    borderRadius: {
      label: { en: 'Border Radius' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '12px',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Border radius for thumbnails and empty state',
      },
      /* wwEditor:end */
    },

    emptyStatePadding: {
      label: { en: 'Empty State Padding' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '48px',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Padding inside empty state box',
      },
      /* wwEditor:end */
    },

    borderColor: {
      label: { en: 'Border Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#d1d5db',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of the dashed border',
      },
      /* wwEditor:end */
    },

    textColor: {
      label: { en: 'Text Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#6b7280',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of text in empty state',
      },
      /* wwEditor:end */
    },

    headerColor: {
      label: { en: 'Header Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#374151',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Color of header text',
      },
      /* wwEditor:end */
    },

    deleteButtonColor: {
      label: { en: 'Delete Button Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#374151',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color of delete button',
      },
      /* wwEditor:end */
    },

    backgroundColor: {
      label: { en: 'Background Color' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#f9fafb',
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Background color of empty state and add more box',
      },
      /* wwEditor:end */
    },
  },

  triggerEvents: [
    {
      name: 'upload-success',
      label: { en: 'On Upload Success' },
      event: '',
      /* wwEditor:start */
      default: true,
      /* wwEditor:end */
    },
    {
      name: 'upload-error',
      label: { en: 'On Upload Error' },
      event: { error: '', file: null },
    },
    {
      name: 'image-removed',
      label: { en: 'On Image Removed' },
      event: '',
    },
    {
      name: 'validation-error',
      label: { en: 'On Validation Error' },
      event: { error: '', file: null },
    },
    {
      name: 'images-changed',
      label: { en: 'On Images Changed' },
      event: [],
    },
  ],
}
