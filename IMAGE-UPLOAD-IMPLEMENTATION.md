# Image Upload Implementation Guide

## Backend Changes Needed

### 1. Update License Entity
```java
// Change from:
@Column(name = "proof_document_url", columnDefinition = "NVARCHAR(MAX)")
private String proofDocumentUrl;

// To:
@Column(name = "proof_images", columnDefinition = "NVARCHAR(MAX)")
private String proofImages;
```

### 2. Update License DTO
```java
// Change from:
private String proofDocumentUrl;

// To:
private String proofImages;
```

### 3. Update License Controller
```java
// Change upload endpoint from PDF to images
@PostMapping("/upload-images")
public ResponseEntity<?> uploadLicenseImages(
    @RequestParam("images") MultipartFile[] images,
    @RequestHeader("Authorization") String token
) {
    // Handle multiple image uploads
    // Return JSON array of image URLs
}
```

## Frontend Changes Needed

### 1. Update State Variables
```javascript
// Change from:
const [selectedPdfFile, setSelectedPdfFile] = useState(null);
const [uploadingPdf, setUploadingPdf] = useState(false);

// To:
const [selectedImageFiles, setSelectedImageFiles] = useState([]);
const [uploadingImages, setUploadingImages] = useState(false);
```

### 2. Update Form State
```javascript
// Change from:
proof_document_url: ""

// To:
proof_images: ""
```

### 3. Create Image Upload Handler
```javascript
const handleImageUpload = async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  setUploadingImages(true);
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = await user.getIdToken();
    const response = await fetch('http://localhost:8080/api/licenses/upload-images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const currentImages = licenseForm.proof_images ? JSON.parse(licenseForm.proof_images) : [];
      const newImages = [...currentImages, ...data.imageUrls];
      setLicenseForm({ ...licenseForm, proof_images: JSON.stringify(newImages) });
      toast.success(`Upload ${files.length} hình ảnh thành công!`);
    } else {
      throw new Error('Upload thất bại');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    toast.error('Không thể upload hình ảnh');
  } finally {
    setUploadingImages(false);
    event.target.value = ''; // Reset input
  }
};
```

### 4. Update License Display
```javascript
// Change from:
const proofDocumentUrl = license.proofDocumentUrl || license.proof_document_url;

// To:
const proofImages = license.proofImages || license.proof_images;
```

### 5. Update License Form Handling
```javascript
// Change from:
proof_document_url: license.proofDocumentUrl || license.proof_document_url || ""

// To:
proof_images: license.proofImages || license.proof_images || ""
```

## Database Migration

### SQL to Update Existing Data
```sql
-- Add new column
ALTER TABLE License ADD proof_images NVARCHAR(MAX);

-- Copy existing PDF URLs to images (if any)
UPDATE License 
SET proof_images = CASE 
  WHEN proof_document_url IS NOT NULL AND proof_document_url != '' 
  THEN '["' + proof_document_url + '"]'
  ELSE NULL 
END;

-- Drop old column (after testing)
-- ALTER TABLE License DROP COLUMN proof_document_url;
```

## Testing Steps

1. **Backend**: Update License entity and controller
2. **Database**: Run migration SQL
3. **Frontend**: Update state and handlers
4. **Test**: Upload multiple images for a license
5. **Test**: View images in gallery modal
6. **Test**: Edit existing license with images

## Benefits

- ✅ **Better UX**: Images load faster than PDFs
- ✅ **Mobile Friendly**: Images work better on mobile
- ✅ **Multiple Images**: Can upload front/back of license
- ✅ **Gallery View**: Easy navigation between images
- ✅ **No External Dependencies**: No need for PDF viewers
