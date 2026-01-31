package com.backend.cs203.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.Chapter;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
}
