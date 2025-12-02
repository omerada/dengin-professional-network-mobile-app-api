package com.meslektas.common.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Static Resource Configuration
 * 
 * Configures static file serving for local development.
 * Maps /uploads/** to local upload directory.
 */
@Configuration
public class StaticResourceConfiguration implements WebMvcConfigurer {

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
