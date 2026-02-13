import { BadRequestException } from '@nestjs/common';

/**
 * Allowed file types for uploads
 */
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  CSV: ['text/csv', 'application/csv'],
};

/**
 * Maximum file sizes in bytes
 */
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  CSV: 2 * 1024 * 1024, // 2MB
};

/**
 * Validate file upload type and size
 */
export function validateFileUpload(
  file: Express.Multer.File,
  allowedTypes: string[],
  maxSize: number,
): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  // Validate file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    );
  }

  // Validate file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new BadRequestException(
      `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    );
  }

  // Additional security: Check file extension matches mimetype
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  const mimetypeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'text/csv': ['csv'],
    'application/csv': ['csv'],
  };

  const expectedExtensions = mimetypeExtensionMap[file.mimetype];
  if (expectedExtensions && extension && !expectedExtensions.includes(extension)) {
    throw new BadRequestException(
      'File extension does not match file type',
    );
  }
}

/**
 * Validate image upload
 */
export function validateImageUpload(file: Express.Multer.File): void {
  validateFileUpload(file, ALLOWED_FILE_TYPES.IMAGE, MAX_FILE_SIZES.IMAGE);
}

/**
 * Validate document upload
 */
export function validateDocumentUpload(file: Express.Multer.File): void {
  validateFileUpload(file, ALLOWED_FILE_TYPES.DOCUMENT, MAX_FILE_SIZES.DOCUMENT);
}

/**
 * Validate CSV upload
 */
export function validateCSVUpload(file: Express.Multer.File): void {
  validateFileUpload(file, ALLOWED_FILE_TYPES.CSV, MAX_FILE_SIZES.CSV);
}
