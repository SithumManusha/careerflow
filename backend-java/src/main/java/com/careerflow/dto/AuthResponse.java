package com.careerflow.dto;

public class AuthResponse {
    private Long id;
    private String email;
    private String fullName;
    private String token;
    private String message;

    public AuthResponse() {}

    public AuthResponse(Long id, String email, String fullName, String token, String message) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.token = token;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
