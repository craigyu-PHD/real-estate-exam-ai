-- Supabase Database Schema for 不動產經紀人 AI 法規學習系統
-- 建議直接在 Supabase SQL Editor 中執行此檔案

-- ==========================================
-- 1. 核心法規資料 (Laws Data)
-- ==========================================

CREATE TABLE laws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT, -- 例如: '民法', '土地法', '不動產經紀相關法規'
    source_url TEXT,
    version_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE law_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    law_id UUID REFERENCES laws(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES law_chapters(id) ON DELETE CASCADE, -- 支援章下有節
    title TEXT NOT NULL, -- 例如: '第一編 總則'
    level INTEGER NOT NULL, -- 1: 編, 2: 章, 3: 節
    sort_order INTEGER NOT NULL
);

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    law_id UUID REFERENCES laws(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES law_chapters(id) ON DELETE SET NULL,
    article_number TEXT NOT NULL, -- 例如: '758' 或 '758-1'
    article_text TEXT NOT NULL,
    effective_date DATE,
    version TEXT,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE article_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    old_text TEXT NOT NULL,
    new_text TEXT NOT NULL,
    change_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 2. AI 教學與擴充內容 (AI / Teaching Content)
-- ==========================================

CREATE TABLE article_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
    one_liner TEXT, -- 一句話告訴我
    explanation TEXT, -- 老師白話講解
    why_it_matters TEXT, -- 為什麼這樣規定
    common_mistakes TEXT, -- 容易混淆 / 誤會
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE article_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL, -- 生活案例內容
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE article_exam_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    importance_level INTEGER DEFAULT 1, -- 1-5 顆星
    point_text TEXT NOT NULL, -- 考點提示
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE article_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    target_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    relation_type TEXT, -- 例如: 'exception', 'reference', 'similar'
    description TEXT,
    UNIQUE(source_article_id, target_article_id)
);

-- ==========================================
-- 3. 題庫系統 (Question Bank)
-- ==========================================

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT NOT NULL,
    options JSONB, -- 例如: ["A", "B", "C", "D"]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    source_exam TEXT, -- 例如: '112年不動產經紀人'
    question_type TEXT, -- 'single_choice', 'multiple_choice'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE question_articles (
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, article_id)
);

-- ==========================================
-- 4. 使用者與學習紀錄 (User & Progress)
-- ==========================================

-- User Profiles (與 auth.users 綁定)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE user_article_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    first_read_completed BOOLEAN DEFAULT false,
    understanding_level TEXT, -- 'unknown', 'familiar', 'mastered'
    read_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMP WITH TIME ZONE,
    next_review_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, article_id)
);

CREATE TABLE user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    type TEXT, -- 'important', 'memorize', 'confusing', 'unknown', 'note', 'ask_ai'
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, article_id)
);

-- 間隔複習排程 (Spaced Repetition)
CREATE TABLE review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    interval_days INTEGER DEFAULT 1,
    ease_factor REAL DEFAULT 2.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, article_id)
);

CREATE TABLE review_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    review_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    result TEXT, -- 'forgot', 'hard', 'good', 'easy'
    time_spent_seconds INTEGER
);

CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    articles_reviewed INTEGER DEFAULT 0
);

-- ==========================================
-- 5. 系統快取與紀錄 (System Caches)
-- ==========================================

CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE audio_cache_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    text_hash TEXT NOT NULL,
    audio_url TEXT NOT NULL, -- Supabase Storage URL 或其他
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- RLS (Row Level Security) 政策設定 (範例)
-- ==========================================

-- 啟用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_article_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- 允許使用者只讀取/修改自己的資料
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own progress" ON user_article_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON user_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own review queue" ON review_queue FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own review history" ON review_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning sessions" ON learning_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own ai interactions" ON ai_interactions FOR SELECT USING (auth.uid() = user_id);
