package com.seaworld.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception for all service-layer business errors.
 * Subclass for specific error categories instead of throwing this directly.
 */
@Getter
public class ServiceException extends RuntimeException {

    private final HttpStatus status;

    public ServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
