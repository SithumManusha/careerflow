package com.careerflow;

import com.careerflow.service.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RateLimiterServiceTest {

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
    }

    @Test
    void testTokenConsumptionUnderLimit() {
        String clientId = "test-client-1";
        // Client starts with 10 tokens
        for (int i = 0; i < 10; i++) {
            assertTrue(rateLimiterService.tryConsume(clientId), "Token " + (i + 1) + " should be successfully consumed");
        }
        assertEquals(0, rateLimiterService.getRemainingTokens(clientId));
    }

    @Test
    void testRateLimitEnforcedWhenExhausted() {
        String clientId = "test-client-2";
        for (int i = 0; i < 10; i++) {
            rateLimiterService.tryConsume(clientId);
        }
        // 11th request must be rejected
        assertFalse(rateLimiterService.tryConsume(clientId), "11th request must be rejected due to rate limiting");
    }

    @Test
    void testDifferentClientsHaveIndependentBuckets() {
        String clientA = "client-A";
        String clientB = "client-B";

        for (int i = 0; i < 10; i++) {
            rateLimiterService.tryConsume(clientA);
        }
        assertFalse(rateLimiterService.tryConsume(clientA));

        // Client B must still have full tokens
        assertTrue(rateLimiterService.tryConsume(clientB));
        assertEquals(9, rateLimiterService.getRemainingTokens(clientB));
    }
}
