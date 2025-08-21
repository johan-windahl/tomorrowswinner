/**
 * Image utilities for avatar handling
 * Provides image resizing and validation functions
 */

/**
 * Resize image to fit within specified dimensions while maintaining aspect ratio
 */
export function resizeImage(
    file: File,
    maxWidth: number = 400,
    maxHeight: number = 400,
    quality: number = 0.8
): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            const { width, height } = calculateDimensions(
                img.width,
                img.height,
                maxWidth,
                maxHeight
            );

            // Set canvas size
            canvas.width = width;
            canvas.height = height;

            // Draw resized image
            ctx?.drawImage(img, 0, 0, width, height);

            // Convert to data URL
            const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(resizedDataUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Calculate dimensions that fit within max bounds while maintaining aspect ratio
 */
export function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // Scale down if image is too large
    if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
    }

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Please select an image file' };
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'File size must be less than 10MB' };
    }

    return { valid: true };
}

/**
 * Get optimal avatar dimensions based on display size
 */
export function getAvatarDimensions(size: 'sm' | 'md' | 'lg' | 'xl'): { width: number; height: number } {
    const sizeMap = {
        sm: 32,
        md: 48,
        lg: 64,
        xl: 80,
    };

    const baseSize = sizeMap[size];
    // Use 2x for retina displays and better quality
    return { width: baseSize * 2, height: baseSize * 2 };
}
