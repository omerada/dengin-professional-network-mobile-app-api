package com.meslektas.common.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Storage Service Interface
 * 
 * Abstraction for file storage operations.
 * Implementations: S3StorageService (production), LocalStorageService (development)
 */
public interface StorageService {

    /**
     * Upload a file to storage
     * 
     * @param file File to upload
     * @param folder Target folder/path
     * @return Public URL of uploaded file
     */
    String upload(MultipartFile file, String folder);

    /**
     * Delete a file from storage
     * 
     * @param fileUrl URL of file to delete
     */
    void delete(String fileUrl);

    /**
     * Get public URL for a file
     * 
     * @param key File key/path
     * @return Public URL
     */
    String getPublicUrl(String key);

    /**
     * Check if file exists
     * 
     * @param key File key/path
     * @return true if exists
     */
    boolean exists(String key);
}
