package com.backend.cs203.service.impl;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.service.SupabaseStorageService;

@Service
public class SupabaseStorageServiceImpl implements SupabaseStorageService {

    private final RestClient restClient;
    private final String bucketName;
    private final String storageBaseUrl;

    public SupabaseStorageServiceImpl(
            @Value("${supabase.service-token}") String serviceToken,
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.storage.bucket}") String bucketName) {
        this.bucketName = bucketName;
        this.storageBaseUrl = supabaseUrl + "/storage/v1";
        this.restClient = RestClient.builder()
                .baseUrl(storageBaseUrl)
                .defaultHeader("Authorization", "Bearer " + serviceToken)
                .defaultHeader("apikey", serviceToken)
                .build();
    }

    //upload image file to supabase private bucket, returns file path for storing in DB
    @Override
    public String uploadFile(String folderPath, MultipartFile file) {
        validateFile(file);

        String extension = getExtension(file.getOriginalFilename());
        String filePath = folderPath + "/" + UUID.randomUUID() + extension;

        try {
            byte[] fileBytes = file.getBytes();

            restClient.post()
                    .uri("/object/" + bucketName + "/" + filePath)
                    .contentType(MediaType.valueOf(file.getContentType()))
                    .body(fileBytes)
                    .retrieve()
                    .toBodilessEntity();

            return filePath;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Failed to process file");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Failed to upload to storage");
        }
    }

    // get signedurl of image file from private supabase bucket, 
    // filePath is path stored from uploadfile 
    // expiresIn is expiry time of url in seconds
    @Override
    public String getSignedUrl(String filePath, int expiresIn) {
        try {
            SignedUrlResponse response = restClient.post()
                    .uri("/object/sign/" + bucketName + "/" + filePath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new SignedUrlRequest(expiresIn))
                    .retrieve()
                    .body(SignedUrlResponse.class);

            if (response == null || response.signedURL() == null) {
                return null;
            }

            return storageBaseUrl + response.signedURL();

        } catch (Exception e) {
            return null;
        }
    }

    //delete image file from supabase bucket if there is existing
    @Override
    public void deleteFile(String filePath) {
        try {
            restClient.delete()
                    .uri("/object/" + bucketName + "/" + filePath)
                    .retrieve()
                    .toBodilessEntity();
        }
        catch (Exception e) {
             throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Failed to delete from storage");
        }
    }

    //file validation
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File too large (max 5MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }
    }

    //file extension
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private record SignedUrlRequest(int expiresIn) {}

    private record SignedUrlResponse(String signedURL) {}
}
