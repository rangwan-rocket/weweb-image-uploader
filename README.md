# WeWeb Image Uploader

A WeWeb custom component for uploading images to Supabase Storage with drag-and-drop support.

## Features

- **Drag & Drop**: Drag and drop images directly onto the component
- **Multiple Uploads**: Upload multiple images at once
- **Supabase Integration**: Uploads directly to Supabase Storage
- **Edit Mode Support**: Handle existing images when editing records
- **Validation**: File type, size, and count validation
- **Customizable**: Fully customizable styling through WeWeb editor
- **Editor Preview**: Works in WeWeb editor with local preview (no Supabase needed)

## Installation

```bash
npm install
```

## Development

```bash
npm run serve --port=8080
```

Then add the custom element in WeWeb editor developer popup: `https://localhost:8080/`

## Build

```bash
npm run build --name=image-uploader
```

## Properties

### Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `initialImages` | Array | `[]` | Existing image URLs for edit mode |
| `maxFiles` | Number | `5` | Maximum number of images allowed |
| `allowedFormats` | Array | `['jpg', 'jpeg', 'png', 'webp']` | Allowed file extensions |
| `maxSizeMB` | Number | `5` | Maximum file size in MB |
| `bucketName` | String | `'images'` | Supabase Storage bucket name |
| `storagePath` | String | `'uploads'` | Path prefix for uploads |
| `emptyStateHeader` | String | `'Attach images'` | Header text in empty state |
| `emptyStateDescription` | String | `'.png or .jpg 1024×1024'` | Description text |

### Style

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `thumbnailSize` | Length | `'120px'` | Size of image thumbnails |
| `thumbnailGap` | Length | `'12px'` | Gap between thumbnails |
| `borderRadius` | Length | `'12px'` | Border radius |
| `emptyStatePadding` | Length | `'48px'` | Padding in empty state |
| `borderColor` | Color | `'#d1d5db'` | Dashed border color |
| `textColor` | Color | `'#6b7280'` | Text color |
| `headerColor` | Color | `'#374151'` | Header text color |
| `deleteButtonColor` | Color | `'#374151'` | Delete button background |
| `backgroundColor` | Color | `'#f9fafb'` | Background color |

## Component Variables

| Variable | Type | Description |
|----------|------|-------------|
| `imageUrls` | Array | All current image URLs (existing + new) |
| `removedUrls` | Array | URLs removed from initial images |
| `newUrls` | Array | Newly uploaded URLs |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `upload-success` | `{ url, file }` | Fired after successful upload |
| `upload-error` | `{ error, file }` | Fired on upload error |
| `image-removed` | `{ url, isExisting }` | Fired when image is removed |
| `validation-error` | `{ error, file }` | Fired on validation failure |
| `images-changed` | `{ imageUrls, removedUrls, newUrls }` | Fired on any change |

## Usage

### Creating New Records

1. Leave `initialImages` empty
2. User uploads images
3. Save using `component.imageUrls`

### Editing Existing Records

1. Bind existing URLs to `initialImages`
2. User can add/remove images
3. Save using `component.imageUrls`
4. Optionally use `component.removedUrls` to clean up storage

## Requirements

- WeWeb Supabase plugin must be configured
- Supabase Storage bucket must exist and be accessible
