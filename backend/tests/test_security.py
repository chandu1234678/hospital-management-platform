"""
Tests for security utilities: hashing, token creation/decoding
"""
import pytest
import time
from app.core.security import hash_password, verify_password, create_token, decode_token


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = hash_password("mysecret")
        assert hashed != "mysecret"

    def test_verify_correct_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("correct_password", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_same_password_produces_different_hashes(self):
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2  # bcrypt uses random salt

    def test_empty_password_hashes(self):
        hashed = hash_password("")
        assert verify_password("", hashed) is True


class TestTokens:
    def test_create_and_decode_token(self):
        token = create_token({"sub": "user@test.com", "role": "PATIENT"}, expires_minutes=60)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user@test.com"
        assert payload["role"] == "PATIENT"

    def test_decode_invalid_token_returns_none(self):
        result = decode_token("not.a.valid.token")
        assert result is None

    def test_decode_tampered_token_returns_none(self):
        token = create_token({"sub": "user@test.com"}, expires_minutes=60)
        tampered = token[:-5] + "XXXXX"
        assert decode_token(tampered) is None

    def test_expired_token_returns_none(self):
        # Create token that expires in 0 minutes (already expired)
        token = create_token({"sub": "user@test.com"}, expires_minutes=0)
        time.sleep(1)
        result = decode_token(token)
        assert result is None

    def test_token_contains_expiry(self):
        token = create_token({"sub": "user@test.com"}, expires_minutes=30)
        payload = decode_token(token)
        assert "exp" in payload

    def test_different_data_produces_different_tokens(self):
        t1 = create_token({"sub": "user1@test.com"}, expires_minutes=60)
        t2 = create_token({"sub": "user2@test.com"}, expires_minutes=60)
        assert t1 != t2
