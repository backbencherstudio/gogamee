# Image Upload Setup Guide

## Overview
This project uses a frontend-only image upload system that saves images to the `public/uploads/` directory. The system is designed to be easily replaceable with backend API calls.

## ⚠️ Current Status
**Temporary Setup**: Currently using existing images from `/homepage/image/` folder to avoid 404 errors. The upload system is ready but no images have been uploaded yet.

**To Use Upload System:**
1. Go to Admin Dashboard → Testimonial Management
2. Click "Add Review" 
3. Upload a new image - it will be saved to `/uploads/reviews/`
4. The system will automatically use the uploaded image path

## Current Setup

### File Structure
```
public/
├── uploads/
│   └── reviews/          # Review images
│       ├── avatar1.jpg
│       ├── avatar2.jpg
│       └── ...
└── homepage/
    └── image/           # Static images
        ├── avatar1.png
        ├── avatar2.png
        └── ...
```

### API Route
- **Location**: `app/api/upload-image/route.ts`
- **Endpoint**: `POST /api/upload-image`
- **Function**: Handles image upload and saves to public folder

### Data Structure
```typescript
// app/lib/appdata.ts
reviews: {
  list: [
    {
      id: 1,
      name: "Esther Howard",
      role: "Wellness Coach",
      image: "/uploads/reviews/avatar1.jpg", // File path
      rating: 5,
      review: "..."
    }
  ]
}
```

## How It Works

### 1. Image Upload Process
1. User selects image in admin dashboard
2. `uploadImage()` utility function validates file
3. File is sent to `/api/upload-image` endpoint
4. Image is saved to `public/uploads/reviews/` folder
5. File path is returned and stored in data

### 2. Image Display
- Frontend components use the file path to display images
- Fallback to default avatar if image fails to load
- Images are served from public folder

## Backend Integration

### Option 1: Replace API Route
Replace `app/api/upload-image/route.ts` with your backend API call:

```typescript
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Send to your backend
    const response = await fetch('YOUR_BACKEND_URL/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

### Option 2: Update Utility Function
Modify `app/lib/utils.ts` to call your backend directly:

```typescript
export const uploadImage = async (file: File, type: string = 'reviews') => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    // Call your backend API
    const response = await fetch('YOUR_BACKEND_URL/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: 'Upload failed' };
  }
};
```

### Option 3: Update Data Source
Replace `app/lib/appdata.ts` with API calls:

```typescript
// Instead of static data, fetch from your backend
export const getReviews = async () => {
  const response = await fetch('YOUR_BACKEND_URL/api/reviews');
  return response.json();
};
```

## Configuration

### Environment Variables
Add to `.env.local`:
```env
# For backend integration
NEXT_PUBLIC_API_URL=your_backend_url
NEXT_PUBLIC_UPLOAD_URL=your_upload_endpoint
```

### Image Settings
- **Max File Size**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Upload Directory**: `public/uploads/reviews/`
- **File Naming**: `timestamp.extension`

## Benefits

✅ **No Backend Required**: Works with frontend-only deployment
✅ **Easy Migration**: Simple to replace with backend API
✅ **File Path Based**: Clean data structure
✅ **Error Handling**: Fallback images and validation
✅ **Scalable**: Can easily add CDN or cloud storage

## Migration Checklist

When moving to backend:

1. [ ] Update API route to call your backend
2. [ ] Update utility function if needed
3. [ ] Update data source to fetch from API
4. [ ] Update image paths to use your CDN/backend URLs
5. [ ] Test image upload and display
6. [ ] Update error handling for backend responses

## Troubleshooting

### Common Issues
1. **Upload fails**: Check file size and type
2. **Image not displaying**: Verify file path and permissions
3. **API errors**: Check network and backend status

### Debug Steps
1. Check browser console for errors
2. Verify file exists in uploads folder
3. Test API endpoint directly
4. Check file permissions on server 