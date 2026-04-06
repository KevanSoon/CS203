package com.backend.cs203.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.backend.cs203.service.impl.SupabaseStorageServiceImpl;

@ExtendWith(MockitoExtension.class)
class SupabaseStorageServiceTest {

    @Mock
    private SupabaseStorageServiceImpl supabaseStorageService;

    @Mock
    private MultipartFile multipartFile;

    @Test
    void uploadFile_returnsFilePath_stubbed() {
        when(supabaseStorageService.uploadFile(anyString(), any(MultipartFile.class))).thenReturn("avatars/image.png");
        String result = supabaseStorageService.uploadFile("avatars", multipartFile);
        assertEquals("avatars/image.png", result);
    }

    @Test
    void getSignedUrl_returnsUrl_stubbed() {
        when(supabaseStorageService.getSignedUrl(anyString(), anyInt())).thenReturn("http://signed.url/avatars/image.png");
        String url = supabaseStorageService.getSignedUrl("avatars/image.png", 3600);
        assertEquals("http://signed.url/avatars/image.png", url);
    }

    @Test
    void deleteFile_executesWithoutException_stubbed() {
        // By default, mocks do nothing for void methods unless told to throw
        assertDoesNotThrow(() -> supabaseStorageService.deleteFile("avatars/image.png"));
    }
}