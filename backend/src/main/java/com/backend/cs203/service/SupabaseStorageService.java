package com.backend.cs203.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SupabaseStorageService {

    private final RestClient restClient;
    private final String bucketName;
    private final String storageBaseUrl;

    public SupabaseStorageService(
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

    /**
     * Uploads a file to the private bucket under the user's folder.
     * Returns the file path in storage (NOT a URL, since bucket is private).
     */
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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process file");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload to storage");
        }
    }

    /**
     * Generates a signed URL for a file in the private bucket.
     * @param filePath  the path stored from uploadFile()
     * @param expiresIn expiry time in seconds
     */
    public String getSignedUrl(String filePath, int expiresIn) {
        try {
            SignedUrlResponse response = restClient.post()
                    .uri("/object/sign/" + bucketName + "/" + filePath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new SignedUrlRequest(expiresIn))
                    .retrieve()
                    .body(SignedUrlResponse.class);

            if (response == null || response.signedURL() == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Empty signed URL response");
            }

            return storageBaseUrl + response.signedURL();

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate signed URL");
        }
    }

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

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private record SignedUrlRequest(int expiresIn) {}

    private record SignedUrlResponse(String signedURL) {}
}
