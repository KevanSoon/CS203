-- Users
INSERT INTO user (id, username, email, password, usertype, streak, created_at, last_login, deactivated_at, profile_picture_url, last_streak_date)
VALUES
(1,'alice', 'alice@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 5, NOW(), NOW(), NULL, 'profile-pictures/1/c17e7aa0-806f-4687-96ec-d0bd14939da9.png', NOW()),
(2,'adam', 'adam@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 10, NOW(), NOW(), NULL, 'profile-pictures/2/8dca1b5d-6102-4667-a8b4-6caae485dd5d.png', NOW()),
(3,'ahmad', 'ahmad@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 3, NOW(), NOW(), NULL, 'profile-pictures/3/2f9cda2d-78e1-4efa-b763-a152e7978297.png', NOW()),
(4,'agent', 'agent@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 100, NOW(), NOW(), NULL, 'profile-pictures/4/b8547473-375b-4470-88bf-d651fd31db80.png', NOW()),
(5,'amos', 'amos@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 1, NOW(), NOW(), NULL, 'profile-pictures/5/fb3985db-fd04-4a6a-969a-9679d040198a.png', NOW()),
(6,'alan', 'alan@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 1, NOW(), NOW(), NULL, NULL, NOW()),
(7,'alladin', 'alladin@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 1, NOW(), NOW(), NULL, NULL, NOW()),
(8,'ah tan', 'ah_tan@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 0, NOW(), NOW(), NULL, NULL, NOW()),
(9,'ameen', 'ameen@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 0, NOW(), NOW(), NULL, NULL, NOW()),
(10,'asher', 'asher@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'user', 0, NOW(), NOW(), NULL, NULL, NOW()),
(11,'bob', 'bob@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'admin', NULL, NOW(), NOW(), NULL, NULL, NULL),
(12,'bill', 'bill@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'admin', NULL, NOW(), NOW(), NULL, NULL, NULL),
(13,'ben', 'ben@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'admin', NULL, NOW(), NOW(), NULL, NULL, NULL),
(14,'charlie', 'charlie@example.com', '$2a$12$90muibBVecVXM91atxjQpul1mWyQ/7wgucYzcpcnLSenPqa3AzSd6', 'root', NULL, NOW(), NOW(), NULL, NULL, NULL);

-- Friendship
INSERT INTO friendship (status, user1_id, user2_id)
VALUES
('confirmed', 1, 2),
('confirmed', 1, 3),
('confirmed', 4, 1),
('confirmed', 5, 1),
('pending', 1, 6),
('pending', 1, 7),
('pending', 8, 1),
('pending', 9, 1),
('confirmed', 2, 3),
('confirmed', 2, 4),
('confirmed', 2, 5),
('confirmed', 2, 6);

-- Tags
INSERT INTO tag (name, created_at)
VALUES
('Gen-Alpha', NOW()),
('Intermediate', NOW()),
('Child-Friendly', NOW()),
('Skibidi', NOW()),
('Boomer Curated', NOW()),
('Highly Advanced Lesson for Skibidi Sigma', NOW()),
('67', NOW()),
('Tung Tung Sahur', NOW()),
('Sigma', NOW()),
('Gaming', NOW()),
('Slang for Beginners', NOW()),
('Culture', NOW()),
('Multiplayer Games', NOW()),
('Advanced', NOW());

-- Lessons
INSERT INTO lesson (id, title, description, status, created_at, deleted_at, created_by_id, lesson_picture_url)
VALUES
(1,'Intro to Gen-Alpha', 'Learn about Gen-Alpha slang and how deeply it can impact your daily life', 'approved', NOW(), NULL, 11, 'lesson-pictures/3616e872-c30e-4e00-aa55-c38e65f2ff79.png'),
(2,'The Sigma Mindset', 'How to be the most Alpha Sigma around', 'approved', NOW(), NULL, 11, NULL),
(3,'The Chill & Reactive Personality', 'Learn slang used by laid-back, observant, and reactive personalities, people who comment on situations rather than lead them.', 'approved', NOW(), NULL, 12, 'lesson-pictures/9faaa717-c892-4437-8e4f-2334c1df2605.jpg'),
(4,'Competitive & Toxic Gamer Personality', 'Learn slang used in competitive gaming environments, including teamwork, trash talk, and high-pressure situations.', 'approved', NOW(), NULL, 12, 'lesson-pictures/d1a56879-62a9-4e1f-85d2-971324c922f9.png'),
(5,'Gaming Slang & Culture', 'Learn slang commonly used in gaming communities, especially in competitive and online multiplayer environments.', 'approved', NOW(), NULL, 12, NULL),
(6,'Streaming & Online Gamer Personality', 'Learn slang used in livestreams, gaming communities, and chat culture (e.g. Twitch, Discord, TikTok streams).', 'approved', NOW(), NULL, 12, NULL),
(7,'Old Defunct Slang Lesson', 'This lesson is about 1990 Slangs', 'approved', NOW(), NOW(), 12, NULL), -- Deleted Lesson
(8,'NSFW Lesson HaHa', 'I am a bad guy', 'suspended', NOW(), NULL, 13, NULL), -- Suspended Lesson
(9,'Let\'s learn about Trump', 'I am a bad guy', 'suspended', NOW(), NOW(), 13, NULL), -- Deleted and Suspended Lesson
(10,'NSFW Content Here', 'I am a bad guy', 'approved', NOW(), NULL, 13, NULL), -- Lesson to be Reported later on
(11,'F*** C**** D***', 'K****** C****C***B* P*****', 'approved', NOW(), NULL, 13, NULL), -- Lesson to be Reported later on
-- Lesson Applications
(12,'Common Gen-Alpha Phrases', 'Learn how to be Skibidi with the younger generation like never before', 'pending', NOW(), NULL, 11, NULL),
(13,'Time to be Sigma', 'Learn how to be Sigma with the younger generation like never before', 'saved', NOW(), NULL, 11, NULL),
(14,'Failure of a Lesson', 'This lesson fails =)', 'rejected', NOW(), NULL, 11, NULL), -- Rejected Application
(15,'Failure Content', 'This content fails =)', 'rejected', NOW(), NULL, 11, NULL); -- Rejected Application

-- Chapters
INSERT INTO chapter (id, title, description, lesson_id, created_at) VALUES
(1,'Chapter 1', 'Beginner Knowledge of Gen-Alpha', 1, NOW()),
(2,'Chapter 2', 'Intermediate Knowledge of Gen-Alpha', 1, NOW()),
(3,'Chapter 3', 'Applied uses of Gen-Alpha', 1, NOW()),
(4,'Beginners of the Sigma', 'Beginner\'s guide to be Sigma', 2, NOW()),
(5,'One with the Sigma', 'To be or not to be', 2, NOW()),
(6,'Lowkey Vibes', NULL, 3, NOW()),
(7,'Ranked Grind Mentality', '', 4, NOW()),
(8,'Gamer Talk', NULL, 5, NOW()),
(9,'Chat Is Watching', NULL, 6, NOW()),
(10,'1990s Lao Jiao Talk', 'How to be the most beng', 7, NOW()),
(11,'HAHA F** C** D*', 'Lorem Ipsum talk talk', 8, NOW()),
(12,'Mr Donald 101', 'The rise of the orange sun', 9, NOW()),
(13,'KNNBCCBWTFSMLJDLLM', 'KNNBCCBWTFSMLJDLLM', 10, NOW()),
(14,'***', '***', 11, NOW()),
(15,'Short Phrases', 'Learn short common phrases frequently used', 12, NOW()),
(16,'Long Phrases', 'Learn more advanced longer phrases', 12, NOW()),
(17,'Some Skibidi', 'More Skibidi', 13, NOW()),
(18,'A', 'A', 14, NOW()),
(19,'A', 'B', 15, NOW());


INSERT INTO card (id, front, back, display_order, chapter_id, created_at)
VALUES
-- Lesson 1
(1, 'What does “skibidi” mean?', 'A playful nonsense term often used humorously online.', 1, 1, NOW()),
(2, 'What does “rizz” mean?', 'It means charm or flirting skills.', 2, 1, NOW()),
(3, 'What does “cook” mean (Gen Alpha version)?', 'It means someone is doing something extremely well.', 3, 1, NOW()),
(4, 'What does “slay” mean?', 'It means to do something really well or look amazing.', 4, 1, NOW()),
(5, 'What does “bet” mean?', 'It means “okay” or “sure."', 5, 1, NOW()),
(6, 'What does “cap” mean?', 'It means a lie.', 6, 1, NOW()),
(7, 'What does “you ate” mean?', 'It means you did an amazing job.', 1, 2, NOW()),
(8, 'What does “get real” mean?', 'It’s said when someone is being unrealistic or dramatic.', 2, 2, NOW()),
(9, 'What does “ratioed” mean?', 'When someone gets more negative responses or replies than likes online.', 3, 2, NOW()),
(10, 'What does “rizz god arc” mean?', 'A time period when someone’s flirting skills suddenly become super strong.', 4, 2, NOW()),
(11, 'How to use "cook"', 'Tom said to his colleagues. Let me work in silence, I\'m cooking.', 1, 3, NOW()),
(12, 'How to use "cap"', '"I actually am best friends with Iswaran" - Tom\n "That\'s cap" - Tim', 2, 3, NOW()),
(13, 'How to use "rizz"', 'Damn bro, you rizzed her up', 3, 3, NOW()),
-- Lesson 2
(14, 'What does “sigma grindset” mean?', 'A mindset focused on self-improvement and independence.', 1, 4, NOW()),
(15, 'What does “main character energy” mean?', 'Acting confident like you’re the star of the story.', 2, 4, NOW()),
(16, 'What does “soft launch” mean?', 'Posting a subtle hint about something new (like a relationship) without fully announcing it.', 3, 4, NOW()),
(17, 'What does “hard launch” mean?', 'Fully revealing something big, like posting a full photo of your partner.', 4, 4, NOW()),
(18, 'What is “Flex”?', 'Showing off.', 1, 5, NOW()),
(19, 'What does “No Cap” mean?', 'No lie / serious.', 2, 5, NOW()),
(20, 'What does “Delulu” mean?', 'Delusional but in a funny way.', 3, 5, NOW()),
-- Lesson 3
(21, 'Meaning of Mid / Average', 'not impressive', 1, 6, NOW()),
(22, 'Meaning of Sus', 'Suspicious', 2, 6, NOW()),
(23, 'Meaning of Lowkey', 'secretly / slightly doing something', 3, 6, NOW()),
(24, 'No Cap', 'No lie / serious', 4, 6, NOW()),
(25, 'Poggers', 'Excitement or hype', 5, 6, NOW()),
-- Lesson 4
(26, 'Tryhard', 'Someone who is overly serious or sweating the game', 1, 7, NOW()),
(27, 'Tilted', 'Frustrated and playing worse because of it', 2, 7, NOW()),
(28, 'Throwing', 'Intentionally or carelessly losing', 3, 7, NOW()),
-- Lesson 5
(29, 'GG', 'Said at the end of a match Good Game', 1, 8, NOW()),
(30, 'Clutch', 'Winning in a critical moment', 2, 8, NOW()),
(31, 'EZ', 'Used when something is easy (can be toxic)', 3, 8, NOW()),
(32, 'Noob', 'Beginner / inexperienced player', 4, 8, NOW()),
(33, 'Sweaty', 'Very skilled but playing intensely', 5, 8, NOW()),
-- Lesson 6
(34, 'Spam', 'Repeating messages in chat', 1, 9 , NOW()),
(35, 'Clip', 'Something worth saving/highlighting', 2, 9, NOW()),
(36, 'Stream Sniping', 'Watching a streamer’s stream to gain advantage', 3, 9, NOW()),
-- Lesson 7
(37, 'Simi Lan', 'What in the world are you talking about', 1, 10, NOW()),
-- Lesson 8
(38, 'M*therF****', 'What The F***', 1, 11, NOW()),
-- Lesson 9
(39, 'M*therF****', 'What The F***', 1, 12, NOW()),
-- Lesson 10
(40, 'M*therF****', 'What The F***', 1, 13, NOW()),
-- Lesson 11
(41, 'M*therF****', 'What The F***', 1, 14, NOW()),
-- Lesson Application 12
(42, 'Damn, stop flexing bruh', 'Come on man, stop showing off', 1, 15, NOW()),
(43, 'You gotta start rizzing her up', 'You have to try harder to flirt with her', 2, 15, NOW()),
(44, 'Why you acting like you got Main Character Energy', 'why are you acting like the star of the show', 3, 15, NOW()),
(45, 'Damn, stop flexing bruh', 'Come on man, stop showing off', 4, 15, NOW()),
(46, 'Wow, you ate (and left no crumbs)', 'you did it perfectly', 1, 16, NOW()),
(47, 'No cap, I can jump 2.5m', 'Im not lying, I can jump 2.5m', 2, 16, NOW()),
(48, 'Stop acting like an NPC', 'Stop acting basic or scripted', 3, 16, NOW()),
-- Lesson Application 13
(49, 'Skibidi', 'Absurd / meme-like / chaotic', 1, 17, NOW()),
-- Lesson Application 14
(50, 'A', 'A', 1, 18, NOW()),
-- Lesson Application 15
(51, 'A', 'A', 1, 19, NOW());

-- Quiz
INSERT INTO quiz (id, title, question, quiz_type, options, correct_answer, created_at, chapter_id)
VALUES
(1, 'Chapter 1 Quiz', 'Which of these is commonly used by Gen-Alpha?', 'mcq', '{"A":"Wa Lan Eh","B":"67","C":"76","D":"69"}', 'B', NOW(), 1),
(2, 'Chapter 2 Quiz', 'True or False: Sigma mindset is all about leadership and dominance.', 'true_false', '{"A":"True","B":"False"}', 'A', NOW(), 2),
(3, 'Chapter 3 Quiz', 'Fill in the blank: Applying Gen-Alpha slang in daily life can ___ communication.', 'fill_blank', '{"A":"enhance","B":"confuse","C":"ignore","D":"slow"}', 'A', NOW(), 3),
(4, 'Beginners of the Sigma Quiz', 'Which of the following is a beginner step to adopting the Sigma mindset?', 'mcq', '{"A":"Be Alpha online","B":"Observe first","C":"Talk loudly","D":"Ignore rules"}', 'B', NOW(), 4),
(5, 'One with the Sigma Quiz', 'True or False: Being "One with Sigma" means following social norms strictly.', 'true_false', '{"A":"True","B":"False"}', 'B', NOW(), 5),
(6, 'Lowkey Vibes Quiz', 'Fill in the blank: People with lowkey vibes usually ___ their reactions.', 'fill_blank', '{"A":"overreact","B":"underplay","C":"dominate","D":"ignore"}', 'B', NOW(), 6),
(7, 'Ranked Grind Mentality Quiz', 'Which phrase is often used in competitive gaming environments?', 'mcq', '{"A":"GG","B":"LOL","C":"BRB","D":"IDK"}', 'A', NOW(), 7),
(8, 'Gamer Talk Quiz', 'True or False: Online multiplayer slang often changes daily.', 'true_false', '{"A":"True","B":"False"}', 'A', NOW(), 8),
(9, 'Chat Is Watching Quiz', 'Fill in the blank: Streamers often interact with ___ to maintain engagement.', 'fill_blank', '{"A":"audience","B":"bots","C":"moderators","D":"admins"}', 'A', NOW(), 9),
(10, '1990s Lao Jiao Talk Quiz', 'Which of these was a popular slang in the 1990s?', 'mcq', '{"A":"Cool beans","B":"Skibidi","C":"Flex","D":"Yeet"}', 'A', NOW(), 10),
(11, 'HAHA F** C** D* Quiz', 'True or False: Some NSFW lessons can be reported but still exist for study purposes.', 'true_false', '{"A":"True","B":"False"}', 'A', NOW(), 11),
(12, 'Mr Donald 101 Quiz', 'Fill in the blank: Donald Trump is often referred to as "___ sun" in memes.', 'fill_blank', '{"A":"orange","B":"rising","C":"setting","D":"golden"}', 'A', NOW(), 12),
(13, 'KNNBCCBWTFSMLJDLLM Quiz', 'Which random acronym matches the lesson content?', 'mcq', '{"A":"KNNBCCBWTFSMLJDLLM","B":"LOL","C":"IDK","D":"BRB"}', 'A', NOW(), 13),
(14, '*** Quiz', 'True or False: This lesson has a title with only symbols.', 'true_false', '{"A":"True","B":"False"}', 'A', NOW(), 14),
(15, 'Short Phrases Quiz', 'Fill in the blank: "Hi" and "OK" are examples of ___ used frequently by Gen-Alpha.', 'fill_blank', '{"A":"short phrases","B":"long phrases","C":"slang","D":"acronyms"}', 'A', NOW(), 15),
(16, 'Long Phrases Quiz', 'Which is an example of a longer phrase commonly used online?', 'mcq', '{"A":"What is up?","B":"LOL","C":"Yeet","D":"GG"}', 'A', NOW(), 16),
(17, 'Some Skibidi Quiz', 'True or False: Skibidi is a phrase used to connect with younger generations.', 'true_false', '{"A":"True","B":"False"}', 'A', NOW(), 17),
(18, 'A', 'Fill in the blank: "__".', 'fill_blank', '{"A":"A","B":"B","C":"C","D":"D"}', 'A', NOW(), 18),
(19, 'A', 'True or False:', 'true_false', '{"A":"True","B":"False"}', 'A', NOW(), 19);

-- User Card Progress
INSERT INTO user_card_progress (user_id, card_id, completed_at)
VALUES
(1,14,NOW()),(1,15,NOW()),(1,16,NOW()),(1,17,NOW()),
(1,21,NOW()),(1,22,NOW()),(1,37,NOW()),(1,39,NOW()),

-- User 1 completed Lesson 4 (cards 26–28)
(1, 26, NOW()), (1, 27, NOW()), (1, 28, NOW()),

-- User 2 completed Lesson 1 (cards 1–13)
(2, 1, NOW()), (2, 2, NOW()), (2, 3, NOW()), (2, 4, NOW()), (2, 5, NOW()), (2, 6, NOW()),
(2, 7, NOW()), (2, 8, NOW()), (2, 9, NOW()), (2, 10, NOW()), (2, 11, NOW()), (2, 12, NOW()), (2, 13, NOW()),
-- User 2 completed Lesson 2 (cards 14–17)
(2, 14, NOW()), (2, 15, NOW()), (2, 16, NOW()), (2, 17, NOW()),
(2,23,NOW()),

-- User 3 completed Lesson 1 (cards 1–13)
(3, 1, NOW()), (3, 2, NOW()), (3, 3, NOW()), (3, 4, NOW()), (3, 5, NOW()), (3, 6, NOW()),
(3, 7, NOW()), (3, 8, NOW()), (3, 9, NOW()), (3, 10, NOW()), (3, 11, NOW()), (3, 12, NOW()), (3, 13, NOW()),
-- User 3 completed Lesson 2 (cards 14–17)
(3, 14, NOW()), (3, 15, NOW()), (3, 16, NOW()), (3, 17, NOW()),
-- User 3 completed Lesson 5 (cards 29–33)
(3, 29, NOW()), (3, 30, NOW()), (3, 31, NOW()), (3, 32, NOW()), (3, 33, NOW()),

-- User 4 completed Lesson 1 (cards 1–13)
(4, 1, NOW()), (4, 2, NOW()), (4, 3, NOW()), (4, 4, NOW()), (4, 5, NOW()), (4, 6, NOW()),
(4, 7, NOW()), (4, 8, NOW()), (4, 9, NOW()), (4, 10, NOW()), (4, 11, NOW()), (4, 12, NOW()), (4, 13, NOW()),
-- User 4 completed Lesson 2 (cards 14–17)
(4, 14, NOW()), (4, 15, NOW()), (4, 16, NOW()), (4, 17, NOW()),

-- User 5 completed Lesson 2 (cards 14–17)
(5, 14, NOW()), (5, 15, NOW()), (5, 16, NOW()), (5, 17, NOW()),
-- User 5 completed Lesson 3 (cards 21–25)
(5, 21, NOW()), (5, 22, NOW()), (5, 23, NOW()), (5, 24, NOW()), (5, 25, NOW()),

-- User 6 completed Lesson 3 (cards 21–25)
(6, 21, NOW()), (6, 22, NOW()), (6, 23, NOW()), (6, 24, NOW()), (6, 25, NOW()),
-- User 6 completed Lesson 5 (cards 29–33)
(6, 29, NOW()), (6, 30, NOW()), (6, 31, NOW()), (6, 32, NOW()), (6, 33, NOW()),

-- User 7 completed Lesson 1 (cards 1–13)
(7, 1, NOW()), (7, 2, NOW()), (7, 3, NOW()), (7, 4, NOW()), (7, 5, NOW()), (7, 6, NOW()),
(7, 7, NOW()), (7, 8, NOW()), (7, 9, NOW()), (7, 10, NOW()), (7, 11, NOW()), (7, 12, NOW()), (7, 13, NOW()),
-- User 7 completed Lesson 3 (cards 21–25)
(7, 21, NOW()), (7, 22, NOW()), (7, 23, NOW()), (7, 24, NOW()), (7, 25, NOW()),
-- User 7 completed Lesson 4 (cards 26–28)
(7, 26, NOW()), (7, 27, NOW()), (7, 28, NOW()),
-- User 7 completed Lesson 5 (cards 29–33)
(7, 29, NOW()), (7, 30, NOW()), (7, 31, NOW()), (7, 32, NOW()), (7, 33, NOW()),

-- User 8 completed Lesson 3 (cards 21–25)
(8, 21, NOW()), (8, 22, NOW()), (8, 23, NOW()), (8, 24, NOW()), (8, 25, NOW()),

-- User 9 completed Lesson 3 (cards 21–25)
(9, 21, NOW()), (9, 22, NOW()), (9, 23, NOW()), (9, 24, NOW()), (9, 25, NOW()),
-- User 9 completed Lesson 4 (cards 26–28)
(9, 26, NOW()), (9, 27, NOW()), (9, 28, NOW()),

-- User 10 completed Lesson 3 (cards 21–25)
(10, 21, NOW()), (10, 22, NOW()), (10, 23, NOW()), (10, 24, NOW()), (10, 25, NOW()),
-- User 10 completed Lesson 4 (cards 26–28)
(10, 26, NOW()), (10, 27, NOW()), (10, 28, NOW()),
-- User 10 completed Lesson 5 (cards 29–33)
(10, 29, NOW()), (10, 30, NOW()), (10, 31, NOW()), (10, 32, NOW()), (10, 33, NOW());


INSERT INTO user_lesson_progress (user_id, lesson_id, status, started_at, completed_at, last_accessed_at)
VALUES
(1, 2, 'in_progress', NOW(), NOW(), NOW()),
(1, 3, 'in_progress', NOW(), NOW(), NOW()),
(1, 4, 'completed', NOW(), NOW(), NOW()),
(1, 7, 'in_progress', NOW(), NOW(), NOW()),
(1, 9, 'in_progress', NOW(), NOW(), NOW()),
(2, 1, 'completed', NOW(), NOW(), NOW()),
(2, 2, 'completed', NOW(), NOW(), NOW()),
(2, 3, 'in_progress', NOW(), NOW(), NOW()),
(3, 1, 'completed', NOW(), NOW(), NOW()),
(3, 2, 'completed', NOW(), NOW(), NOW()),
(3, 5, 'completed', NOW(), NOW(), NOW()),
(4, 1, 'completed', NOW(), NOW(), NOW()),
(4, 2, 'completed', NOW(), NOW(), NOW()),
(5, 2, 'completed', NOW(), NOW(), NOW()),
(5, 3, 'completed', NOW(), NOW(), NOW()),
(6, 3, 'completed', NOW(), NOW(), NOW()),
(6, 5, 'completed', NOW(), NOW(), NOW()),
(7, 1, 'completed', NOW(), NOW(), NOW()),
(7, 3, 'completed', NOW(), NOW(), NOW()),
(7, 4, 'completed', NOW(), NOW(), NOW()),
(7, 5, 'completed', NOW(), NOW(), NOW()),
(8, 3, 'completed', NOW(), NOW(), NOW()),
(9, 3, 'completed', NOW(), NOW(), NOW()),
(9, 4, 'completed', NOW(), NOW(), NOW()),
(10, 3, 'completed', NOW(), NOW(), NOW()),
(10, 4, 'completed', NOW(), NOW(), NOW()),
(10, 5, 'completed', NOW(), NOW(), NOW());

-- Quiz Result
INSERT INTO quiz_result (user_id, chapter_id, score, taken_at, attempts)
VALUES
(1, 4, 100, NOW(), 1),
-- User 1, Lesson 4 (Chapter 7 → Quiz 7)
(1, 7, 100, NOW(), 1),

-- User 2, Lesson 1 (Chapters 1,2,3 → Quizzes 1,2,3)
(2, 1, 100, NOW(), 1),
(2, 2, 100, NOW(), 1),
(2, 3, 100, NOW(), 1),
-- User 2, Lesson 2 (Chapters 4,5 → Quizzes 4,5)
(2, 4, 100, NOW(), 1),
(2, 5, 100, NOW(), 1),

-- User 3, Lesson 1
(3, 1, 100, NOW(), 1),
(3, 2, 100, NOW(), 1),
(3, 3, 100, NOW(), 1),
-- User 3, Lesson 2
(3, 4, 100, NOW(), 1),
(3, 5, 100, NOW(), 1),
-- User 3, Lesson 5
(3, 8, 100, NOW(), 1),

-- User 4, Lesson 1
(4, 1, 100, NOW(), 1),
(4, 2, 100, NOW(), 1),
(4, 3, 100, NOW(), 1),
-- User 4, Lesson 2
(4, 4, 100, NOW(), 1),

-- User 5, Lesson 2
(5, 4, 100, NOW(), 1),
(5, 5, 100, NOW(), 1),
-- User 5, Lesson 3
(5, 6, 100, NOW(), 1),

-- User 6, Lesson 3
(6, 6, 100, NOW(), 1),
-- User 6, Lesson 5
(6, 8, 100, NOW(), 1),

-- User 7, Lesson 1
(7, 1, 100, NOW(), 1),
(7, 2, 100, NOW(), 1),
(7, 3, 100, NOW(), 1),
-- User 7, Lesson 3
(7, 6, 100, NOW(), 1),
-- User 7, Lesson 4
(7, 7, 100, NOW(), 1),
-- User 7, Lesson 5
(7, 8, 100, NOW(), 1),

-- User 8, Lesson 3
(8, 6, 100, NOW(), 1),

-- User 9, Lesson 3
(9, 6, 100, NOW(), 1),
-- User 9, Lesson 4
(9, 7, 100, NOW(), 1),

-- User 10, Lesson 3
(10, 6, 100, NOW(), 1),
-- User 10, Lesson 4
(10, 7, 100, NOW(), 1),
-- User 10, Lesson 5
(10, 8, 100, NOW(), 1);

-- Report
INSERT INTO report (title, description, status, type, remarks, reported_by, lesson_id, chapter_id, created_at, updated_at, last_update)
VALUES
('Lesson is inappropriate', 'There is vulgar content here', 'reported', 'high', NULL, 1, 10, 1, NOW(), NOW(), NULL),
('Vulgar Lesson', 'Disgusting lesson content', 'reported', 'critical', NULL, 2, 10, 2, NOW(), NOW(), NULL),
('Vulgar', 'Disgusting content', 'unresolved', 'high', 'This is fine', 3, 10, NULL, NOW(), NOW(), 'admin'),
('Not appropriate for people', 'Disgusting', 'reported', 'high', NULL, 1, 11, NULL, NOW(), NOW(), NULL),
('Out of Date Content', 'Useless content', 'closed', 'low', NULL, 1, 7, NULL, NOW(), NOW(), 'admin'),
('NSFW Content', 'NSFW content', 'closed', 'high', NULL, 1, 8, NULL, NOW(), NOW(), 'root'),
('Highly Inappropriate', 'Disgusting content', 'closed', 'critical', 'Lesson closed by Lesson Admin', 1, 9, NULL, NOW(), NOW(), 'admin');


-- Lesson Tagging
INSERT INTO lesson_tagging (tag_name, lesson_id, deleted_at)
VALUES
('Slang for Beginners', 1, NULL),
('Culture', 1, NULL),
('67', 1, NULL),
('Gen-Alpha', 2, NULL),
('Highly Advanced Lesson for Skibidi Sigma', 2, NULL),
('Advanced', 2, NULL),
('Skibidi', 2, NULL),
('Sigma', 2, NULL),
('Gaming', 3, NULL),
('Multiplayer Games', 3, NULL),
('Child-Friendly', 3, NULL),
('Gaming', 4, NULL),
('Multiplayer Games', 4, NULL),
('Gaming', 5, NULL),
('Multiplayer Games', 5, NULL),
('Child-Friendly', 5, NULL),
('Gaming', 6, NULL),
('Multiplayer Games', 6, NULL),
('Slang for Beginners', 7, NULL),
('Boomer Curated', 7, NULL),
('Slang for Beginners', 8, NULL),
('Boomer Curated', 8, NULL),
('Slang for Beginners', 9, NULL),
('Boomer Curated', 9, NULL),
('Slang for Beginners', 10, NULL),
('Boomer Curated', 10, NULL),
-- Lesson Application Tagging
('Highly Advanced Lesson for Skibidi Sigma', 12, NULL),
('Skibidi', 12, NULL),
('Gen-Alpha', 12, NULL),
('Slang for Beginners', 12, NULL),
('Culture', 12, NULL),
('Child-Friendly', 12, NULL),
('Slang for Beginners', 13, NULL),
('Highly Advanced Lesson for Skibidi Sigma', 13, NULL),
('Sigma', 13, NULL);

-- Review
INSERT INTO review (rating, feedback, reviewed_by, lesson_id, created_at)
VALUES
(5, 'Loved the Gen-Alpha examples!', 2, 1, NOW()),
(5, 'Very engaging lesson on Gen-Alpha slang.', 3, 1, NOW()),
(3, 'Interesting, but a bit fast-paced.', 7, 1, NOW()),
(3, 'Solid intro but some parts were confusing.', 2, 2, NOW()),
(4, 'Helpful for understanding Sigma mindset.', 3, 2, NOW()),
(4, 'Well-structured lesson.', 4, 2, NOW()),
(4, 'Enjoyed the Sigma tips.', 5, 2, NOW()),
(1, 'Too basic, not much new info.', 5, 3, NOW()),
(4, 'Learned some useful Chill personality terms.', 6, 3, NOW()),
(3, 'Okay, but examples were unclear.', 7, 3, NOW()),
(5, 'Perfect examples for reactive personalities!', 8, 3, NOW()),
(3, 'Good, but needed more context.', 9, 3, NOW()),
(1, 'Not helpful, expected more depth.', 10, 3, NOW()),
(5, 'Loved the Sigma beginner guide!', 2, 4, NOW()),
(3, 'Helpful, but could be more detailed.', 9, 4, NOW()),
(1, 'Too short, lacked examples.', 10, 4, NOW()),
(2, 'Average lesson, some new insights.', 3, 5, NOW()),
(3, 'Decent lesson on Sigma application.', 6, 5, NOW()),
(3, 'Okay, needs more practical examples.', 7, 5, NOW()),
(4, 'Good coverage, enjoyed the examples.', 10, 5, NOW());