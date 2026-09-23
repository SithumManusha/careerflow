package com.careerflow;

import com.careerflow.entity.CandidateProfile;
import com.careerflow.entity.JobPosting;
import com.careerflow.repository.CandidateProfileRepository;
import com.careerflow.repository.JobPostingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication(exclude = {RedisAutoConfiguration.class})
public class CareerFlowApplication {

    private static final Logger log = LoggerFactory.getLogger(CareerFlowApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CareerFlowApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(
            CandidateProfileRepository profileRepository,
            JobPostingRepository jobRepository
    ) {
        return args -> {
            log.info("Initializing CareerFlow Enterprise database seed data...");

            // 1. Seed Sample Candidate Profile
            if (!profileRepository.existsByUsername("sample-candidate")) {
                CandidateProfile profile = new CandidateProfile(
                        "sample-candidate",
                        "Sample Candidate",
                        "Software Engineer Intern",
                        "Dedicated undergraduate engineer specializing in high-throughput enterprise backends in Java Spring Boot 3, Redis caching, and intelligent RAG-driven AI workflows.",
                        "candidate@example.com",
                        "https://github.com",
                        "https://linkedin.com"
                );
                profile.setPhone("+94 71 000 0000");
                profile.setPortfolioUrl("https://careerflow.app/p/sample-candidate");
                profile.setSkills(List.of(
                        "Java 21", "Spring Boot 3", "Spring Data JPA", "PostgreSQL", "Redis",
                        "Next.js", "React", "TypeScript", "Docker", "Playwright",
                        "FastAPI", "RAG & Vector Search", "RESTful APIs", "CI/CD"
                ));
                profile.setExperienceSummary(
                        "Developed enterprise microservices with automated testing, token-bucket rate limiting, and distributed cache integration."
                );
                profileRepository.save(profile);
                log.info("Seeded primary candidate profile: sample-candidate");
            }

            // 2. Seed Enterprise Job Postings for benchmarking
            if (jobRepository.count() == 0) {
                jobRepository.save(new JobPosting(
                        "Backend Engineering",
                        "Software Engineer Intern (Java Core / Cloud)",
                        "Looking for driven software engineering interns passionate about building scalable enterprise backends with Java 21, Spring Boot, REST APIs, and PostgreSQL. Familiarity with Docker, Redis caching, and CI/CD pipelines is highly advantageous.",
                        "Remote / Hybrid",
                        "Internship",
                        List.of("Java", "Spring Boot", "REST APIs", "PostgreSQL", "Docker", "Redis", "Git")
                ));

                jobRepository.save(new JobPosting(
                        "Full-Stack Systems",
                        "Associate Software Engineer / Intern",
                        "Seeking engineers to build resilient enterprise cloud technologies. Requirements include strong fundamentals in Object-Oriented Programming (Java/Python), modern web technologies (React/Next.js), relational databases, and automated testing (JUnit or Playwright).",
                        "Hybrid",
                        "Internship",
                        List.of("Java", "OOP", "React", "Next.js", "PostgreSQL", "JUnit", "Playwright", "Microservices")
                ));

                jobRepository.save(new JobPosting(
                        "Cloud & Microservices",
                        "Software Engineer Intern - Cloud & Full-Stack",
                        "Seeking engineers to design digital products with modern cloud technologies. Required skills: TypeScript, React/Next.js, Java Spring Boot or Python FastAPI, clean code principles, and containerization using Docker.",
                        "Remote",
                        "Internship",
                        List.of("TypeScript", "React", "Next.js", "Java", "Spring Boot", "Docker", "Agile", "FastAPI")
                ));
                log.info("Seeded enterprise job benchmark templates.");
            }
        };
    }
}
