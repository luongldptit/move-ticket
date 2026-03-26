package com.movieticket.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
    public ResourceNotFoundException(String resource, Object id) {
        super("Không tìm thấy " + resource + " với id: " + id);
    }
}
