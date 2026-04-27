package com.seaworld.exception;

import org.springframework.http.HttpStatus;

/** Thrown when a rate limit or quota is exceeded (HTTP 429). */
public class RateLimitException extends ServiceException {

    public RateLimitException(String message) {
        super(message, HttpStatus.TOO_MANY_REQUESTS);
    }
}
