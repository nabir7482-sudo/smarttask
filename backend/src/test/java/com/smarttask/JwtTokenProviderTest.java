package com.smarttask;

import com.smarttask.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtTokenProviderTest {

    @Tes
    void rejectsSigningSecretsShorterThan256Bits() {
        assertThrows(IllegalArgumentException.class, () -> new JwtTokenProvider("too-short", 60_000));
    }

    @Tes
    void acceptsSigningSecretsAtLeast256BitsLong() {
        assertDoesNotThrow(() -> new JwtTokenProvider("01234567890123456789012345678901", 60_000));
    }
}
