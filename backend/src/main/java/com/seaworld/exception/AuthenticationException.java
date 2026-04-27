package com.seaworld.exception;

import org.springframework.http.HttpStatus;

/** Thrown when authentication fails or credentials are invalid (HTTP 401). */
public class AuthenticationException extends ServiceException {

    public AuthenticationException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
