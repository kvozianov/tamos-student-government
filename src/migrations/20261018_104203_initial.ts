import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_news_category" AS ENUM('statement', 'news', 'initiative', 'results', 'interview', 'project');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_category" AS ENUM('statement', 'news', 'initiative', 'results', 'interview', 'project');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_updates_status" AS ENUM('idea', 'review', 'approved', 'preparing', 'date_confirmed', 'soon', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_events_startsat_tz" AS ENUM('Asia/Almaty', 'Asia/Aqtobe', 'Europe/Moscow');
  CREATE TYPE "public"."enum_events_endsat_tz" AS ENUM('Asia/Almaty', 'Asia/Aqtobe', 'Europe/Moscow');
  CREATE TYPE "public"."event_status" AS ENUM('idea', 'review', 'approved', 'preparing', 'date_confirmed', 'soon', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_updates_status" AS ENUM('idea', 'review', 'approved', 'preparing', 'date_confirmed', 'soon', 'completed', 'cancelled');
  CREATE TYPE "public"."enum__events_v_version_startsat_tz" AS ENUM('Asia/Almaty', 'Asia/Aqtobe', 'Europe/Moscow');
  CREATE TYPE "public"."enum__events_v_version_endsat_tz" AS ENUM('Asia/Almaty', 'Asia/Aqtobe', 'Europe/Moscow');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_promises_updates_status" AS ENUM('planned', 'review', 'agreed', 'in_progress', 'done', 'partial', 'failed');
  CREATE TYPE "public"."promise_status" AS ENUM('planned', 'review', 'agreed', 'in_progress', 'done', 'partial', 'failed');
  CREATE TYPE "public"."enum_promises_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__promises_v_version_updates_status" AS ENUM('planned', 'review', 'agreed', 'in_progress', 'done', 'partial', 'failed');
  CREATE TYPE "public"."enum__promises_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."idea_status" AS ENUM('submitted', 'review', 'refining', 'approval', 'implementation', 'implemented');
  CREATE TYPE "public"."enum_ideas_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ideas_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_reports_type" AS ENUM('activity', 'approved', 'implemented', 'current');
  CREATE TYPE "public"."enum_reports_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__reports_v_version_type" AS ENUM('activity', 'approved', 'implemented', 'current');
  CREATE TYPE "public"."enum__reports_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_albums_items_kind" AS ENUM('media', 'youtube');
  CREATE TYPE "public"."enum_albums_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__albums_v_version_items_kind" AS ENUM('media', 'youtube');
  CREATE TYPE "public"."enum__albums_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_sections" AS ENUM('news', 'events', 'promises', 'ideas', 'albums', 'reports', 'members', 'campaign', 'home', 'categories');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_settings_socials_platform" AS ENUM('telegram', 'instagram', 'youtube', 'tiktok', 'whatsapp', 'other');
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category" "enum_news_category" DEFAULT 'news',
  	"published_at" timestamp(3) with time zone,
  	"excerpt" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"video_url" varchar,
  	"slug" varchar,
  	"featured" boolean,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "news_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"events_id" integer,
  	"promises_id" integer,
  	"ideas_id" integer
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_category" "enum__news_v_version_category" DEFAULT 'news',
  	"version_published_at" timestamp(3) with time zone,
  	"version_excerpt" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_video_url" varchar,
  	"version_slug" varchar,
  	"version_featured" boolean,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_news_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"events_id" integer,
  	"promises_id" integer,
  	"ideas_id" integer
  );
  
  CREATE TABLE "events_program" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "events_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"status" "enum_events_updates_status",
  	"text" varchar
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"cover_id" integer,
  	"place" varchar,
  	"audience" varchar,
  	"description" jsonb,
  	"date_confirmed" boolean DEFAULT false,
  	"starts_at" timestamp(3) with time zone,
  	"startsat_tz" "enum_events_startsat_tz" DEFAULT 'Asia/Almaty',
  	"ends_at" timestamp(3) with time zone,
  	"endsat_tz" "enum_events_endsat_tz" DEFAULT 'Asia/Almaty',
  	"tentative_label" varchar,
  	"registration_opens_at" timestamp(3) with time zone,
  	"registration_closes_at" timestamp(3) with time zone,
  	"registration_url" varchar,
  	"registration_note" varchar,
  	"organizers_note" varchar,
  	"reference_author" varchar,
  	"reference_platform" varchar,
  	"reference_title" varchar,
  	"reference_url" varchar,
  	"reference_note" varchar,
  	"status" "event_status" DEFAULT 'idea',
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"members_id" integer,
  	"documents_id" integer,
  	"promises_id" integer
  );
  
  CREATE TABLE "_events_v_version_program" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"status" "enum__events_v_version_updates_status",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_cover_id" integer,
  	"version_place" varchar,
  	"version_audience" varchar,
  	"version_description" jsonb,
  	"version_date_confirmed" boolean DEFAULT false,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_startsat_tz" "enum__events_v_version_startsat_tz" DEFAULT 'Asia/Almaty',
  	"version_ends_at" timestamp(3) with time zone,
  	"version_endsat_tz" "enum__events_v_version_endsat_tz" DEFAULT 'Asia/Almaty',
  	"version_tentative_label" varchar,
  	"version_registration_opens_at" timestamp(3) with time zone,
  	"version_registration_closes_at" timestamp(3) with time zone,
  	"version_registration_url" varchar,
  	"version_registration_note" varchar,
  	"version_organizers_note" varchar,
  	"version_reference_author" varchar,
  	"version_reference_platform" varchar,
  	"version_reference_title" varchar,
  	"version_reference_url" varchar,
  	"version_reference_note" varchar,
  	"version_status" "event_status" DEFAULT 'idea',
  	"version_slug" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"members_id" integer,
  	"documents_id" integer,
  	"promises_id" integer
  );
  
  CREATE TABLE "promises_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"status" "enum_promises_updates_status",
  	"text" varchar
  );
  
  CREATE TABLE "promises_evidence_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "promises" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"category_id" integer,
  	"source" varchar,
  	"details" jsonb,
  	"status" "promise_status" DEFAULT 'planned',
  	"status_updated_at" timestamp(3) with time zone,
  	"order" numeric DEFAULT 100,
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_promises_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "promises_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_promises_v_version_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"status" "enum__promises_v_version_updates_status",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_promises_v_version_evidence_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_promises_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_category_id" integer,
  	"version_source" varchar,
  	"version_details" jsonb,
  	"version_status" "promise_status" DEFAULT 'planned',
  	"version_status_updated_at" timestamp(3) with time zone,
  	"version_order" numeric DEFAULT 100,
  	"version_slug" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__promises_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_promises_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ideas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"cover_id" integer,
  	"author" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"result" varchar,
  	"content" jsonb,
  	"status" "idea_status" DEFAULT 'submitted',
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_ideas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "ideas_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"events_id" integer,
  	"promises_id" integer
  );
  
  CREATE TABLE "_ideas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_cover_id" integer,
  	"version_author" varchar,
  	"version_submitted_at" timestamp(3) with time zone,
  	"version_result" varchar,
  	"version_content" jsonb,
  	"version_status" "idea_status" DEFAULT 'submitted',
  	"version_slug" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__ideas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_ideas_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"events_id" integer,
  	"promises_id" integer
  );
  
  CREATE TABLE "reports_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "enum_reports_type" DEFAULT 'activity',
  	"published_at" timestamp(3) with time zone,
  	"period_start" timestamp(3) with time zone,
  	"period_end" timestamp(3) with time zone,
  	"period_label" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_reports_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "reports_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer,
  	"media_id" integer,
  	"promises_id" integer,
  	"events_id" integer,
  	"ideas_id" integer
  );
  
  CREATE TABLE "_reports_v_version_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_reports_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_type" "enum__reports_v_version_type" DEFAULT 'activity',
  	"version_published_at" timestamp(3) with time zone,
  	"version_period_start" timestamp(3) with time zone,
  	"version_period_end" timestamp(3) with time zone,
  	"version_period_label" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_slug" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__reports_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_reports_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"documents_id" integer,
  	"media_id" integer,
  	"promises_id" integer,
  	"events_id" integer,
  	"ideas_id" integer
  );
  
  CREATE TABLE "albums_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_albums_items_kind" DEFAULT 'media',
  	"media_id" integer,
  	"youtube_url" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "albums" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"event_id" integer,
  	"description" varchar,
  	"cover_id" integer,
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_albums_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_albums_v_version_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__albums_v_version_items_kind" DEFAULT 'media',
  	"media_id" integer,
  	"youtube_url" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_albums_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_event_id" integer,
  	"version_description" varchar,
  	"version_cover_id" integer,
  	"version_slug" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__albums_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "members_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "members_priorities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"position" varchar NOT NULL,
  	"photo_id" integer,
  	"area" varchar,
  	"short_bio" varchar,
  	"bio" jsonb,
  	"is_president" boolean,
  	"signature_svg" varchar,
  	"email" varchar,
  	"telegram" varchar,
  	"order" numeric DEFAULT 100,
  	"active" boolean DEFAULT true,
  	"slug" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "members_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"promises_id" integer,
  	"ideas_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sections" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_sections",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"news_id" integer,
  	"events_id" integer,
  	"promises_id" integer,
  	"categories_id" integer,
  	"ideas_id" integer,
  	"reports_id" integer,
  	"albums_id" integer,
  	"members_id" integer,
  	"media_id" integer,
  	"documents_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Президент TAMOS',
  	"hero_slogan" varchar,
  	"hero_image_id" integer,
  	"hero_cta" varchar DEFAULT 'О президенте и администрации',
  	"address_title" varchar DEFAULT 'Обращение президента',
  	"address" jsonb,
  	"promises_lead" varchar,
  	"ideas_lead" varchar,
  	"results_lead" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ideas_page_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "ideas_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "ideas_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead" varchar NOT NULL,
  	"about" jsonb,
  	"cta_title" varchar DEFAULT 'Есть идея для школы?',
  	"cta_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "campaign_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "campaign_initiatives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "campaign_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "campaign_volunteers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar
  );
  
  CREATE TABLE "campaign_result_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "campaign" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Кампания' NOT NULL,
  	"lead" varchar,
  	"cover_id" integer,
  	"is_demo" boolean DEFAULT false,
  	"story" jsonb,
  	"program_intro" jsonb,
  	"results" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "campaign_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"promises_id" integer,
  	"albums_id" integer,
  	"members_id" integer
  );
  
  CREATE TABLE "settings_ticker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_settings_socials_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Президентская администрация TAMOS' NOT NULL,
  	"short_name" varchar DEFAULT 'TAMOS' NOT NULL,
  	"descriptor" varchar DEFAULT 'Президентская администрация',
  	"description" varchar DEFAULT 'Официальный портал президентской администрации TAMOS: новости, события, обещания, Бюро идей и отчётность.' NOT NULL,
  	"logo_id" integer,
  	"og_image_id" integer,
  	"ideas_form_url" varchar,
  	"ideas_form_note" varchar DEFAULT 'Форма откроется в новой вкладке. Ответ придёт в течение недели.',
  	"contact_email" varchar,
  	"address" varchar,
  	"show_demo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "news" ADD CONSTRAINT "news_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_ideas_fk" FOREIGN KEY ("ideas_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_rels" ADD CONSTRAINT "_news_v_rels_ideas_fk" FOREIGN KEY ("ideas_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_program" ADD CONSTRAINT "events_program_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_updates" ADD CONSTRAINT "events_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_program" ADD CONSTRAINT "_events_v_version_program_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_updates" ADD CONSTRAINT "_events_v_version_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promises_updates" ADD CONSTRAINT "promises_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promises_evidence_links" ADD CONSTRAINT "promises_evidence_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promises" ADD CONSTRAINT "promises_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "promises_rels" ADD CONSTRAINT "promises_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promises_rels" ADD CONSTRAINT "promises_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "promises_rels" ADD CONSTRAINT "promises_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_promises_v_version_updates" ADD CONSTRAINT "_promises_v_version_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_promises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_promises_v_version_evidence_links" ADD CONSTRAINT "_promises_v_version_evidence_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_promises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_promises_v" ADD CONSTRAINT "_promises_v_parent_id_promises_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_promises_v" ADD CONSTRAINT "_promises_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_promises_v_rels" ADD CONSTRAINT "_promises_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_promises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_promises_v_rels" ADD CONSTRAINT "_promises_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_promises_v_rels" ADD CONSTRAINT "_promises_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ideas" ADD CONSTRAINT "ideas_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ideas_rels" ADD CONSTRAINT "ideas_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ideas_rels" ADD CONSTRAINT "ideas_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ideas_rels" ADD CONSTRAINT "ideas_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ideas_rels" ADD CONSTRAINT "ideas_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ideas_v" ADD CONSTRAINT "_ideas_v_parent_id_ideas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ideas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ideas_v" ADD CONSTRAINT "_ideas_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ideas_v_rels" ADD CONSTRAINT "_ideas_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ideas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ideas_v_rels" ADD CONSTRAINT "_ideas_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ideas_v_rels" ADD CONSTRAINT "_ideas_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ideas_v_rels" ADD CONSTRAINT "_ideas_v_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_key_facts" ADD CONSTRAINT "reports_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reports_rels" ADD CONSTRAINT "reports_rels_ideas_fk" FOREIGN KEY ("ideas_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v_version_key_facts" ADD CONSTRAINT "_reports_v_version_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v" ADD CONSTRAINT "_reports_v_parent_id_reports_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_reports_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_reports_v_rels" ADD CONSTRAINT "_reports_v_rels_ideas_fk" FOREIGN KEY ("ideas_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums_items" ADD CONSTRAINT "albums_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums_items" ADD CONSTRAINT "albums_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "albums" ADD CONSTRAINT "albums_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v_version_items" ADD CONSTRAINT "_albums_v_version_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v_version_items" ADD CONSTRAINT "_albums_v_version_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_albums_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_parent_id_albums_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_event_id_events_id_fk" FOREIGN KEY ("version_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_albums_v" ADD CONSTRAINT "_albums_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members_responsibilities" ADD CONSTRAINT "members_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_priorities" ADD CONSTRAINT "members_priorities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members" ADD CONSTRAINT "members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members_rels" ADD CONSTRAINT "members_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_rels" ADD CONSTRAINT "members_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_rels" ADD CONSTRAINT "members_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_rels" ADD CONSTRAINT "members_rels_ideas_fk" FOREIGN KEY ("ideas_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sections" ADD CONSTRAINT "users_sections_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ideas_fk" FOREIGN KEY ("ideas_id") REFERENCES "public"."ideas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ideas_page_principles" ADD CONSTRAINT "ideas_page_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ideas_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ideas_page_steps" ADD CONSTRAINT "ideas_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ideas_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_goals" ADD CONSTRAINT "campaign_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_initiatives" ADD CONSTRAINT "campaign_initiatives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_timeline" ADD CONSTRAINT "campaign_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_volunteers" ADD CONSTRAINT "campaign_volunteers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_result_facts" ADD CONSTRAINT "campaign_result_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign" ADD CONSTRAINT "campaign_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campaign_rels" ADD CONSTRAINT "campaign_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."campaign"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_rels" ADD CONSTRAINT "campaign_rels_promises_fk" FOREIGN KEY ("promises_id") REFERENCES "public"."promises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_rels" ADD CONSTRAINT "campaign_rels_albums_fk" FOREIGN KEY ("albums_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campaign_rels" ADD CONSTRAINT "campaign_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_ticker" ADD CONSTRAINT "settings_ticker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_socials" ADD CONSTRAINT "settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "news_cover_idx" ON "news" USING btree ("cover_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "news" USING btree ("slug");
  CREATE INDEX "news_is_demo_idx" ON "news" USING btree ("is_demo");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE INDEX "news_rels_order_idx" ON "news_rels" USING btree ("order");
  CREATE INDEX "news_rels_parent_idx" ON "news_rels" USING btree ("parent_id");
  CREATE INDEX "news_rels_path_idx" ON "news_rels" USING btree ("path");
  CREATE INDEX "news_rels_media_id_idx" ON "news_rels" USING btree ("media_id");
  CREATE INDEX "news_rels_events_id_idx" ON "news_rels" USING btree ("events_id");
  CREATE INDEX "news_rels_promises_id_idx" ON "news_rels" USING btree ("promises_id");
  CREATE INDEX "news_rels_ideas_id_idx" ON "news_rels" USING btree ("ideas_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_cover_idx" ON "_news_v" USING btree ("version_cover_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_is_demo_idx" ON "_news_v" USING btree ("version_is_demo");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE INDEX "_news_v_rels_order_idx" ON "_news_v_rels" USING btree ("order");
  CREATE INDEX "_news_v_rels_parent_idx" ON "_news_v_rels" USING btree ("parent_id");
  CREATE INDEX "_news_v_rels_path_idx" ON "_news_v_rels" USING btree ("path");
  CREATE INDEX "_news_v_rels_media_id_idx" ON "_news_v_rels" USING btree ("media_id");
  CREATE INDEX "_news_v_rels_events_id_idx" ON "_news_v_rels" USING btree ("events_id");
  CREATE INDEX "_news_v_rels_promises_id_idx" ON "_news_v_rels" USING btree ("promises_id");
  CREATE INDEX "_news_v_rels_ideas_id_idx" ON "_news_v_rels" USING btree ("ideas_id");
  CREATE INDEX "events_program_order_idx" ON "events_program" USING btree ("_order");
  CREATE INDEX "events_program_parent_id_idx" ON "events_program" USING btree ("_parent_id");
  CREATE INDEX "events_updates_order_idx" ON "events_updates" USING btree ("_order");
  CREATE INDEX "events_updates_parent_id_idx" ON "events_updates" USING btree ("_parent_id");
  CREATE INDEX "events_cover_idx" ON "events" USING btree ("cover_id");
  CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");
  CREATE INDEX "events_status_idx" ON "events" USING btree ("status");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_is_demo_idx" ON "events" USING btree ("is_demo");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_members_id_idx" ON "events_rels" USING btree ("members_id");
  CREATE INDEX "events_rels_documents_id_idx" ON "events_rels" USING btree ("documents_id");
  CREATE INDEX "events_rels_promises_id_idx" ON "events_rels" USING btree ("promises_id");
  CREATE INDEX "_events_v_version_program_order_idx" ON "_events_v_version_program" USING btree ("_order");
  CREATE INDEX "_events_v_version_program_parent_id_idx" ON "_events_v_version_program" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_updates_order_idx" ON "_events_v_version_updates" USING btree ("_order");
  CREATE INDEX "_events_v_version_updates_parent_id_idx" ON "_events_v_version_updates" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_cover_idx" ON "_events_v" USING btree ("version_cover_id");
  CREATE INDEX "_events_v_version_version_starts_at_idx" ON "_events_v" USING btree ("version_starts_at");
  CREATE INDEX "_events_v_version_version_status_idx" ON "_events_v" USING btree ("version_status");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_is_demo_idx" ON "_events_v" USING btree ("version_is_demo");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_members_id_idx" ON "_events_v_rels" USING btree ("members_id");
  CREATE INDEX "_events_v_rels_documents_id_idx" ON "_events_v_rels" USING btree ("documents_id");
  CREATE INDEX "_events_v_rels_promises_id_idx" ON "_events_v_rels" USING btree ("promises_id");
  CREATE INDEX "promises_updates_order_idx" ON "promises_updates" USING btree ("_order");
  CREATE INDEX "promises_updates_parent_id_idx" ON "promises_updates" USING btree ("_parent_id");
  CREATE INDEX "promises_evidence_links_order_idx" ON "promises_evidence_links" USING btree ("_order");
  CREATE INDEX "promises_evidence_links_parent_id_idx" ON "promises_evidence_links" USING btree ("_parent_id");
  CREATE INDEX "promises_category_idx" ON "promises" USING btree ("category_id");
  CREATE INDEX "promises_status_idx" ON "promises" USING btree ("status");
  CREATE UNIQUE INDEX "promises_slug_idx" ON "promises" USING btree ("slug");
  CREATE INDEX "promises_is_demo_idx" ON "promises" USING btree ("is_demo");
  CREATE INDEX "promises_updated_at_idx" ON "promises" USING btree ("updated_at");
  CREATE INDEX "promises_created_at_idx" ON "promises" USING btree ("created_at");
  CREATE INDEX "promises__status_idx" ON "promises" USING btree ("_status");
  CREATE INDEX "promises_rels_order_idx" ON "promises_rels" USING btree ("order");
  CREATE INDEX "promises_rels_parent_idx" ON "promises_rels" USING btree ("parent_id");
  CREATE INDEX "promises_rels_path_idx" ON "promises_rels" USING btree ("path");
  CREATE INDEX "promises_rels_documents_id_idx" ON "promises_rels" USING btree ("documents_id");
  CREATE INDEX "promises_rels_media_id_idx" ON "promises_rels" USING btree ("media_id");
  CREATE INDEX "_promises_v_version_updates_order_idx" ON "_promises_v_version_updates" USING btree ("_order");
  CREATE INDEX "_promises_v_version_updates_parent_id_idx" ON "_promises_v_version_updates" USING btree ("_parent_id");
  CREATE INDEX "_promises_v_version_evidence_links_order_idx" ON "_promises_v_version_evidence_links" USING btree ("_order");
  CREATE INDEX "_promises_v_version_evidence_links_parent_id_idx" ON "_promises_v_version_evidence_links" USING btree ("_parent_id");
  CREATE INDEX "_promises_v_parent_idx" ON "_promises_v" USING btree ("parent_id");
  CREATE INDEX "_promises_v_version_version_category_idx" ON "_promises_v" USING btree ("version_category_id");
  CREATE INDEX "_promises_v_version_version_status_idx" ON "_promises_v" USING btree ("version_status");
  CREATE INDEX "_promises_v_version_version_slug_idx" ON "_promises_v" USING btree ("version_slug");
  CREATE INDEX "_promises_v_version_version_is_demo_idx" ON "_promises_v" USING btree ("version_is_demo");
  CREATE INDEX "_promises_v_version_version_updated_at_idx" ON "_promises_v" USING btree ("version_updated_at");
  CREATE INDEX "_promises_v_version_version_created_at_idx" ON "_promises_v" USING btree ("version_created_at");
  CREATE INDEX "_promises_v_version_version__status_idx" ON "_promises_v" USING btree ("version__status");
  CREATE INDEX "_promises_v_created_at_idx" ON "_promises_v" USING btree ("created_at");
  CREATE INDEX "_promises_v_updated_at_idx" ON "_promises_v" USING btree ("updated_at");
  CREATE INDEX "_promises_v_latest_idx" ON "_promises_v" USING btree ("latest");
  CREATE INDEX "_promises_v_rels_order_idx" ON "_promises_v_rels" USING btree ("order");
  CREATE INDEX "_promises_v_rels_parent_idx" ON "_promises_v_rels" USING btree ("parent_id");
  CREATE INDEX "_promises_v_rels_path_idx" ON "_promises_v_rels" USING btree ("path");
  CREATE INDEX "_promises_v_rels_documents_id_idx" ON "_promises_v_rels" USING btree ("documents_id");
  CREATE INDEX "_promises_v_rels_media_id_idx" ON "_promises_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "ideas_cover_idx" ON "ideas" USING btree ("cover_id");
  CREATE UNIQUE INDEX "ideas_slug_idx" ON "ideas" USING btree ("slug");
  CREATE INDEX "ideas_is_demo_idx" ON "ideas" USING btree ("is_demo");
  CREATE INDEX "ideas_updated_at_idx" ON "ideas" USING btree ("updated_at");
  CREATE INDEX "ideas_created_at_idx" ON "ideas" USING btree ("created_at");
  CREATE INDEX "ideas__status_idx" ON "ideas" USING btree ("_status");
  CREATE INDEX "ideas_rels_order_idx" ON "ideas_rels" USING btree ("order");
  CREATE INDEX "ideas_rels_parent_idx" ON "ideas_rels" USING btree ("parent_id");
  CREATE INDEX "ideas_rels_path_idx" ON "ideas_rels" USING btree ("path");
  CREATE INDEX "ideas_rels_media_id_idx" ON "ideas_rels" USING btree ("media_id");
  CREATE INDEX "ideas_rels_events_id_idx" ON "ideas_rels" USING btree ("events_id");
  CREATE INDEX "ideas_rels_promises_id_idx" ON "ideas_rels" USING btree ("promises_id");
  CREATE INDEX "_ideas_v_parent_idx" ON "_ideas_v" USING btree ("parent_id");
  CREATE INDEX "_ideas_v_version_version_cover_idx" ON "_ideas_v" USING btree ("version_cover_id");
  CREATE INDEX "_ideas_v_version_version_slug_idx" ON "_ideas_v" USING btree ("version_slug");
  CREATE INDEX "_ideas_v_version_version_is_demo_idx" ON "_ideas_v" USING btree ("version_is_demo");
  CREATE INDEX "_ideas_v_version_version_updated_at_idx" ON "_ideas_v" USING btree ("version_updated_at");
  CREATE INDEX "_ideas_v_version_version_created_at_idx" ON "_ideas_v" USING btree ("version_created_at");
  CREATE INDEX "_ideas_v_version_version__status_idx" ON "_ideas_v" USING btree ("version__status");
  CREATE INDEX "_ideas_v_created_at_idx" ON "_ideas_v" USING btree ("created_at");
  CREATE INDEX "_ideas_v_updated_at_idx" ON "_ideas_v" USING btree ("updated_at");
  CREATE INDEX "_ideas_v_latest_idx" ON "_ideas_v" USING btree ("latest");
  CREATE INDEX "_ideas_v_rels_order_idx" ON "_ideas_v_rels" USING btree ("order");
  CREATE INDEX "_ideas_v_rels_parent_idx" ON "_ideas_v_rels" USING btree ("parent_id");
  CREATE INDEX "_ideas_v_rels_path_idx" ON "_ideas_v_rels" USING btree ("path");
  CREATE INDEX "_ideas_v_rels_media_id_idx" ON "_ideas_v_rels" USING btree ("media_id");
  CREATE INDEX "_ideas_v_rels_events_id_idx" ON "_ideas_v_rels" USING btree ("events_id");
  CREATE INDEX "_ideas_v_rels_promises_id_idx" ON "_ideas_v_rels" USING btree ("promises_id");
  CREATE INDEX "reports_key_facts_order_idx" ON "reports_key_facts" USING btree ("_order");
  CREATE INDEX "reports_key_facts_parent_id_idx" ON "reports_key_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "reports_slug_idx" ON "reports" USING btree ("slug");
  CREATE INDEX "reports_is_demo_idx" ON "reports" USING btree ("is_demo");
  CREATE INDEX "reports_updated_at_idx" ON "reports" USING btree ("updated_at");
  CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");
  CREATE INDEX "reports__status_idx" ON "reports" USING btree ("_status");
  CREATE INDEX "reports_rels_order_idx" ON "reports_rels" USING btree ("order");
  CREATE INDEX "reports_rels_parent_idx" ON "reports_rels" USING btree ("parent_id");
  CREATE INDEX "reports_rels_path_idx" ON "reports_rels" USING btree ("path");
  CREATE INDEX "reports_rels_documents_id_idx" ON "reports_rels" USING btree ("documents_id");
  CREATE INDEX "reports_rels_media_id_idx" ON "reports_rels" USING btree ("media_id");
  CREATE INDEX "reports_rels_promises_id_idx" ON "reports_rels" USING btree ("promises_id");
  CREATE INDEX "reports_rels_events_id_idx" ON "reports_rels" USING btree ("events_id");
  CREATE INDEX "reports_rels_ideas_id_idx" ON "reports_rels" USING btree ("ideas_id");
  CREATE INDEX "_reports_v_version_key_facts_order_idx" ON "_reports_v_version_key_facts" USING btree ("_order");
  CREATE INDEX "_reports_v_version_key_facts_parent_id_idx" ON "_reports_v_version_key_facts" USING btree ("_parent_id");
  CREATE INDEX "_reports_v_parent_idx" ON "_reports_v" USING btree ("parent_id");
  CREATE INDEX "_reports_v_version_version_slug_idx" ON "_reports_v" USING btree ("version_slug");
  CREATE INDEX "_reports_v_version_version_is_demo_idx" ON "_reports_v" USING btree ("version_is_demo");
  CREATE INDEX "_reports_v_version_version_updated_at_idx" ON "_reports_v" USING btree ("version_updated_at");
  CREATE INDEX "_reports_v_version_version_created_at_idx" ON "_reports_v" USING btree ("version_created_at");
  CREATE INDEX "_reports_v_version_version__status_idx" ON "_reports_v" USING btree ("version__status");
  CREATE INDEX "_reports_v_created_at_idx" ON "_reports_v" USING btree ("created_at");
  CREATE INDEX "_reports_v_updated_at_idx" ON "_reports_v" USING btree ("updated_at");
  CREATE INDEX "_reports_v_latest_idx" ON "_reports_v" USING btree ("latest");
  CREATE INDEX "_reports_v_rels_order_idx" ON "_reports_v_rels" USING btree ("order");
  CREATE INDEX "_reports_v_rels_parent_idx" ON "_reports_v_rels" USING btree ("parent_id");
  CREATE INDEX "_reports_v_rels_path_idx" ON "_reports_v_rels" USING btree ("path");
  CREATE INDEX "_reports_v_rels_documents_id_idx" ON "_reports_v_rels" USING btree ("documents_id");
  CREATE INDEX "_reports_v_rels_media_id_idx" ON "_reports_v_rels" USING btree ("media_id");
  CREATE INDEX "_reports_v_rels_promises_id_idx" ON "_reports_v_rels" USING btree ("promises_id");
  CREATE INDEX "_reports_v_rels_events_id_idx" ON "_reports_v_rels" USING btree ("events_id");
  CREATE INDEX "_reports_v_rels_ideas_id_idx" ON "_reports_v_rels" USING btree ("ideas_id");
  CREATE INDEX "albums_items_order_idx" ON "albums_items" USING btree ("_order");
  CREATE INDEX "albums_items_parent_id_idx" ON "albums_items" USING btree ("_parent_id");
  CREATE INDEX "albums_items_media_idx" ON "albums_items" USING btree ("media_id");
  CREATE INDEX "albums_event_idx" ON "albums" USING btree ("event_id");
  CREATE INDEX "albums_cover_idx" ON "albums" USING btree ("cover_id");
  CREATE UNIQUE INDEX "albums_slug_idx" ON "albums" USING btree ("slug");
  CREATE INDEX "albums_is_demo_idx" ON "albums" USING btree ("is_demo");
  CREATE INDEX "albums_updated_at_idx" ON "albums" USING btree ("updated_at");
  CREATE INDEX "albums_created_at_idx" ON "albums" USING btree ("created_at");
  CREATE INDEX "albums__status_idx" ON "albums" USING btree ("_status");
  CREATE INDEX "_albums_v_version_items_order_idx" ON "_albums_v_version_items" USING btree ("_order");
  CREATE INDEX "_albums_v_version_items_parent_id_idx" ON "_albums_v_version_items" USING btree ("_parent_id");
  CREATE INDEX "_albums_v_version_items_media_idx" ON "_albums_v_version_items" USING btree ("media_id");
  CREATE INDEX "_albums_v_parent_idx" ON "_albums_v" USING btree ("parent_id");
  CREATE INDEX "_albums_v_version_version_event_idx" ON "_albums_v" USING btree ("version_event_id");
  CREATE INDEX "_albums_v_version_version_cover_idx" ON "_albums_v" USING btree ("version_cover_id");
  CREATE INDEX "_albums_v_version_version_slug_idx" ON "_albums_v" USING btree ("version_slug");
  CREATE INDEX "_albums_v_version_version_is_demo_idx" ON "_albums_v" USING btree ("version_is_demo");
  CREATE INDEX "_albums_v_version_version_updated_at_idx" ON "_albums_v" USING btree ("version_updated_at");
  CREATE INDEX "_albums_v_version_version_created_at_idx" ON "_albums_v" USING btree ("version_created_at");
  CREATE INDEX "_albums_v_version_version__status_idx" ON "_albums_v" USING btree ("version__status");
  CREATE INDEX "_albums_v_created_at_idx" ON "_albums_v" USING btree ("created_at");
  CREATE INDEX "_albums_v_updated_at_idx" ON "_albums_v" USING btree ("updated_at");
  CREATE INDEX "_albums_v_latest_idx" ON "_albums_v" USING btree ("latest");
  CREATE INDEX "members_responsibilities_order_idx" ON "members_responsibilities" USING btree ("_order");
  CREATE INDEX "members_responsibilities_parent_id_idx" ON "members_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "members_priorities_order_idx" ON "members_priorities" USING btree ("_order");
  CREATE INDEX "members_priorities_parent_id_idx" ON "members_priorities" USING btree ("_parent_id");
  CREATE INDEX "members_photo_idx" ON "members" USING btree ("photo_id");
  CREATE UNIQUE INDEX "members_slug_idx" ON "members" USING btree ("slug");
  CREATE INDEX "members_is_demo_idx" ON "members" USING btree ("is_demo");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE INDEX "members_rels_order_idx" ON "members_rels" USING btree ("order");
  CREATE INDEX "members_rels_parent_idx" ON "members_rels" USING btree ("parent_id");
  CREATE INDEX "members_rels_path_idx" ON "members_rels" USING btree ("path");
  CREATE INDEX "members_rels_events_id_idx" ON "members_rels" USING btree ("events_id");
  CREATE INDEX "members_rels_promises_id_idx" ON "members_rels" USING btree ("promises_id");
  CREATE INDEX "members_rels_ideas_id_idx" ON "members_rels" USING btree ("ideas_id");
  CREATE INDEX "media_is_demo_idx" ON "media" USING btree ("is_demo");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "documents_is_demo_idx" ON "documents" USING btree ("is_demo");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "users_sections_order_idx" ON "users_sections" USING btree ("order");
  CREATE INDEX "users_sections_parent_idx" ON "users_sections" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_promises_id_idx" ON "payload_locked_documents_rels" USING btree ("promises_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_ideas_id_idx" ON "payload_locked_documents_rels" USING btree ("ideas_id");
  CREATE INDEX "payload_locked_documents_rels_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("reports_id");
  CREATE INDEX "payload_locked_documents_rels_albums_id_idx" ON "payload_locked_documents_rels" USING btree ("albums_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_hero_image_idx" ON "home" USING btree ("hero_image_id");
  CREATE INDEX "ideas_page_principles_order_idx" ON "ideas_page_principles" USING btree ("_order");
  CREATE INDEX "ideas_page_principles_parent_id_idx" ON "ideas_page_principles" USING btree ("_parent_id");
  CREATE INDEX "ideas_page_steps_order_idx" ON "ideas_page_steps" USING btree ("_order");
  CREATE INDEX "ideas_page_steps_parent_id_idx" ON "ideas_page_steps" USING btree ("_parent_id");
  CREATE INDEX "campaign_goals_order_idx" ON "campaign_goals" USING btree ("_order");
  CREATE INDEX "campaign_goals_parent_id_idx" ON "campaign_goals" USING btree ("_parent_id");
  CREATE INDEX "campaign_initiatives_order_idx" ON "campaign_initiatives" USING btree ("_order");
  CREATE INDEX "campaign_initiatives_parent_id_idx" ON "campaign_initiatives" USING btree ("_parent_id");
  CREATE INDEX "campaign_timeline_order_idx" ON "campaign_timeline" USING btree ("_order");
  CREATE INDEX "campaign_timeline_parent_id_idx" ON "campaign_timeline" USING btree ("_parent_id");
  CREATE INDEX "campaign_volunteers_order_idx" ON "campaign_volunteers" USING btree ("_order");
  CREATE INDEX "campaign_volunteers_parent_id_idx" ON "campaign_volunteers" USING btree ("_parent_id");
  CREATE INDEX "campaign_result_facts_order_idx" ON "campaign_result_facts" USING btree ("_order");
  CREATE INDEX "campaign_result_facts_parent_id_idx" ON "campaign_result_facts" USING btree ("_parent_id");
  CREATE INDEX "campaign_cover_idx" ON "campaign" USING btree ("cover_id");
  CREATE INDEX "campaign_rels_order_idx" ON "campaign_rels" USING btree ("order");
  CREATE INDEX "campaign_rels_parent_idx" ON "campaign_rels" USING btree ("parent_id");
  CREATE INDEX "campaign_rels_path_idx" ON "campaign_rels" USING btree ("path");
  CREATE INDEX "campaign_rels_promises_id_idx" ON "campaign_rels" USING btree ("promises_id");
  CREATE INDEX "campaign_rels_albums_id_idx" ON "campaign_rels" USING btree ("albums_id");
  CREATE INDEX "campaign_rels_members_id_idx" ON "campaign_rels" USING btree ("members_id");
  CREATE INDEX "settings_ticker_order_idx" ON "settings_ticker" USING btree ("_order");
  CREATE INDEX "settings_ticker_parent_id_idx" ON "settings_ticker" USING btree ("_parent_id");
  CREATE INDEX "settings_socials_order_idx" ON "settings_socials" USING btree ("_order");
  CREATE INDEX "settings_socials_parent_id_idx" ON "settings_socials" USING btree ("_parent_id");
  CREATE INDEX "settings_logo_idx" ON "settings" USING btree ("logo_id");
  CREATE INDEX "settings_og_image_idx" ON "settings" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "news" CASCADE;
  DROP TABLE "news_rels" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "_news_v_rels" CASCADE;
  DROP TABLE "events_program" CASCADE;
  DROP TABLE "events_updates" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_version_program" CASCADE;
  DROP TABLE "_events_v_version_updates" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "promises_updates" CASCADE;
  DROP TABLE "promises_evidence_links" CASCADE;
  DROP TABLE "promises" CASCADE;
  DROP TABLE "promises_rels" CASCADE;
  DROP TABLE "_promises_v_version_updates" CASCADE;
  DROP TABLE "_promises_v_version_evidence_links" CASCADE;
  DROP TABLE "_promises_v" CASCADE;
  DROP TABLE "_promises_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "ideas" CASCADE;
  DROP TABLE "ideas_rels" CASCADE;
  DROP TABLE "_ideas_v" CASCADE;
  DROP TABLE "_ideas_v_rels" CASCADE;
  DROP TABLE "reports_key_facts" CASCADE;
  DROP TABLE "reports" CASCADE;
  DROP TABLE "reports_rels" CASCADE;
  DROP TABLE "_reports_v_version_key_facts" CASCADE;
  DROP TABLE "_reports_v" CASCADE;
  DROP TABLE "_reports_v_rels" CASCADE;
  DROP TABLE "albums_items" CASCADE;
  DROP TABLE "albums" CASCADE;
  DROP TABLE "_albums_v_version_items" CASCADE;
  DROP TABLE "_albums_v" CASCADE;
  DROP TABLE "members_responsibilities" CASCADE;
  DROP TABLE "members_priorities" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "members_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "users_sections" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "ideas_page_principles" CASCADE;
  DROP TABLE "ideas_page_steps" CASCADE;
  DROP TABLE "ideas_page" CASCADE;
  DROP TABLE "campaign_goals" CASCADE;
  DROP TABLE "campaign_initiatives" CASCADE;
  DROP TABLE "campaign_timeline" CASCADE;
  DROP TABLE "campaign_volunteers" CASCADE;
  DROP TABLE "campaign_result_facts" CASCADE;
  DROP TABLE "campaign" CASCADE;
  DROP TABLE "campaign_rels" CASCADE;
  DROP TABLE "settings_ticker" CASCADE;
  DROP TABLE "settings_socials" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_news_category";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_category";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum_events_updates_status";
  DROP TYPE "public"."enum_events_startsat_tz";
  DROP TYPE "public"."enum_events_endsat_tz";
  DROP TYPE "public"."event_status";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_updates_status";
  DROP TYPE "public"."enum__events_v_version_startsat_tz";
  DROP TYPE "public"."enum__events_v_version_endsat_tz";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_promises_updates_status";
  DROP TYPE "public"."promise_status";
  DROP TYPE "public"."enum_promises_status";
  DROP TYPE "public"."enum__promises_v_version_updates_status";
  DROP TYPE "public"."enum__promises_v_version_status";
  DROP TYPE "public"."idea_status";
  DROP TYPE "public"."enum_ideas_status";
  DROP TYPE "public"."enum__ideas_v_version_status";
  DROP TYPE "public"."enum_reports_type";
  DROP TYPE "public"."enum_reports_status";
  DROP TYPE "public"."enum__reports_v_version_type";
  DROP TYPE "public"."enum__reports_v_version_status";
  DROP TYPE "public"."enum_albums_items_kind";
  DROP TYPE "public"."enum_albums_status";
  DROP TYPE "public"."enum__albums_v_version_items_kind";
  DROP TYPE "public"."enum__albums_v_version_status";
  DROP TYPE "public"."enum_users_sections";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_settings_socials_platform";`)
}
