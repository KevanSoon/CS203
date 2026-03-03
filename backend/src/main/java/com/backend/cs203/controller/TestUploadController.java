package com.backend.cs203.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.cs203.service.SupabaseStorageService;

import lombok.RequiredArgsConstructor;

/**
 * Temporary controller for testing Supabase Storage uploads.
 * DELETE this after verifying uploads work.
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestUploadController {

    private final SupabaseStorageService storageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> testUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "test-user") String folder) {
        String storagePath = storageService.uploadFile(folder, file);
        return Map.of("storagePath", storagePath);
    }

    @GetMapping("/signed-url")
    public Map<String, String> testSignedUrl(@RequestParam("path") String path) {
        // Signed URL valid for 60 seconds
        String signedUrl = storageService.getSignedUrl(path, 60);
        return Map.of("signedUrl", signedUrl);
    }
}
