package com.careerflow;

import com.careerflow.dto.AuthRequest;
import com.careerflow.dto.AuthResponse;
import com.careerflow.entity.UserAccount;
import com.careerflow.repository.UserAccountRepository;
import com.careerflow.repository.UserCVDraftRepository;
import com.careerflow.repository.UserScanRecordRepository;
import com.careerflow.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private UserScanRecordRepository scanRecordRepository;

    @Mock
    private UserCVDraftRepository cvDraftRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userAccountRepository, scanRecordRepository, cvDraftRepository);
    }

    @Test
    void testRegisterSuccess() {
        when(userAccountRepository.existsByEmail("test@careerflow.dev")).thenReturn(false);
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
            UserAccount u = invocation.getArgument(0);
            u.setId(100L);
            return u;
        });

        AuthRequest req = new AuthRequest("test@careerflow.dev", "password123", "Test Engineer");
        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals(100L, res.getId());
        assertEquals("test@careerflow.dev", res.getEmail());
        assertNotNull(res.getToken());
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        when(userAccountRepository.existsByEmail("duplicate@careerflow.dev")).thenReturn(true);

        AuthRequest req = new AuthRequest("duplicate@careerflow.dev", "password123", "Test");
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void testLoginSuccess() {
        String salt = "testSalt123";
        String hash = authService.hashPassword("secretPass", salt);
        UserAccount mockUser = new UserAccount("user@careerflow.dev", hash, salt, "Jane Doe");
        mockUser.setId(200L);

        when(userAccountRepository.findByEmail("user@careerflow.dev")).thenReturn(Optional.of(mockUser));

        AuthRequest req = new AuthRequest("user@careerflow.dev", "secretPass", null);
        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertEquals(200L, res.getId());
        assertNotNull(res.getToken());
    }

    @Test
    void testLoginInvalidPasswordThrowsException() {
        String salt = "testSalt123";
        String hash = authService.hashPassword("secretPass", salt);
        UserAccount mockUser = new UserAccount("user@careerflow.dev", hash, salt, "Jane Doe");

        when(userAccountRepository.findByEmail("user@careerflow.dev")).thenReturn(Optional.of(mockUser));

        AuthRequest req = new AuthRequest("user@careerflow.dev", "wrongPass", null);
        assertThrows(IllegalArgumentException.class, () -> authService.login(req));
    }
}
