package com.backend.cs203.service;

public interface PasswordResetService {

    public void sendOtp(String email);

    public void verifyOtp(String email, String otp);

    public void resetPassword(String email, String otp, String newPassword);

}