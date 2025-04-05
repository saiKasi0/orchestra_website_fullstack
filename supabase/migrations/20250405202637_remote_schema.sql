

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."homepage_content" (
    "id" bigint NOT NULL,
    "hero_image_url" "text",
    "hero_title" "text" NOT NULL,
    "hero_subtitle" "text",
    "about_title" "text",
    "about_description" "text",
    "featured_events_title" "text",
    "stats_students" "text",
    "stats_performances" "text",
    "stats_years" "text",
    "staff_leadership_title" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."homepage_content" OWNER TO "postgres";


ALTER TABLE "public"."homepage_content" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."homepage_content_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."homepage_event_cards" (
    "id" bigint NOT NULL,
    "card_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "link_text" "text",
    "link_url" "text",
    "order_number" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."homepage_event_cards" OWNER TO "postgres";


ALTER TABLE "public"."homepage_event_cards" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."homepage_event_cards_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."leadership_members" (
    "id" bigint NOT NULL,
    "member_id" "text" NOT NULL,
    "section_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text",
    "order_number" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."leadership_members" OWNER TO "postgres";


ALTER TABLE "public"."leadership_members" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."leadership_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."leadership_sections" (
    "id" bigint NOT NULL,
    "section_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "order_number" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."leadership_sections" OWNER TO "postgres";


ALTER TABLE "public"."leadership_sections" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."leadership_sections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" bigint NOT NULL,
    "auth_id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE "public"."profiles" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."profiles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."staff_members" (
    "id" bigint NOT NULL,
    "member_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "position" "text",
    "image_url" "text",
    "bio" "text",
    "order_number" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."staff_members" OWNER TO "postgres";


ALTER TABLE "public"."staff_members" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."staff_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."homepage_content"
    ADD CONSTRAINT "homepage_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."homepage_event_cards"
    ADD CONSTRAINT "homepage_event_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leadership_members"
    ADD CONSTRAINT "leadership_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leadership_sections"
    ADD CONSTRAINT "leadership_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leadership_sections"
    ADD CONSTRAINT "leadership_sections_section_id_key" UNIQUE ("section_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_auth_id_key" UNIQUE ("auth_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_members"
    ADD CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_profiles_auth_id" ON "public"."profiles" USING "btree" ("auth_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."homepage_content" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."homepage_event_cards" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."leadership_members" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."leadership_sections" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."staff_members" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "fk_auth" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leadership_members"
    ADD CONSTRAINT "leadership_members_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."leadership_sections"("section_id") ON DELETE CASCADE;



CREATE POLICY "Allow admins and leadership to delete homepage content" ON "public"."homepage_content" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to delete homepage event cards" ON "public"."homepage_event_cards" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to delete leadership members" ON "public"."leadership_members" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to delete leadership sections" ON "public"."leadership_sections" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to delete staff members" ON "public"."staff_members" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to insert homepage content" ON "public"."homepage_content" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to insert homepage event cards" ON "public"."homepage_event_cards" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to insert leadership members" ON "public"."leadership_members" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to insert leadership sections" ON "public"."leadership_sections" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to insert staff members" ON "public"."staff_members" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to update homepage content" ON "public"."homepage_content" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to update homepage event cards" ON "public"."homepage_event_cards" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to update leadership members" ON "public"."leadership_members" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to update leadership sections" ON "public"."leadership_sections" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow admins and leadership to update staff members" ON "public"."staff_members" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."auth_id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'leadership'::"text"])))));



CREATE POLICY "Allow public read access to homepage content" ON "public"."homepage_content" FOR SELECT;



CREATE POLICY "Allow public read access to homepage event cards" ON "public"."homepage_event_cards" FOR SELECT;



CREATE POLICY "Allow public read access to leadership members" ON "public"."leadership_members" FOR SELECT;



CREATE POLICY "Allow public read access to leadership sections" ON "public"."leadership_sections" FOR SELECT;



CREATE POLICY "Allow public read access to staff members" ON "public"."staff_members" FOR SELECT;



ALTER TABLE "public"."homepage_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."homepage_event_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leadership_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leadership_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff_members" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."homepage_content" TO "anon";
GRANT ALL ON TABLE "public"."homepage_content" TO "authenticated";
GRANT ALL ON TABLE "public"."homepage_content" TO "service_role";



GRANT ALL ON SEQUENCE "public"."homepage_content_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."homepage_content_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."homepage_content_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."homepage_event_cards" TO "anon";
GRANT ALL ON TABLE "public"."homepage_event_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."homepage_event_cards" TO "service_role";



GRANT ALL ON SEQUENCE "public"."homepage_event_cards_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."homepage_event_cards_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."homepage_event_cards_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."leadership_members" TO "anon";
GRANT ALL ON TABLE "public"."leadership_members" TO "authenticated";
GRANT ALL ON TABLE "public"."leadership_members" TO "service_role";



GRANT ALL ON SEQUENCE "public"."leadership_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."leadership_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."leadership_members_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."leadership_sections" TO "anon";
GRANT ALL ON TABLE "public"."leadership_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."leadership_sections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."leadership_sections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."leadership_sections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."leadership_sections_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."staff_members" TO "anon";
GRANT ALL ON TABLE "public"."staff_members" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_members" TO "service_role";



GRANT ALL ON SEQUENCE "public"."staff_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."staff_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."staff_members_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
