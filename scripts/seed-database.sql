-- Seed data for the church website database

-- Insert daily verses
INSERT INTO DailyVerse (id, verse, reference, date) VALUES 
('verse1', 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.', 'Jeremiah 29:11', '2024-01-15'),
('verse2', 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'Proverbs 3:5-6', '2024-01-16'),
('verse3', 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', 'Romans 8:28', '2024-01-17');

-- Insert doctrines
INSERT INTO Doctrine (id, title, content, category, "order") VALUES 
('doctrine1', 'The Trinity', 'We believe in one God, eternally existent in three persons: Father, Son, and Holy Spirit. Each person of the Trinity is fully God, yet there is only one God.', 'Core Beliefs', 1),
('doctrine2', 'Salvation by Grace', 'We believe that salvation is by grace alone, through faith alone, in Christ alone. It is not by works, but by the free gift of God through Jesus Christ.', 'Core Beliefs', 2),
('doctrine3', 'The Authority of Scripture', 'We believe the Bible is the inspired, infallible, and authoritative Word of God. It is our final authority for faith and practice.', 'Core Beliefs', 3),
('doctrine4', 'The Second Coming', 'We believe in the personal, visible, and glorious return of Jesus Christ to establish His kingdom on earth.', 'Prophecy', 4),
('doctrine5', 'Baptism by Immersion', 'We believe in baptism by full immersion as a public declaration of faith and identification with Christ in His death and resurrection.', 'Ordinances', 5);

-- Insert sample blog posts
INSERT INTO BlogPost (id, title, slug, content, excerpt, published, category, authorId) VALUES 
('blog1', 'Walking in Faith Daily', 'walking-in-faith-daily', 'Faith is not just a Sunday experience, but a daily walk with God. In this devotional, we explore how to maintain a strong relationship with Christ throughout the week...', 'Discover how to make faith a daily practice in your life.', true, 'DEVOTIONAL', 'admin1'),
('blog2', 'The Power of Prayer', 'the-power-of-prayer', 'Prayer is our direct line of communication with God. It is through prayer that we find strength, guidance, and peace in our daily lives...', 'Learn about the transformative power of prayer in your spiritual journey.', true, 'DEVOTIONAL', 'admin1'),
('blog3', 'Serving Others with Love', 'serving-others-with-love', 'Jesus taught us that the greatest among us are those who serve. In this article, we explore practical ways to serve our community and show God''s love...', 'Practical ways to serve your community and demonstrate Christ''s love.', true, 'ARTICLE', 'admin1');

-- Insert sample events
INSERT INTO Event (id, title, description, date, time, location, authorId) VALUES 
('event1', 'Youth Bible Study', 'Join us for an interactive Bible study focused on living out faith in daily life.', '2024-01-15 19:00:00', '7:00 PM', 'Youth Room', 'admin1'),
('event2', 'Community Outreach', 'Serve our community by providing meals and care packages to those in need.', '2024-01-20 09:00:00', '9:00 AM', 'Downtown Park', 'admin1'),
('event3', 'Family Movie Night', 'Bring the whole family for a fun evening with popcorn, games, and a great movie.', '2024-01-25 18:30:00', '6:30 PM', 'Fellowship Hall', 'admin1');

-- Insert Sabbath schedule
INSERT INTO SabbathSchedule (id, date, theme, speaker, scripture) VALUES 
('sabbath1', '2024-01-13', 'Walking in God''s Grace', 'Pastor John Smith', 'Ephesians 2:8-9'),
('sabbath2', '2024-01-20', 'The Power of Faith', 'Elder Mary Johnson', 'Hebrews 11:1'),
('sabbath3', '2024-01-27', 'Love in Action', 'Pastor John Smith', '1 John 4:7-8');

-- Insert ministries
INSERT INTO Ministry (id, name, description, leader, meetingTime, location) VALUES 
('ministry1', 'Youth Ministry', 'Empowering young people to grow in faith and leadership through Bible study, fellowship, and service.', 'Sarah Wilson', 'Fridays 7:00 PM', 'Youth Room'),
('ministry2', 'Children''s Ministry', 'Providing a safe and fun environment for children to learn about God''s love through age-appropriate activities.', 'Lisa Brown', 'Sabbath 10:00 AM', 'Children''s Wing'),
('ministry3', 'Music Ministry', 'Leading worship through music and song, glorifying God with our voices and instruments.', 'David Martinez', 'Wednesdays 7:00 PM', 'Sanctuary'),
('ministry4', 'Outreach Ministry', 'Serving our community through various outreach programs and mission work.', 'Robert Davis', 'Monthly Planning', 'Conference Room');

-- Insert sample testimonials
INSERT INTO Testimonial (id, name, content, published, featured) VALUES 
('testimonial1', 'Jennifer Adams', 'Grace Community Church has been such a blessing to my family. The love and support we''ve received here has helped us through difficult times and celebrated with us in joyful moments.', true, true),
('testimonial2', 'Michael Thompson', 'I found my purpose in life through the ministries at Grace Community. The youth program helped shape me into the man I am today, and I''m grateful for the mentorship I received.', true, false),
('testimonial3', 'Susan Rodriguez', 'The Bible studies here have deepened my understanding of God''s word. I''ve grown so much spiritually since joining this wonderful church family.', true, true);

-- Create admin user (password should be hashed in real implementation)
INSERT INTO User (id, email, password, name, role) VALUES 
('admin1', 'admin@gracecommunity.org', '$2a$10$example.hash.here', 'Admin User', 'ADMIN');
