package com.inventory.exception;
public class InvalidOrderStatusException extends RuntimeException {
    public InvalidOrderStatusException(String message) { super(message); }
}
