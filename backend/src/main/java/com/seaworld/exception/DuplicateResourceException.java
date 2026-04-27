package com.seaworld.exception;

import org.springframework.http.HttpStatus;

/** Thrown when a resource already exists and cannot be duplicated (HTTP 409). */
public class DuplicateResourceException extends ServiceException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
