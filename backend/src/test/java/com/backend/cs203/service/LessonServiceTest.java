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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
import com.backend.cs203.entity.User;
import com.backend.cs203.dto.lesson.AdminLessonStatsDTO;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.repository.UserLessonProgressRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.exception.Exceptions;

@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

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

}
