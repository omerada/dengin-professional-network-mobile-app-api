package com.meslektas.common.storage;

import com.meslektas.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Image Processor
 * 
 * Handles image validation, resizing, compression.
 * Used before uploading images to storage.
 */
@Slf4j
@Component
public class ImageProcessor {

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_WIDTH = 2048;
    private static final int MAX_HEIGHT = 2048;

    /**
     * Validate image file
     */
    public void validateImage(MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new BusinessException("File is empty", "EMPTY_FILE");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(
                    "File size exceeds maximum allowed size (10MB)",
                    "FILE_TOO_LARGE"
            );
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException(
                    "Invalid file type. Allowed types: JPEG, PNG, WebP",
                    "INVALID_FILE_TYPE"
            );
        }

        // Validate actual image
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new BusinessException(
                        "File is not a valid image",
                        "INVALID_IMAGE"
                );
            }
        } catch (IOException e) {
            throw new BusinessException(
                    "Failed to read image file",
                    "IMAGE_READ_FAILED"
            );
        }
    }

    /**
     * Resize image if dimensions exceed limits
     */
    public BufferedImage resize(BufferedImage originalImage, int maxWidth, int maxHeight) {
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        // Calculate new dimensions maintaining aspect ratio
        double aspectRatio = (double) originalWidth / originalHeight;
        int newWidth = originalWidth;
        int newHeight = originalHeight;

        if (originalWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = (int) (newWidth / aspectRatio);
        }

        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = (int) (newHeight * aspectRatio);
        }

        // If no resize needed, return original
        if (newWidth == originalWidth && newHeight == originalHeight) {
            return originalImage;
        }

        // Resize image
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = resizedImage.createGraphics();

        // Improve quality
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        graphics.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        graphics.dispose();

        log.info("Image resized from {}x{} to {}x{}", originalWidth, originalHeight, newWidth, newHeight);

        return resizedImage;
    }

    /**
     * Compress image to JPEG format
     */
    public byte[] compress(BufferedImage image, float quality) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Write as JPEG with specified quality
        var writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IOException("No JPEG writer found");
        }

        var writer = writers.next();
        var imageOutputStream = ImageIO.createImageOutputStream(outputStream);
        writer.setOutput(imageOutputStream);

        var writeParam = writer.getDefaultWriteParam();
        writeParam.setCompressionMode(javax.imageio.ImageWriteParam.MODE_EXPLICIT);
        writeParam.setCompressionQuality(quality);

        writer.write(null, new javax.imageio.IIOImage(image, null, null), writeParam);

        imageOutputStream.close();
        writer.dispose();

        return outputStream.toByteArray();
    }

    /**
     * Process image: validate, resize, compress
     */
    public byte[] processImage(MultipartFile file) {
        try {
            validateImage(file);

            BufferedImage image = ImageIO.read(file.getInputStream());
            BufferedImage resized = resize(image, MAX_WIDTH, MAX_HEIGHT);
            byte[] compressed = compress(resized, 0.85f); // 85% quality

            log.info("Image processed: original size={}, processed size={}", file.getSize(), compressed.length);

            return compressed;

        } catch (IOException e) {
            log.error("Failed to process image", e);
            throw new BusinessException(
                    "Failed to process image: " + e.getMessage(),
                    "IMAGE_PROCESSING_FAILED"
            );
        }
    }
}
