package com.backend.cs203.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.cs203.dto.progress.DashboardProgressDTO;
import com.backend.cs203.dto.progress.DashboardResponseDTO;
import com.backend.cs203.dto.progress.LessonProgressDTO;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.User;
import com.backend.cs203.entity.UserLessonProgress;
import com.backend.cs203.entity.UserLessonProgress.ProgressStatus;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.repository.QuizResultRepository;
import com.backend.cs203.repository.UserCardProgressRepository;
import com.backend.cs203.repository.UserLessonProgressRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.service.impl.UserProgressServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserProgressServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private LessonRepository lessonRepository;
    @Mock private ChapterRepository chapterRepository;
    @Mock private CardRepository cardRepository;
    @Mock private QuizRepository quizRepository;
    @Mock private QuizResultRepository quizResultRepository;
    @Mock private UserLessonProgressRepository userLessonProgressRepository;
    @Mock private UserCardProgressRepository userCardProgressRepository;

    @InjectMocks
    private UserProgressServiceImpl userProgressService;

    private User user;
    private Lesson lesson;
    private Chapter chapter;
    private Card card;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1).username("testuser").streak(0).build();

        lesson = new Lesson();
        lesson.setId(10);
        lesson.setTitle("Java Basics");
        lesson.setStatus(Lesson.LessonStatus.approved);

        chapter = new Chapter();
        chapter.setId(100);
        chapter.setTitle("Chapter 1");
        chapter.setLesson(lesson);

        card = new Card();
        card.setId(1000);
        card.setFront("Q");
        card.setBack("A");
        card.setChapter(chapter);
    }

    /** Helper: creates a typed List<Object[]> with a single row [chapterId, count]. */
    private static List<Object[]> groupedRow(int chapterId, long count) {
        List<Object[]> list = new ArrayList<>();
        list.add(new Object[]{chapterId, count});
        return list;
    }

    /** Helper: creates a typed List<Object[]> with two rows. */
    private static List<Object[]> groupedRows(int ch1, long c1, int ch2, long c2) {
        List<Object[]> list = new ArrayList<>();
        list.add(new Object[]{ch1, c1});
        list.add(new Object[]{ch2, c2});
        return list;
    }

    // ===== getDashboard =====

    @Test
    void getDashboard_userNotFound_throwsAuthException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(AuthException.class, () -> userProgressService.getDashboard("ghost"));
    }

    @Test
    void getDashboard_noLessons_returnsEmptyList() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findAll()).thenReturn(Collections.emptyList());
        when(chapterRepository.findAll()).thenReturn(Collections.emptyList());
        when(userLessonProgressRepository.findByUserId(1)).thenReturn(Collections.emptyList());
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(Collections.emptyList());
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(Collections.emptyList());
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        DashboardResponseDTO result = userProgressService.getDashboard("testuser");

        assertTrue(result.getProgress().isEmpty());
    }

    @Test
    void getDashboard_approvedLessonWithNoChapters_returnsZeroProgress() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findAll()).thenReturn(List.of(lesson));
        when(chapterRepository.findAll()).thenReturn(Collections.emptyList());
        when(userLessonProgressRepository.findByUserId(1)).thenReturn(Collections.emptyList());
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(Collections.emptyList());
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(Collections.emptyList());
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        DashboardResponseDTO result = userProgressService.getDashboard("testuser");

        assertEquals(1, result.getProgress().size());
        assertEquals(10, result.getProgress().get(0).getLessonId());
        assertEquals("not_started", result.getProgress().get(0).getStatus());
        assertEquals(0, result.getProgress().get(0).getTotalItems());
        assertEquals(0, result.getProgress().get(0).getCompletedItems());
        assertEquals(0.0, result.getProgress().get(0).getProgressPercent());
    }

    @Test
    void getDashboard_pendingLessonIsExcluded() {
        Lesson pending = new Lesson();
        pending.setId(20);
        pending.setStatus(Lesson.LessonStatus.pending);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findAll()).thenReturn(List.of(pending));
        when(chapterRepository.findAll()).thenReturn(Collections.emptyList());
        when(userLessonProgressRepository.findByUserId(1)).thenReturn(Collections.emptyList());
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(Collections.emptyList());
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(Collections.emptyList());
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        DashboardResponseDTO result = userProgressService.getDashboard("testuser");

        assertTrue(result.getProgress().isEmpty());
    }

    @Test
    void getDashboard_progressPercentCalculatedCorrectly() {
        // chapter has 3 cards + 1 quiz = 4 total items; user completed 2 cards + quiz = 3 items
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findAll()).thenReturn(List.of(lesson));
        when(chapterRepository.findAll()).thenReturn(List.of(chapter));
        when(userLessonProgressRepository.findByUserId(1)).thenReturn(Collections.emptyList());
        when(cardRepository.countCardsGroupedByChapter())
            .thenReturn(groupedRow(100, 3L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1))
            .thenReturn(groupedRow(100, 2L));
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(List.of(100));
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(List.of(100));

        DashboardResponseDTO result = userProgressService.getDashboard("testuser");

        assertEquals(1, result.getProgress().size());
        DashboardProgressDTO dto = result.getProgress().get(0);
        assertEquals(4, dto.getTotalItems());
        assertEquals(3, dto.getCompletedItems());
        assertEquals(75.0, dto.getProgressPercent());
    }

    @Test
    void getDashboard_lessonWithExistingInProgressStatus_mapsStatusCorrectly() {
        UserLessonProgress progress = new UserLessonProgress();
        progress.setUserId(1);
        progress.setLessonId(10);
        progress.setStatus(ProgressStatus.in_progress);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findAll()).thenReturn(List.of(lesson));
        when(chapterRepository.findAll()).thenReturn(Collections.emptyList());
        when(userLessonProgressRepository.findByUserId(1)).thenReturn(List.of(progress));
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(Collections.emptyList());
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(Collections.emptyList());
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        DashboardResponseDTO result = userProgressService.getDashboard("testuser");

        assertEquals("in_progress", result.getProgress().get(0).getStatus());
    }

    @Test
    void getDashboard_lessonWithCompletedStatus_mapsStatusCorrectly() {
        UserLessonProgress progress = new UserLessonProgress();
        progress.setUserId(1);
        progress.setLessonId(10);
        progress.setStatus(ProgressStatus.completed);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findAll()).thenReturn(List.of(lesson));
        when(chapterRepository.findAll()).thenReturn(Collections.emptyList());
        when(userLessonProgressRepository.findByUserId(1)).thenReturn(List.of(progress));
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(Collections.emptyList());
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(Collections.emptyList());
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        DashboardResponseDTO result = userProgressService.getDashboard("testuser");

        assertEquals("completed", result.getProgress().get(0).getStatus());
    }

    // ===== getLessonProgress =====

    @Test
    void getLessonProgress_userNotFound_throwsAuthException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(AuthException.class, () -> userProgressService.getLessonProgress("ghost", 10));
    }

    @Test
    void getLessonProgress_lessonNotFound_throwsRuntimeException() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userProgressService.getLessonProgress("testuser", 99));
    }

    @Test
    void getLessonProgress_noProgress_returnsNotStartedStatus() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10)).thenReturn(Optional.empty());
        when(chapterRepository.findByLessonId(10)).thenReturn(Collections.emptyList());
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(Collections.emptyList());
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(Collections.emptyList());
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        LessonProgressDTO result = userProgressService.getLessonProgress("testuser", 10);

        assertEquals("not_started", result.getStatus());
        assertEquals(10, result.getLessonId());
        assertTrue(result.getChapters().isEmpty());
        assertEquals(0, result.getTotalItems());
        assertEquals(0, result.getCompletedItems());
        assertEquals(0.0, result.getProgressPercent());
    }

    @Test
    void getLessonProgress_withChapterData_calculatesChapterBreakdownCorrectly() {
        UserLessonProgress progress = new UserLessonProgress();
        progress.setUserId(1);
        progress.setLessonId(10);
        progress.setStatus(ProgressStatus.in_progress);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10)).thenReturn(Optional.of(progress));
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter));
        when(cardRepository.countCardsGroupedByChapter())
            .thenReturn(groupedRow(100, 4L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1))
            .thenReturn(groupedRow(100, 2L));
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(List.of(100));
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        LessonProgressDTO result = userProgressService.getLessonProgress("testuser", 10);

        assertEquals("in_progress", result.getStatus());
        assertEquals(1, result.getChapters().size());

        var chapterDTO = result.getChapters().get(0);
        assertEquals(100, chapterDTO.getChapterId());
        assertEquals("Chapter 1", chapterDTO.getTitle());
        assertEquals(4, chapterDTO.getTotalCards());
        assertEquals(2, chapterDTO.getCompletedCards());
        assertTrue(chapterDTO.isHasQuiz());
        assertEquals(false, chapterDTO.isQuizCompleted());
        // total = 4 cards + 1 quiz = 5; completed = 2 cards + 0 quiz = 2
        assertEquals(5, chapterDTO.getTotalItems());
        assertEquals(2, chapterDTO.getCompletedItems());
        assertEquals(40.0, chapterDTO.getProgressPercent());

        // lesson totals
        assertEquals(5, result.getTotalItems());
        assertEquals(2, result.getCompletedItems());
        assertEquals(40.0, result.getProgressPercent());
    }

    @Test
    void getLessonProgress_chapterWithNoQuiz_countOnlyCards() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10)).thenReturn(Optional.empty());
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter));
        when(cardRepository.countCardsGroupedByChapter())
            .thenReturn(groupedRow(100, 3L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1))
            .thenReturn(groupedRow(100, 3L));
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        LessonProgressDTO result = userProgressService.getLessonProgress("testuser", 10);

        var chapterDTO = result.getChapters().get(0);
        assertEquals(3, chapterDTO.getTotalItems());
        assertEquals(3, chapterDTO.getCompletedItems());
        assertEquals(100.0, chapterDTO.getProgressPercent());
        assertEquals(100.0, result.getProgressPercent());
    }

    @Test
    void getLessonProgress_multipleChapters_aggregatesLessonTotals() {
        Chapter chapter2 = new Chapter();
        chapter2.setId(200);
        chapter2.setTitle("Chapter 2");
        chapter2.setLesson(lesson);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonRepository.findById(10)).thenReturn(Optional.of(lesson));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10)).thenReturn(Optional.empty());
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter, chapter2));
        when(cardRepository.countCardsGroupedByChapter())
            .thenReturn(groupedRows(100, 2L, 200, 3L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1))
            .thenReturn(groupedRows(100, 1L, 200, 2L));
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        LessonProgressDTO result = userProgressService.getLessonProgress("testuser", 10);

        assertEquals(2, result.getChapters().size());
        assertEquals(5, result.getTotalItems());   // 2 + 3
        assertEquals(3, result.getCompletedItems()); // 1 + 2
        assertEquals(60.0, result.getProgressPercent());
    }

    // ===== markCardComplete =====

    @Test
    void markCardComplete_userNotFound_throwsAuthException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(AuthException.class,
                () -> userProgressService.markCardComplete("ghost", 1000));
    }

    @Test
    void markCardComplete_cardNotFound_throwsRuntimeException() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(cardRepository.findById(9999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> userProgressService.markCardComplete("testuser", 9999));
    }

    @Test
    void markCardComplete_callsInsertIgnore() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(cardRepository.findById(1000)).thenReturn(Optional.of(card));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10)).thenReturn(Optional.empty());

        userProgressService.markCardComplete("testuser", 1000);

        verify(userCardProgressRepository).insertIgnore(1, 1000);
    }

    @Test
    void markCardComplete_newLesson_createsLessonProgressRow() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(cardRepository.findById(1000)).thenReturn(Optional.of(card));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10)).thenReturn(Optional.empty());

        userProgressService.markCardComplete("testuser", 1000);

        verify(userLessonProgressRepository).save(any(UserLessonProgress.class));
    }

    @Test
    void markCardComplete_existingLessonProgress_doesNotCreateDuplicateRow() {
        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUserId(1);
        existingProgress.setLessonId(10);
        existingProgress.setStatus(ProgressStatus.in_progress);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(cardRepository.findById(1000)).thenReturn(Optional.of(card));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10))
            .thenReturn(Optional.of(existingProgress));

        userProgressService.markCardComplete("testuser", 1000);

        // save should NOT be called since row already exists
        verify(userLessonProgressRepository, never()).save(any(UserLessonProgress.class));
    }

    @Test
    void markCardComplete_doesNotCheckCompletion() {
        // markCardComplete should NOT call checkAndUpdateLessonCompletion
        // (quiz is always the final gate — completion is checked there)
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(cardRepository.findById(1000)).thenReturn(Optional.of(card));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10)).thenReturn(Optional.empty());

        userProgressService.markCardComplete("testuser", 1000);

        // Should NOT query chapter/quiz data (those are only for completion checks)
        verify(chapterRepository, never()).findByLessonId(any());
    }

    // ===== checkLessonCompletionForChapter =====

    @Test
    void checkLessonCompletionForChapter_userNotFound_throwsAuthException() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(AuthException.class,
                () -> userProgressService.checkLessonCompletionForChapter("ghost", 100));
    }

    @Test
    void checkLessonCompletionForChapter_chapterNotFound_throwsRuntimeException() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(chapterRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> userProgressService.checkLessonCompletionForChapter("testuser", 999));
    }

    @Test
    void checkLessonCompletionForChapter_allCardsAndQuizDone_marksLessonCompleted() {
        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUserId(1);
        existingProgress.setLessonId(10);
        existingProgress.setStatus(ProgressStatus.in_progress);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(chapterRepository.findById(100)).thenReturn(Optional.of(chapter));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10))
            .thenReturn(Optional.of(existingProgress));
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter));
        when(cardRepository.countCardsGroupedByChapter())
            .thenReturn(groupedRow(100, 2L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1))
            .thenReturn(groupedRow(100, 2L)); // all cards done
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(List.of(100));
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(List.of(100)); // quiz done
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        verify(userLessonProgressRepository).save(
            org.mockito.ArgumentMatchers.argThat(p ->
                p.getStatus() == ProgressStatus.completed && p.getCompletedAt() != null
            )
        );
    }

    @Test
    void checkLessonCompletionForChapter_quizPending_doesNotMarkComplete() {
        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUserId(1);
        existingProgress.setLessonId(10);
        existingProgress.setStatus(ProgressStatus.in_progress);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(chapterRepository.findById(100)).thenReturn(Optional.of(chapter));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10))
            .thenReturn(Optional.of(existingProgress));
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter));
        when(cardRepository.countCardsGroupedByChapter())
            .thenReturn(groupedRow(100, 1L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1))
            .thenReturn(groupedRow(100, 1L)); // all cards done
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(List.of(100)); // quiz exists
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList()); // quiz NOT done

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        // Should NOT update to completed — quiz still pending
        verify(userLessonProgressRepository, never()).save(
            org.mockito.ArgumentMatchers.argThat(p ->
                p.getStatus() == ProgressStatus.completed
            )
        );
    }

    // ===== updateStreak (via checkLessonCompletionForChapter) =====

    /** Stubs the minimal "all cards done, no quiz" lesson completion scenario. */
    private void stubLessonCompletion(UserLessonProgress progress) {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(chapterRepository.findById(100)).thenReturn(Optional.of(chapter));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10))
                .thenReturn(Optional.of(progress));
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter));
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(groupedRow(100, 1L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(groupedRow(100, 1L));
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
    }

    private UserLessonProgress inProgressLesson() {
        UserLessonProgress p = new UserLessonProgress();
        p.setUserId(1);
        p.setLessonId(10);
        p.setStatus(ProgressStatus.in_progress);
        return p;
    }

    @Test
    void updateStreak_alreadyCountedToday_userSaveNotCalled() {
        user.setStreak(5);
        user.setLastStreakDate(LocalDate.now());
        stubLessonCompletion(inProgressLesson());

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateStreak_consecutiveDay_incrementsStreak() {
        user.setStreak(3);
        user.setLastStreakDate(LocalDate.now().minusDays(1));
        stubLessonCompletion(inProgressLesson());

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(u ->
                u.getStreak() == 4 && LocalDate.now().equals(u.getLastStreakDate())
        ));
    }

    @Test
    void updateStreak_brokenStreak_resetsToOne() {
        user.setStreak(7);
        user.setLastStreakDate(LocalDate.now().minusDays(3));
        stubLessonCompletion(inProgressLesson());

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(u ->
                u.getStreak() == 1 && LocalDate.now().equals(u.getLastStreakDate())
        ));
    }

    @Test
    void updateStreak_noLastStreakDate_setsStreakToOne() {
        user.setStreak(0);
        user.setLastStreakDate(null);
        stubLessonCompletion(inProgressLesson());

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(u ->
                u.getStreak() == 1 && LocalDate.now().equals(u.getLastStreakDate())
        ));
    }

    @Test
    void updateStreak_lessonAlreadyCompleted_userSaveNotCalled() {
        user.setStreak(3);
        user.setLastStreakDate(LocalDate.now().minusDays(1));

        UserLessonProgress alreadyCompleted = new UserLessonProgress();
        alreadyCompleted.setUserId(1);
        alreadyCompleted.setLessonId(10);
        alreadyCompleted.setStatus(ProgressStatus.completed);

        // Do NOT use stubLessonCompletion — it stubs userRepository.findById which is
        // never reached when the lesson is already completed (updateStreak won't fire)
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(chapterRepository.findById(100)).thenReturn(Optional.of(chapter));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10))
                .thenReturn(Optional.of(alreadyCompleted));
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter));
        when(cardRepository.countCardsGroupedByChapter()).thenReturn(groupedRow(100, 1L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1)).thenReturn(groupedRow(100, 1L));
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void checkLessonCompletionForChapter_cardsNotDone_doesNotMarkComplete() {
        UserLessonProgress existingProgress = new UserLessonProgress();
        existingProgress.setUserId(1);
        existingProgress.setLessonId(10);
        existingProgress.setStatus(ProgressStatus.in_progress);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(chapterRepository.findById(100)).thenReturn(Optional.of(chapter));
        when(userLessonProgressRepository.findByUserIdAndLessonId(1, 10))
            .thenReturn(Optional.of(existingProgress));
        when(chapterRepository.findByLessonId(10)).thenReturn(List.of(chapter));
        when(cardRepository.countCardsGroupedByChapter())
            .thenReturn(groupedRow(100, 3L));
        when(userCardProgressRepository.countCompletedCardsGroupedByChapter(1))
            .thenReturn(groupedRow(100, 1L)); // only 1 of 3 done
        when(quizRepository.findChapterIdsWithQuiz()).thenReturn(Collections.emptyList());
        when(quizResultRepository.findCompletedChapterIdsByUserId(1)).thenReturn(Collections.emptyList());

        userProgressService.checkLessonCompletionForChapter("testuser", 100);

        verify(userLessonProgressRepository, never()).save(
            org.mockito.ArgumentMatchers.argThat(p ->
                p.getStatus() == ProgressStatus.completed
            )
        );
    }
}
