package com.meslektas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Meslektaş Backend Application
 * Strategic Domain-Driven Design Implementation
 * 
 * @author Meslektaş Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableTransactionManagement
public class MeslektasApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeslektasApplication.class, args);
    }
}
