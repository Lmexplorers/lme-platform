-- =====================================================================
-- LME AI Visibility Engine — Cloudflare D1-skjema
-- ---------------------------------------------------------------------
-- Følger samme D1-mønster som lme-bookly / lme-inner-circle.
--
-- Opprett databasen (eller bruk MCP/Wrangler):
--   wrangler d1 create lme-ai-visibility
--   wrangler d1 execute lme-ai-visibility --file=ai-visibility-schema.sql
--
-- Bind den i Worker-en som env.DB for Fase 2-lagring.
-- All brukervendt tekst er tospråklig (lang = 'no' | 'en'), i tråd med LME.
-- =====================================================================

-- Søkeord & long-tail (Keyword Discovery)
CREATE TABLE IF NOT EXISTS keywords (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'head',     -- head | longtail
  lang        TEXT NOT NULL DEFAULT 'no',        -- no | en
  intent      TEXT,                              -- informational | commercial | navigational
  seed        TEXT,                              -- opphavlig seed/tema
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_keywords_lang ON keywords(lang, type);

-- Spørsmål folk stiller AI (AI Question Discovery)
CREATE TABLE IF NOT EXISTS ai_questions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  question    TEXT NOT NULL,
  topic       TEXT,
  intent      TEXT,
  lang        TEXT NOT NULL DEFAULT 'no',
  used        INTEGER NOT NULL DEFAULT 0,        -- 1 når brukt i en artikkel
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_questions_lang ON ai_questions(lang, used);

-- Genererte artikler (SEO/GEO Article Generator)
CREATE TABLE IF NOT EXISTS articles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword         TEXT,
  slug            TEXT,
  lang            TEXT NOT NULL DEFAULT 'no',
  seo_title       TEXT,
  meta_description TEXT,
  h1              TEXT,
  body_json       TEXT,                          -- full artikkel som JSON (intro/sections/faq/cta)
  status          TEXT NOT NULL DEFAULT 'draft', -- draft | published
  published_url   TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug_lang ON articles(slug, lang);

-- FAQ-elementer (FAQ Engine — kan høre til en artikkel eller stå alene)
CREATE TABLE IF NOT EXISTS faqs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id  INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  lang        TEXT NOT NULL DEFAULT 'no',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Pinterest-pins (Pinterest Traffic Generator)
CREATE TABLE IF NOT EXISTS pins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id    INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  pin_title     TEXT,
  pin_description TEXT,
  image_prompt  TEXT,
  lang          TEXT NOT NULL DEFAULT 'no',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AI Visibility Score-snapshots (dashboard-historikk)
CREATE TABLE IF NOT EXISTS visibility_snapshots (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date   TEXT NOT NULL DEFAULT (date('now')),
  articles_count  INTEGER NOT NULL DEFAULT 0,
  faqs_count      INTEGER NOT NULL DEFAULT 0,
  indexed_pages   INTEGER NOT NULL DEFAULT 0,
  organic_visits  INTEGER NOT NULL DEFAULT 0,
  ai_readiness    INTEGER NOT NULL DEFAULT 0,    -- 0-100
  top_queries     TEXT,                          -- JSON-array
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
