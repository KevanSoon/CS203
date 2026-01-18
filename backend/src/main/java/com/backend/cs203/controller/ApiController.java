package com.backend.cs203.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "service", "cs203-backend"
        ));
    }

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello(@RequestParam(defaultValue = "World") String name) {
        return ResponseEntity.ok(Map.of(
            "message", "Hello, " + name + "!"
        ));
    }

    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
            "echo", body,
            "timestamp", System.currentTimeMillis()
        ));
    }
}
