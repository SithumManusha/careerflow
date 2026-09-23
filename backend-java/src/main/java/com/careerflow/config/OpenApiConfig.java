package com.careerflow.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI careerFlowOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CareerFlow Enterprise API")
                        .description("High-Performance ATS Resume Optimization, Token-Bucket Rate Limiting & Candidate Showcase Engine.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("CareerFlow Engineering Team")
                                .url("https://careerflow.app")
                                .email("engineering@careerflow.app"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
