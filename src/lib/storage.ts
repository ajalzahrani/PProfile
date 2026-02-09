// Storage path utility
// Handles file storage location configuration
import path from "path";

/**
 * Get the base storage directory
 * Uses STORAGE_PATH environment variable if set, otherwise defaults to project public/uploads
 */
export function getStorageBasePath(): string {
  const storagePath = process.env.STORAGE_PATH;

  if (storagePath) {
    // Use custom storage path (e.g., C:\uploads or /var/uploads)
    return path.resolve(storagePath);
  }

  // Default to project public/uploads
  return path.join(process.cwd(), "public", "uploads");
}

/**
 * Get the full path for a file given its relative path (e.g., /uploads/docId/type/file.pdf)
 */
export function getStorageFilePath(relativePath: string): string {
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith("/")
    ? relativePath.slice(1)
    : relativePath;

  // Remove 'uploads/' prefix if present (for backward compatibility)
  const pathWithoutPrefix = cleanPath.startsWith("uploads/")
    ? cleanPath.slice("uploads/".length)
    : cleanPath;

  return path.join(getStorageBasePath(), pathWithoutPrefix);
}

/**
 * Get relative path from storage (for URLs)
 * Always returns path starting with /uploads/ for consistency
 */
export function getRelativeStoragePath(absolutePath: string): string {
  const basePath = getStorageBasePath();
  const relativePath = path.relative(basePath, absolutePath);
  return `/uploads/${relativePath.replace(/\\/g, "/")}`; // Normalize Windows paths
}

/**
 * Validate that a file path is within the storage directory (security check)
 */
export function validateStoragePath(filePath: string): boolean {
  const basePath = getStorageBasePath();
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(basePath);

  // Check if the resolved path is within the base storage path
  return resolvedPath.startsWith(resolvedBase);
}
