package com.backend.cs203.service;

import org.springframework.web.multipart.MultipartFile;

public interface SupabaseStorageService {

    //upload image file to supabase private bucket, returns file path for storing in DB
    public String uploadFile(String folderPath, MultipartFile file);

    // get signedurl of image file from private supabase bucket, 
    // filePath is path stored from uploadfile 
    // expiresIn is expiry time of url in seconds
    public String getSignedUrl(String filePath, int expiresIn);

    //delete image file from supabase bucket if there is existing
    public void deleteFile(String filePath);

}
