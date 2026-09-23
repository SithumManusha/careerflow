package com.careerflow.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * High-Performance Token Bucket Rate Limiter
 * Provides thread-safe API rate limiting (10 requests/minute per client)
 * to protect AI/LLM compute endpoints from exhaustion and DoS attacks.
 */
@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);

    private static final int MAX_TOKENS = 10;
    private static final long REFILL_INTERVAL_MILLIS = 60_000; // 1 minute window

    private final ConcurrentHashMap<String, TokenBucket> clientBuckets = new ConcurrentHashMap<>();

    private static class TokenBucket {
        final AtomicInteger tokens;
        final AtomicLong lastRefillTimestamp;

        TokenBucket(int initialTokens) {
            this.tokens = new AtomicInteger(initialTokens);
            this.lastRefillTimestamp = new AtomicLong(System.currentTimeMillis());
        }

        void refill() {
            long now = System.currentTimeMillis();
            long lastRefill = lastRefillTimestamp.get();
            if (now - lastRefill > REFILL_INTERVAL_MILLIS) {
                if (lastRefillTimestamp.compareAndSet(lastRefill, now)) {
                    tokens.set(MAX_TOKENS);
                }
            }
        }
    }

    public boolean tryConsume(String clientId) {
        TokenBucket bucket = clientBuckets.computeIfAbsent(clientId, k -> new TokenBucket(MAX_TOKENS));
        bucket.refill();

        int currentTokens = bucket.tokens.get();
        while (currentTokens > 0) {
            if (bucket.tokens.compareAndSet(currentTokens, currentTokens - 1)) {
                log.info("RateLimiter: Consumed 1 token for client '{}'. Remaining: {}", clientId, currentTokens - 1);
                return true;
            }
            currentTokens = bucket.tokens.get();
        }

        log.warn("RateLimiter: Rate limit exceeded for client '{}'. No tokens remaining in current window.", clientId);
        return false;
    }

    public int getRemainingTokens(String clientId) {
        TokenBucket bucket = clientBuckets.get(clientId);
        if (bucket == null) return MAX_TOKENS;
        bucket.refill();
        return Math.max(0, bucket.tokens.get());
    }

    public void reset(String clientId) {
        clientBuckets.remove(clientId);
    }
}
