package com.seaworld.exception;

import org.springframework.http.HttpStatus;

/** Thrown when the caller lacks permission to perform an action (HTTP 403). */
public class ForbiddenException extends ServiceException {

    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
