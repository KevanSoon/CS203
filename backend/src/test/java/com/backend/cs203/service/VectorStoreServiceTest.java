package com.backend.cs203.service;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import com.backend.cs203.dto.card.CardDTO;
import com.backend.cs203.dto.chapter.ChapterDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.service.impl.VectorStoreServiceImpl;

@ExtendWith(MockitoExtension.class)
class VectorStoreServiceTest {

    // A valid base64-encoded 32-byte (256-bit) HMAC key for tests
    private static final String TEST_JWT_SECRET =
            Base64.getEncoder().encodeToString(new byte[32]);
    private static final String BASE_URL = "http://vectorstore.test";

    @Mock
    private RestTemplate restTemplate;

    private VectorStoreServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new VectorStoreServiceImpl();
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "jwtSecret", TEST_JWT_SECRET);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void setUrl(String url) {
        ReflectionTestUtils.setField(service, "vectorStoreUrl", url);
    }

    private LessonPageDTO buildLesson(List<String> tags) {
        CardDTO card = new CardDTO(10, "What is Java?", "A language", 1);
        ChapterDTO chapter = new ChapterDTO(2, "Intro", "Introduction chapter", List.of(card), List.of());
        return new LessonPageDTO(1, "Java Basics", "Learn Java", null, "admin",
                null, List.of(chapter), tags, "PUBLISHED");
    }

    // ── insertLesson ───────────────────────────────────────────────────────────

    @Test
    void insertLesson_skipsWhenUrlBlank() {
        setUrl("");
        service.insertLesson(buildLesson(List.of("java")));
        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    void insertLesson_skipsWhenUrlNull() {
        setUrl(null);
        service.insertLesson(buildLesson(List.of("java")));
        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @SuppressWarnings("unchecked")
    void insertLesson_callsCorrectEndpointWithPayload() {
        setUrl(BASE_URL);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("ok", HttpStatus.OK));

        LessonPageDTO lesson = buildLesson(List.of("java", "oop"));
        service.insertLesson(lesson);

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(urlCaptor.capture(), entityCaptor.capture(), eq(String.class));

        assertEquals(BASE_URL + "/vectorstore/lesson", urlCaptor.getValue());

        Map<String, Object> payload = (Map<String, Object>) entityCaptor.getValue().getBody();
        assertNotNull(payload);
        assertEquals(1, payload.get("id"));
        assertEquals("Java Basics", payload.get("title"));
        assertEquals("Learn Java", payload.get("description"));
        assertEquals(List.of("java", "oop"), payload.get("tags"));

        List<Map<String, Object>> chapters = (List<Map<String, Object>>) payload.get("chapters");
        assertEquals(1, chapters.size());
        assertEquals(2, chapters.get(0).get("id"));
        assertEquals("Intro", chapters.get(0).get("title"));

        List<Map<String, Object>> cards = (List<Map<String, Object>>) chapters.get(0).get("cards");
        assertEquals(1, cards.size());
        assertEquals(10, cards.get(0).get("id"));
        assertEquals("What is Java?", cards.get(0).get("front"));
        assertEquals("A language", cards.get(0).get("back"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void insertLesson_includesBearerAuthHeader() {
        setUrl(BASE_URL);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("ok", HttpStatus.OK));

        service.insertLesson(buildLesson(List.of()));

        ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(anyString(), entityCaptor.capture(), eq(String.class));

        String auth = entityCaptor.getValue().getHeaders().getFirst("Authorization");
        assertNotNull(auth);
        assertTrue(auth.startsWith("Bearer "), "Authorization header should start with 'Bearer '");
    }

    @Test
    @SuppressWarnings("unchecked")
    void insertLesson_nullTagsDefaultsToEmptyList() {
        setUrl(BASE_URL);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("ok", HttpStatus.OK));

        service.insertLesson(buildLesson(null));

        ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(anyString(), entityCaptor.capture(), eq(String.class));

        Map<String, Object> payload = (Map<String, Object>) entityCaptor.getValue().getBody();
        assertNotNull(payload);
        assertEquals(List.of(), payload.get("tags"));
    }

    @Test
    void insertLesson_doesNotPropagateException() {
        setUrl(BASE_URL);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("network error"));

        assertDoesNotThrow(() -> service.insertLesson(buildLesson(List.of())));
    }

    // ── deleteLesson ───────────────────────────────────────────────────────────

    @Test
    void deleteLesson_skipsWhenUrlBlank() {
        setUrl("");
        service.deleteLesson(42);
        verify(restTemplate, never()).exchange(anyString(), any(), any(), eq(String.class));
    }

    @Test
    void deleteLesson_skipsWhenUrlNull() {
        setUrl(null);
        service.deleteLesson(42);
        verify(restTemplate, never()).exchange(anyString(), any(), any(), eq(String.class));
    }

    @Test
    void deleteLesson_callsCorrectDeleteEndpoint() {
        setUrl(BASE_URL);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.DELETE), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("ok", HttpStatus.OK));

        service.deleteLesson(42);

        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<HttpEntity<?>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(urlCaptor.capture(), eq(HttpMethod.DELETE), entityCaptor.capture(), eq(String.class));

        assertEquals(BASE_URL + "/vectorstore/lesson/42", urlCaptor.getValue());

        String auth = entityCaptor.getValue().getHeaders().getFirst("Authorization");
        assertNotNull(auth);
        assertTrue(auth.startsWith("Bearer "), "Authorization header should start with 'Bearer '");
    }

    @Test
    void deleteLesson_doesNotPropagateException() {
        setUrl(BASE_URL);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.DELETE), any(), eq(String.class)))
                .thenThrow(new RuntimeException("timeout"));

        assertDoesNotThrow(() -> service.deleteLesson(99));
    }
}
