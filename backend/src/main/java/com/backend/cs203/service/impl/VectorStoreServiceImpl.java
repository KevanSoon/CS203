package com.backend.cs203.service.impl;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.service.VectorStoreService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class VectorStoreServiceImpl implements VectorStoreService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${vectorstore.api.url:}")
    private String vectorStoreUrl;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private String generateServiceToken() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");
        return Jwts.builder()
                .setSubject("service")
                .claim("role", "service")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60_000)) // 1 minute
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private HttpHeaders buildAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(generateServiceToken());
        return headers;
    }

    @Override
    @Async
    public void insertLesson(LessonPageDTO lesson) {
        if (vectorStoreUrl == null || vectorStoreUrl.isBlank()) {
            System.out.println("[VectorStore] URL not configured, skipping insert");
            return;
        }

        try {
            System.out.println("[VectorStore] Calling URL: '" + vectorStoreUrl + "' length=" + vectorStoreUrl.length());
            Map<String, Object> payload = buildPayload(lesson);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, buildAuthHeaders());
            restTemplate.postForEntity(vectorStoreUrl + "/vectorstore/lesson", request, String.class);
            System.out.println("[VectorStore] Inserted lesson: " + lesson.getTitle());
        } catch (Exception e) {
            System.err.println("[VectorStore] Failed to insert lesson " + lesson.getId() + ": " + e.getClass().getName() + ": " + e.getMessage());
        }
    }

    @Override
    @Async
    public void deleteLesson(Integer lessonId) {
        if (vectorStoreUrl == null || vectorStoreUrl.isBlank()) {
            System.out.println("[VectorStore] URL not configured, skipping delete");
            return;
        }

        try {
            HttpEntity<Void> request = new HttpEntity<>(buildAuthHeaders());
            restTemplate.exchange(
                    vectorStoreUrl + "/vectorstore/lesson/" + lessonId,
                    HttpMethod.DELETE,
                    request,
                    String.class
            );
            System.out.println("[VectorStore] Deleted lesson: " + lessonId);
        } catch (Exception e) {
            System.err.println("[VectorStore] Failed to delete lesson " + lessonId + ": " + e.getMessage());
        }
    }

    private Map<String, Object> buildPayload(LessonPageDTO lesson) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", lesson.getId());
        payload.put("title", lesson.getTitle());
        payload.put("description", lesson.getDescription());
        payload.put("tags", lesson.getTags() != null ? lesson.getTags() : List.of());

        List<Map<String, Object>> chapters = lesson.getChapters().stream().map(ch -> {
            Map<String, Object> chMap = new HashMap<>();
            chMap.put("id", ch.getId());
            chMap.put("title", ch.getTitle());
            chMap.put("description", ch.getDescription());

            List<Map<String, Object>> cards = ch.getCards().stream().map(card -> {
                Map<String, Object> cardMap = new HashMap<>();
                cardMap.put("id", card.getId());
                cardMap.put("front", card.getFront());
                cardMap.put("back", card.getBack());
                return cardMap;
            }).collect(Collectors.toList());

            chMap.put("cards", cards);
            return chMap;
        }).collect(Collectors.toList());

        payload.put("chapters", chapters);
        return payload;
    }
}
