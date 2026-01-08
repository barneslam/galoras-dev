
-- Drop the foreign key constraint on coaches.user_id to allow sample data
ALTER TABLE coaches DROP CONSTRAINT IF EXISTS coaches_user_id_fkey;

-- Insert sample coaches
INSERT INTO coaches (
  user_id, display_name, headline, bio, avatar_url, 
  specialties, coaching_style, experience_years, hourly_rate,
  location, timezone, languages, status, is_featured, 
  rating, total_sessions
)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'James Mitchell', 
   'Executive Leadership & Team Dynamics Coach',
   'Over 15 years helping leaders unlock their potential. Former Fortune 500 executive turned coach, specializing in helping ambitious professionals navigate complex organizational challenges.',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
   ARRAY['Executive Coaching', 'Leadership Development', 'Team Dynamics'],
   'Direct and results-oriented with emphasis on accountability',
   15, 250, 'New York, USA', 'EST', 
   ARRAY['English', 'Spanish'], 'approved', true, 4.9, 450),
  
  ('00000000-0000-0000-0000-000000000002'::uuid, 'Sarah Chen',
   'Career Transition & Personal Branding Expert',
   'Helped 500+ professionals successfully pivot their careers. Former tech recruiter with deep understanding of what makes candidates stand out.',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
   ARRAY['Career Coaching', 'Personal Branding', 'Interview Preparation'],
   'Supportive and strategic with focus on authentic self-presentation',
   12, 200, 'San Francisco, USA', 'PST',
   ARRAY['English', 'Mandarin'], 'approved', true, 4.8, 320),
  
  ('00000000-0000-0000-0000-000000000003'::uuid, 'Michael Thompson',
   'Peak Performance & Mindset Coach',
   'Sports psychologist turned executive coach. Specializes in helping high-achievers break through mental barriers and perform at their best.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
   ARRAY['Performance Coaching', 'Mindset Training', 'Stress Management'],
   'Evidence-based techniques combining psychology and practical strategies',
   10, 175, 'Los Angeles, USA', 'PST',
   ARRAY['English'], 'approved', false, 4.7, 210),
  
  ('00000000-0000-0000-0000-000000000004'::uuid, 'Elena Rodriguez',
   'Wellness & Work-Life Integration Coach',
   'Certified wellness coach helping busy professionals create sustainable balance. Believes success should not come at the cost of health and relationships.',
   'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face',
   ARRAY['Wellness Coaching', 'Work-Life Balance', 'Burnout Prevention'],
   'Holistic approach integrating physical, mental, and emotional well-being',
   8, 180, 'Miami, USA', 'EST',
   ARRAY['English', 'Spanish', 'Portuguese'], 'approved', false, 4.8, 185),
  
  ('00000000-0000-0000-0000-000000000005'::uuid, 'David Park',
   'Business Strategy & Entrepreneurship Coach',
   'Serial entrepreneur with 3 successful exits. Now dedicated to helping founders and business leaders scale their ventures strategically.',
   'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
   ARRAY['Business Strategy', 'Entrepreneurship', 'Growth Planning'],
   'Data-driven decision making combined with visionary thinking',
   18, 225, 'Chicago, USA', 'CST',
   ARRAY['English', 'Korean'], 'approved', true, 4.9, 380);

-- Link coaches to categories
INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'James Mitchell' AND cat.slug = 'leadership';

INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'Sarah Chen' AND cat.slug = 'career';

INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'Michael Thompson' AND cat.slug = 'performance';

INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'Michael Thompson' AND cat.slug = 'mindset';

INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'Elena Rodriguez' AND cat.slug = 'mindset';

INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'Elena Rodriguez' AND cat.slug = 'transitions';

INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'David Park' AND cat.slug = 'leadership';

INSERT INTO coach_categories (coach_id, category_id)
SELECT c.id, cat.id FROM coaches c, categories cat 
WHERE c.display_name = 'David Park' AND cat.slug = 'career';
