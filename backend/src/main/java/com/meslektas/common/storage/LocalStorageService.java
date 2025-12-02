package com.meslektas.common.storage;

import com.meslektas.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local File Storage Implementation
 * 
 * Used for development environment.
 * Stores files in local filesystem.
 * 
 * Active when profile: dev
 */
@Slf4j
@Service
@Profile("dev")
public class LocalStorageService implements StorageService {

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private int serverPort;

    /**
     * Upload file to local storage
     */
    @Override
    public String upload(MultipartFile file, String folder) {
        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir, folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File uploaded to local storage: {}", filePath);

            // Return public URL
            return getPublicUrl(folder + "/" + uniqueFilename);

        } catch (IOException e) {
            log.error("Failed to upload file to local storage", e);
            throw new BusinessException(
                    "Failed to upload file: " + e.getMessage(),
                    "FILE_UPLOAD_FAILED"
            );
        }
    }

    /**
     * Delete file from local storage
     */
    @Override
    public void delete(String fileUrl) {
        try {
            // Extract path from URL
            String key = extractKeyFromUrl(fileUrl);
            Path filePath = Paths.get(uploadDir, key);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted from local storage: {}", filePath);
            } else {
                log.warn("File not found for deletion: {}", filePath);
            }

        } catch (IOException e) {
            log.error("Failed to delete file from local storage", e);
            throw new BusinessException(
                    "Failed to delete file: " + e.getMessage(),
                    "FILE_DELETE_FAILED"
            );
        }
    }

    /**
     * Get public URL for file
     */
    @Override
    public String getPublicUrl(String key) {
        return String.format("http://localhost:%d/uploads/%s", serverPort, key);
    }

    /**
     * Check if file exists
     */
    @Override
    public boolean exists(String key) {
        Path filePath = Paths.get(uploadDir, key);
        return Files.exists(filePath);
    }

    /**
     * Extract key from URL
     */
    private String extractKeyFromUrl(String url) {
        // Extract path after /uploads/
        int uploadsIndex = url.indexOf("/uploads/");
        if (uploadsIndex != -1) {
            return url.substring(uploadsIndex + 9); // length of "/uploads/"
        }
        return url;
    }
}
