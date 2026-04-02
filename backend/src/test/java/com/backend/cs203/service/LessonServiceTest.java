package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.Quiz;
import com.backend.cs203.entity.Report;
import com.backend.cs203.entity.Review;
import com.backend.cs203.entity.User;
import com.backend.cs203.dto.lesson.AdminLessonStatsDTO;
import com.backend.cs203.dto.lesson.CreateLessonRequest;
import com.backend.cs203.dto.lesson.CreateLessonResponse;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.repository.UserLessonProgressRepository;
import com.backend.cs203.repository.UserRepository;


@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock
    private jakarta.persistence.EntityManager entityManager;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private ChapterRepository chapterRepository;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private ReviewRepository reviewRepository;      // ← ADD

    @Mock
    private UserRepository userRepository;          // ← ADD

    @Mock
    private UserLessonProgressRepository userLessonProgressRepository;

    @Mock
    private SupabaseStorageService supabaseStorageService;

    @InjectMocks
    private LessonService lessonService;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private VectorStoreService vectorStoreService;

    // ===== getAllLessons =====
    @Test
    void getAllLessons_returnsListFromRepository() {
        LessonSummaryDTO dto = mock(LessonSummaryDTO.class);
        when(lessonRepository.findAllLessons()).thenReturn(List.of(dto));

        List<LessonSummaryResponse> result = lessonService.getAllLessons();

        assertEquals(1, result.size());
        verify(lessonRepository).findAllLessons();
    }

    @Test
    void getAllLessons_returnsEmptyListWhenNoLessons() {
        when(lessonRepository.findAllLessons()).thenReturn(Collections.emptyList());

        List<LessonSummaryResponse> result = lessonService.getAllLessons();

        assertTrue(result.isEmpty());
    }

    // ===== getUserCreatedLessons =====
    @Test
    void getUserCreatedLessons_returnsLessonsForUser() {
        when(lessonRepository.findUserCreatedLessons(1)).thenReturn(List.of(mock(LessonApplicationDTO.class)));

        List<LessonApplicationDTO> result = lessonService.getUserCreatedLessons(1);

        assertEquals(1, result.size());
        verify(lessonRepository).findUserCreatedLessons(1);
    }

    @Test
    void getUserCreatedLessons_returnsEmptyForUserWithNoLessons() {
        when(lessonRepository.findUserCreatedLessons(999)).thenReturn(Collections.emptyList());

        List<LessonApplicationDTO> result = lessonService.getUserCreatedLessons(999);

        assertTrue(result.isEmpty());
    }

    // ===== getAllLessonApplications =====
    @Test
    void getAllLessonApplications_delegatesToRepository() {
        LessonApplicationDTO dto = mock(LessonApplicationDTO.class);
        when(lessonRepository.findAllLessonApplications()).thenReturn(List.of(dto));

        List<LessonApplicationDTO> result = lessonService.getAllLessonApplications();

        assertEquals(1, result.size());
        verify(lessonRepository).findAllLessonApplications();
    }

    // ===== getPendingLessonApplications =====
    @Test
    void getPendingLessonApplications_delegatesToRepository() {
        LessonSummaryDTO dto = mock(LessonSummaryDTO.class);
        when(lessonRepository.findAllPendingLessonApplications()).thenReturn(List.of(dto));

        List<LessonSummaryResponse> result = lessonService.getPendingLessonApplications();

        assertEquals(1, result.size());
        verify(lessonRepository).findAllPendingLessonApplications();
    }

    // ===== getUserCreatedLessonApplications =====
    @Test
    void getUserCreatedLessonApplications_returnsApplicationsForUser() {
        LessonApplicationDTO dto = mock(LessonApplicationDTO.class);
        when(lessonRepository.findUserCreatedLessonApplications(1)).thenReturn(List.of(dto)); // ← lowercase f

        List<LessonApplicationDTO> result = lessonService.getUserCreatedLessonApplications(1);

        assertEquals(1, result.size());
        verify(lessonRepository).findUserCreatedLessonApplications(1); // ← lowercase f
        verify(lessonRepository, never()).findUserCreatedLessons(anyInt());
    }

    @Test
    void getUserCreatedLessonApplications_returnsEmptyForUserWithNoPendingApplications() {
        when(lessonRepository.findUserCreatedLessonApplications(999)).thenReturn(Collections.emptyList()); // ← lowercase f

        List<LessonApplicationDTO> result = lessonService.getUserCreatedLessonApplications(999);

        assertTrue(result.isEmpty());
        verify(lessonRepository).findUserCreatedLessonApplications(999); // ← lowercase f
        verify(lessonRepository, never()).findUserCreatedLessons(anyInt());
    }

    @Test
    void getUserCreatedLessonApplications_passesThroughCorrectUserId() {
        when(lessonRepository.findUserCreatedLessonApplications(42)).thenReturn(Collections.emptyList());

        lessonService.getUserCreatedLessonApplications(42);

        verify(lessonRepository).findUserCreatedLessonApplications(42);
        verify(lessonRepository, never()).findUserCreatedLessons(42);
    }

    // ===== getLessonPage =====
    @Test
    void getLessonPage_returnsFullLessonWithChaptersCardsAndQuizzes() {
        User user = User.builder().id(1).username("testuser").build();

        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setTitle("Test Lesson");
        lesson.setDescription("Test Description");
        lesson.setCreatedBy(user);
        lesson.setCreatedAt(LocalDateTime.of(2024, 1, 1, 0, 0));

        Chapter chapter = new Chapter();
        chapter.setId(10);
        chapter.setTitle("Chapter 1");
        chapter.setDescription("Chapter desc");

        Card card = new Card();
        card.setId(100);
        card.setFront("Front text");
        card.setBack("Back text");
        card.setDisplayOrder(1);

        Quiz quiz = new Quiz();
        quiz.setId(200);
        quiz.setTitle("Quiz 1");
        quiz.setQuestion("What is 1+1?");
        quiz.setOptions("1,2,3,4");
        quiz.setCorrectAnswer("2");

        when(lessonRepository.findByTitle("Test Lesson")).thenReturn(Optional.of(lesson));
        when(chapterRepository.findByLessonId(1)).thenReturn(List.of(chapter));
        when(cardRepository.findByChapterId(10)).thenReturn(List.of(card));
        when(quizRepository.findByChapterId(10)).thenReturn(List.of(quiz));

        LessonPageDTO result = lessonService.getLessonPage("Test Lesson");

        assertEquals(1, result.getId());
        assertEquals("Test Lesson", result.getTitle());
        assertEquals("Test Description", result.getDescription());
        assertEquals("testuser", result.getCreatedBy());
        assertEquals(LocalDateTime.of(2024, 1, 1, 0, 0), result.getCreatedAt());

        assertEquals(1, result.getChapters().size());
        assertEquals(10, result.getChapters().get(0).getId());
        assertEquals("Chapter 1", result.getChapters().get(0).getTitle());
        assertEquals("Chapter desc", result.getChapters().get(0).getDescription());

        assertEquals(1, result.getChapters().get(0).getCards().size());
        assertEquals(100, result.getChapters().get(0).getCards().get(0).getId());
        assertEquals("Front text", result.getChapters().get(0).getCards().get(0).getFront());
        assertEquals("Back text", result.getChapters().get(0).getCards().get(0).getBack());
        assertEquals(1, result.getChapters().get(0).getCards().get(0).getDisplayOrder());

        assertEquals(1, result.getChapters().get(0).getQuizQuestions().size());
        assertEquals(200, result.getChapters().get(0).getQuizQuestions().get(0).getId());
        assertEquals("Quiz 1", result.getChapters().get(0).getQuizQuestions().get(0).getTitle());
        assertEquals("What is 1+1?", result.getChapters().get(0).getQuizQuestions().get(0).getQuestion());
        assertEquals("1,2,3,4", result.getChapters().get(0).getQuizQuestions().get(0).getOptions());
        assertEquals("2", result.getChapters().get(0).getQuizQuestions().get(0).getCorrectAnswer());
    }

    // ===== getAdminLessonPage =====
    @Test
    void getAdminLessonPage_returnsLessonPageForOwner() {
        User user = User.builder().id(1).username("admin").build();

        Lesson lesson = new Lesson();
        lesson.setId(5);
        lesson.setTitle("Admin Lesson");
        lesson.setDescription("Desc");
        lesson.setCreatedBy(user);
        lesson.setCreatedAt(LocalDateTime.of(2024, 3, 1, 0, 0));
        lesson.setStatus(Lesson.LessonStatus.pending);

        when(lessonRepository.findByTitleAndCreatedBy("Admin Lesson", 1)).thenReturn(Optional.of(lesson));
        when(chapterRepository.findByLessonId(5)).thenReturn(Collections.emptyList());

        LessonPageDTO result = lessonService.getAdminLessonPage("Admin Lesson", 1);

        assertEquals(5, result.getId());
        assertEquals("Admin Lesson", result.getTitle());
        assertTrue(result.getChapters().isEmpty());
        verify(lessonRepository).findByTitleAndCreatedBy("Admin Lesson", 1);
    }

    @Test
    void getAdminLessonPage_throwsWhenLessonNotFoundOrNotOwned() {
        when(lessonRepository.findByTitleAndCreatedBy("Other Lesson", 99)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> lessonService.getAdminLessonPage("Other Lesson", 99));

        assertEquals("Lesson not found or you don't have permission to edit it", ex.getMessage());
        verify(chapterRepository, never()).findByLessonId(anyInt());
    }

    // ===== getRootLessonApplicationPage =====
    @Test
    void getRootLessonApplicationPage_returnsLessonPage() {
        User user = User.builder().id(2).username("author").build();

        Lesson lesson = new Lesson();
        lesson.setId(7);
        lesson.setTitle("Pending Lesson");
        lesson.setDescription("Review me");
        lesson.setCreatedBy(user);
        lesson.setCreatedAt(LocalDateTime.of(2024, 5, 1, 0, 0));
        lesson.setStatus(Lesson.LessonStatus.pending);

        when(lessonRepository.findByTitleNotDeleted("Pending Lesson")).thenReturn(Optional.of(lesson));
        when(chapterRepository.findByLessonId(7)).thenReturn(Collections.emptyList());

        LessonPageDTO result = lessonService.getRootLessonApplicationPage("Pending Lesson");

        assertEquals(7, result.getId());
        assertEquals("Pending Lesson", result.getTitle());
        assertEquals("author", result.getCreatedBy());
        verify(lessonRepository).findByTitleNotDeleted("Pending Lesson");
    }

    @Test
    void getRootLessonApplicationPage_throwsWhenLessonNotFound() {
        when(lessonRepository.findByTitleNotDeleted("Ghost")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> lessonService.getRootLessonApplicationPage("Ghost"));

        assertEquals("Lesson application not found", ex.getMessage());
        verify(chapterRepository, never()).findByLessonId(anyInt());
    }

    @Test
    void getRootLessonApplicationPage_throwsWhenTitleIsNull() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> lessonService.getRootLessonApplicationPage(null));

        assertEquals("Lesson title must be provided", ex.getMessage());
        verify(lessonRepository, never()).findByTitleNotDeleted(any());
    }

    @Test
    void getRootLessonApplicationPage_throwsWhenTitleIsBlank() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> lessonService.getRootLessonApplicationPage("   "));

        assertEquals("Lesson title must be provided", ex.getMessage());
        verify(lessonRepository, never()).findByTitleNotDeleted(any());
    }

    @Test
    void getLessonPage_throwsExceptionWhenLessonNotFound() {
        when(lessonRepository.findByTitle("Nonexistent")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> lessonService.getLessonPage("Nonexistent"));

        assertEquals("Lesson not found", ex.getMessage());
        verify(chapterRepository, never()).findByLessonId(anyInt());
    }

    @Test
    void getLessonPage_handlesChapterWithNoCardsOrQuizzes() {
        User user = User.builder().id(1).username("testuser").build();

        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setTitle("Empty Lesson");
        lesson.setDescription("Description");
        lesson.setCreatedBy(user);
        lesson.setCreatedAt(LocalDateTime.now());

        Chapter chapter = new Chapter();
        chapter.setId(10);
        chapter.setTitle("Empty Chapter");
        chapter.setDescription("No content");

        when(lessonRepository.findByTitle("Empty Lesson")).thenReturn(Optional.of(lesson));
        when(chapterRepository.findByLessonId(1)).thenReturn(List.of(chapter));
        when(cardRepository.findByChapterId(10)).thenReturn(Collections.emptyList());
        when(quizRepository.findByChapterId(10)).thenReturn(Collections.emptyList());

        LessonPageDTO result = lessonService.getLessonPage("Empty Lesson");

        assertEquals(1, result.getChapters().size());
        assertTrue(result.getChapters().get(0).getCards().isEmpty());
        assertTrue(result.getChapters().get(0).getQuizQuestions().isEmpty());
    }

    @Test
    void getLessonPage_handlesMultipleChaptersWithSeparateContent() {
        User user = User.builder().id(1).username("testuser").build();

        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setTitle("Multi Chapter");
        lesson.setDescription("Desc");
        lesson.setCreatedBy(user);
        lesson.setCreatedAt(LocalDateTime.now());

        Chapter ch1 = new Chapter();
        ch1.setId(10);
        ch1.setTitle("Chapter 1");
        ch1.setDescription("First");

        Chapter ch2 = new Chapter();
        ch2.setId(20);
        ch2.setTitle("Chapter 2");
        ch2.setDescription("Second");

        Card card1 = new Card();
        card1.setId(100);
        card1.setFront("C1 Front");
        card1.setBack("C1 Back");
        card1.setDisplayOrder(1);

        Card card2 = new Card();
        card2.setId(101);
        card2.setFront("C2 Front");
        card2.setBack("C2 Back");
        card2.setDisplayOrder(1);

        when(lessonRepository.findByTitle("Multi Chapter")).thenReturn(Optional.of(lesson));
        when(chapterRepository.findByLessonId(1)).thenReturn(List.of(ch1, ch2));
        when(cardRepository.findByChapterId(10)).thenReturn(List.of(card1));
        when(cardRepository.findByChapterId(20)).thenReturn(List.of(card2));
        when(quizRepository.findByChapterId(10)).thenReturn(Collections.emptyList());
        when(quizRepository.findByChapterId(20)).thenReturn(Collections.emptyList());

        LessonPageDTO result = lessonService.getLessonPage("Multi Chapter");

        assertEquals(2, result.getChapters().size());
        assertEquals("Chapter 1", result.getChapters().get(0).getTitle());
        assertEquals("Chapter 2", result.getChapters().get(1).getTitle());
        assertEquals("C1 Front", result.getChapters().get(0).getCards().get(0).getFront());
        assertEquals("C2 Front", result.getChapters().get(1).getCards().get(0).getFront());
    }

    // ===== getAdminLessonStats =====

    @Test
    void getAdminLessonStats_returnsCorrectCounts() {
        when(lessonRepository.countPendingAndApprovedByUserId(1)).thenReturn(5L);
        when(lessonRepository.countPublishedByUserId(1)).thenReturn(3L);
        when(userLessonProgressRepository.countAttemptsByAdminId(1)).thenReturn(20L);
        when(userLessonProgressRepository.countCompletionsByAdminId(1)).thenReturn(10L);

        AdminLessonStatsDTO result = lessonService.getAdminLessonStats(1);

        assertEquals(5L, result.getTotalLessons());
        assertEquals(3L, result.getPublishedLessons());
        assertEquals(20L, result.getTotalAttempts());
        assertEquals(10L, result.getTotalCompletions());
        verify(lessonRepository).countPendingAndApprovedByUserId(1);
        verify(lessonRepository).countPublishedByUserId(1);
        verify(userLessonProgressRepository).countAttemptsByAdminId(1);
        verify(userLessonProgressRepository).countCompletionsByAdminId(1);
    }

    @Test
    void getLessonPage_handlesLessonWithNoChapters() {
        User user = User.builder().id(1).username("testuser").build();

        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setTitle("No Chapters");
        lesson.setDescription("Desc");
        lesson.setCreatedBy(user);
        lesson.setCreatedAt(LocalDateTime.now());

        when(lessonRepository.findByTitle("No Chapters")).thenReturn(Optional.of(lesson));
        when(chapterRepository.findByLessonId(1)).thenReturn(Collections.emptyList());

        LessonPageDTO result = lessonService.getLessonPage("No Chapters");

        assertEquals("No Chapters", result.getTitle());
        assertTrue(result.getChapters().isEmpty());
    }

    @Test
    void deleteLesson_setsDeletedAt_andClosesReports_whenCreator() {
        User creator = new User();
        creator.setId(123);
        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setCreatedBy(creator);
        lesson.setDeletedAt(null);

        // Mock open reports
        Report report1 = new Report();
        report1.setId(10);
        report1.setStatus(Report.ReportStatus.reported);
        report1.setRemarks("Initial remark");

        Report report2 = new Report();
        report2.setId(11);
        report2.setStatus(Report.ReportStatus.reported);
        report2.setRemarks(null);

        when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));
        when(reportRepository.findNotClosedReportsByLessonId(1)).thenReturn(List.of(report1, report2));
        when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

        lessonService.deleteLesson(1, 123);

        assertNotNull(lesson.getDeletedAt());
        verify(lessonRepository).save(lesson);

        // Reports should be closed and have the appended remark
        assertEquals(Report.ReportStatus.closed, report1.getStatus());
        assertTrue(report1.getRemarks().contains("\nLesson Admin closed lesson"));
        assertEquals(Report.ReportStatus.closed, report2.getStatus());
        assertTrue(report2.getRemarks().contains("\nLesson Admin closed lesson"));

        verify(reportRepository, times(2)).save(any(Report.class));
    }

    @Test
    void deleteLesson_alreadyDeleted_doesNotCloseReports() {
        User creator = new User();
        creator.setId(123);
        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setCreatedBy(creator);
        lesson.setDeletedAt(LocalDateTime.now());

        when(lessonRepository.findById(1)).thenReturn(Optional.of(lesson));

        Exception ex = assertThrows(RuntimeException.class, () -> {
            lessonService.deleteLesson(1, 123);
        });
        assertTrue(ex.getMessage().contains("already deleted"));

        verify(reportRepository, never()).findNotClosedReportsByLessonId(anyInt());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void deleteLesson_notFound_doesNotCloseReports() {
        when(lessonRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            lessonService.deleteLesson(1, 123);
        });

        verify(reportRepository, never()).findNotClosedReportsByLessonId(anyInt());
        verify(reportRepository, never()).save(any(Report.class));
    }


    @Test
    void updateLesson_throwsWhenLessonNotFoundOrNotOwned() {
        User user = User.builder().id(1).username("author").build();
        CreateLessonRequest req = new CreateLessonRequest();
        when(lessonRepository.findByTitleAndCreatedBy("Missing", 1)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> lessonService.updateLesson("Missing", req, user));
        assertEquals("Lesson not found or you don't have permission to edit it", ex.getMessage());
    }

    @Test
    void updateLesson_throwsWhenChaptersFormatInvalid() {
        User user = User.builder().id(1).username("author").build();
        Lesson lesson = new Lesson();
        lesson.setId(10);
        lesson.setCreatedBy(user);
        lesson.setStatus(Lesson.LessonStatus.saved);

        CreateLessonRequest req = new CreateLessonRequest();
        req.setTitle("T");
        req.setDescription("D");
        req.setDraft(false);
        req.setChapters("not a json");

        when(lessonRepository.findByTitleAndCreatedBy("T", 1)).thenReturn(Optional.of(lesson));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> lessonService.updateLesson("T", req, user));
        assertEquals("Invalid chapters format", ex.getMessage());
    }

    @Test
    void updateLesson_throwsWhenTagsFormatInvalid() {
        User user = User.builder().id(1).username("author").build();
        Lesson lesson = new Lesson();
        lesson.setId(10);
        lesson.setCreatedBy(user);
        lesson.setStatus(Lesson.LessonStatus.saved);

        CreateLessonRequest req = new CreateLessonRequest();
        req.setTitle("T");
        req.setDescription("D");
        req.setDraft(false);
        req.setChapters("[]");
        req.setTags("not a json");

        when(lessonRepository.findByTitleAndCreatedBy("T", 1)).thenReturn(Optional.of(lesson));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> lessonService.updateLesson("T", req, user));
        assertEquals("Invalid tags format", ex.getMessage());
    }

    @Test
    void updateLesson_throwsWhenLessonStatusNotEditable() {
        User user = User.builder().id(1).username("author").build();
        Lesson lesson = new Lesson();
        lesson.setId(10);
        lesson.setCreatedBy(user);
        lesson.setStatus(Lesson.LessonStatus.approved);

        CreateLessonRequest req = new CreateLessonRequest();
        req.setTitle("T");
        req.setDescription("D");
        req.setDraft(false);
        req.setChapters("[]"); 

        when(lessonRepository.findByTitleAndCreatedBy("T", 1)).thenReturn(Optional.of(lesson));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> lessonService.updateLesson("T", req, user));
        assertEquals("Only saved, pending, or rejected lessons can be edited", ex.getMessage());
    }
    // ===== updateLesson =====
    @Test
    void updateLesson_updatesTitleDescriptionAndStatus() {
        User user = User.builder().id(1).username("author").build();
        Lesson lesson = new Lesson();
        lesson.setId(10);
        lesson.setTitle("Old Title");
        lesson.setDescription("Old Desc");
        lesson.setCreatedBy(user);
        lesson.setStatus(Lesson.LessonStatus.saved);

        String chaptersJson = "[{\"title\":\"Ch1\",\"description\":\"Desc1\",\"cards\":[],\"quizzes\":[]}]";
        String tagsJson = "[\"tag1\",\"tag2\"]";

        CreateLessonRequest req = new CreateLessonRequest();
        req.setTitle("New Title");
        req.setDescription("New Desc");
        req.setDraft(false);
        req.setChapters(chaptersJson);
        req.setTags(tagsJson);

        when(lessonRepository.findByTitleAndCreatedBy("Old Title", 1)).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenAnswer(i -> i.getArgument(0));
        // Mock entityManager for tag/chapters
        jakarta.persistence.Query query = mock(jakarta.persistence.Query.class);
        when(entityManager.createNativeQuery(any(String.class))).thenReturn(query);
        when(query.setParameter(any(String.class), any())).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        CreateLessonResponse resp = lessonService.updateLesson("Old Title", req, user);

        assertEquals("New Title", lesson.getTitle());
        assertEquals("New Desc", lesson.getDescription());
        assertEquals("pending", lesson.getStatus().name());
        assertEquals("Lesson updated successfully and re-submitted for approval", resp.getMessage());
        verify(lessonRepository).save(lesson);
    }

    // ===== createLesson =====
    @Test
    void createLesson_validRequest_savesLessonAndReturnsResponse() {
        User user = User.builder().id(1).username("author").build();
        CreateLessonRequest req = new CreateLessonRequest();
        req.setTitle("T");
        req.setDescription("D");
        req.setDraft(false);
        req.setChapters("[]");
        req.setTags("[]");

        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setTitle("T");
        lesson.setDescription("D");
        lesson.setStatus(Lesson.LessonStatus.pending);
        lesson.setCreatedBy(user);

        when(lessonRepository.save(any(Lesson.class))).thenReturn(lesson);

        CreateLessonResponse resp = lessonService.createLesson(req, user);

        assertEquals("T", resp.getTitle());
        assertEquals("Lesson created successfully and submitted for approval", resp.getMessage());
        verify(lessonRepository, times(1)).save(any(Lesson.class)); // once for initial, once for image (if any)
    }

    // ===== submitReview =====
    @Test
    void submitReview_validReview_savesReview() {
        int lessonId = 1, userId = 2;
        Lesson lesson = new Lesson();
        lesson.setId(lessonId);
        User user = User.builder().id(userId).build();

        when(reviewRepository.existsByReviewedByIdAndLessonId(userId, lessonId)).thenReturn(false);
        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(lesson));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        lessonService.submitReview(lessonId, userId, 5, "Great!");

        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void submitReview_alreadyReviewed_throwsException() {
        int lessonId = 1, userId = 2;
        when(reviewRepository.existsByReviewedByIdAndLessonId(userId, lessonId)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> lessonService.submitReview(lessonId, userId, 5, "Great!"));
        assertEquals("You have already reviewed this lesson", ex.getMessage());
    }

    @Test
    void submitReview_invalidRating_throwsException() {
        int lessonId = 1, userId = 2;
        when(reviewRepository.existsByReviewedByIdAndLessonId(userId, lessonId)).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
            () -> lessonService.submitReview(lessonId, userId, 0, "Bad"));
    }

    // ===== reviewLessonApplication =====
    @Test
    void reviewLessonApplication_approve_setsStatusAndCallsVectorStore() {
        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setStatus(Lesson.LessonStatus.pending);
        when(lessonRepository.findByTitleNotDeleted("T")).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(lesson);

        // Mock buildLessonPageDTO
        LessonPageDTO lessonPageDTO = mock(LessonPageDTO.class);
        LessonService spyService = spy(lessonService);
        doReturn(lessonPageDTO).when(spyService).buildLessonPageDTO(lesson);

        spyService.reviewLessonApplication("T", "approve");

        assertEquals(Lesson.LessonStatus.approved, lesson.getStatus());
        verify(lessonRepository).save(lesson);
        verify(vectorStoreService).insertLesson(any(LessonPageDTO.class));
    }

    @Test
    void reviewLessonApplication_reject_setsStatusRejected() {
        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setStatus(Lesson.LessonStatus.pending);
        when(lessonRepository.findByTitleNotDeleted("T")).thenReturn(Optional.of(lesson));
        when(lessonRepository.save(any(Lesson.class))).thenReturn(lesson);

        lessonService.reviewLessonApplication("T", "reject");

        assertEquals(Lesson.LessonStatus.rejected, lesson.getStatus());
        verify(lessonRepository).save(lesson);
        verify(vectorStoreService, never()).insertLesson(any());
    }

    @Test
    void reviewLessonApplication_notPending_throwsException() {
        Lesson lesson = new Lesson();
        lesson.setId(1);
        lesson.setStatus(Lesson.LessonStatus.approved);
        when(lessonRepository.findByTitleNotDeleted("T")).thenReturn(Optional.of(lesson));

        assertThrows(IllegalStateException.class,
            () -> lessonService.reviewLessonApplication("T", "approve"));
    }

    // ===== getLessonRating =====
    @Test
    void getLessonRating_returnsCorrectValues() {
        int lessonId = 1, userId = 2;
        when(reviewRepository.findAverageRatingByLessonId(lessonId)).thenReturn(4.5);
        when(reviewRepository.findRatingCountByLessonId(lessonId)).thenReturn(10);
        when(reviewRepository.existsByReviewedByIdAndLessonId(userId, lessonId)).thenReturn(true);

        var dto = lessonService.getLessonRating(lessonId, userId);

        assertEquals(lessonId, dto.getLessonId());
        assertEquals(4.5, dto.getAverageRating());
        assertEquals(10, dto.getRatingCount());
        assertTrue(dto.isHasReviewed());
    }
    @Test
    void getUserReview_returnsReviewDTO_whenReviewExists() {
        int lessonId = 1, userId = 2;
        Review review = new Review();
        review.setRating((byte) 4);
        review.setFeedback("Nice lesson!");
        when(reviewRepository.findByReviewedByIdAndLessonId(userId, lessonId)).thenReturn(Optional.of(review));

        var dto = lessonService.getUserReview(lessonId, userId);

        assertEquals(lessonId, dto.getLessonId());
        assertEquals(userId, dto.getUserId());
        assertEquals((byte) 4, dto.getRating());
        assertEquals("Nice lesson!", dto.getFeedback());
    }

    @Test
    void getUserReview_throwsException_whenReviewNotFound() {
        int lessonId = 1, userId = 2;
        when(reviewRepository.findByReviewedByIdAndLessonId(userId, lessonId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> lessonService.getUserReview(lessonId, userId));
        assertEquals("Review not found", ex.getMessage());
    }
}
