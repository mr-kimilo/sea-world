package com.seaworld.exception;

import org.springframework.http.HttpStatus;

/** Thrown when a requested resource does not exist (HTTP 404). */
public class ResourceNotFoundException extends ServiceException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
