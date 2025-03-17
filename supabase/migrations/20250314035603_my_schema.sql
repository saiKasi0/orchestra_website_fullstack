revoke delete on table "public"."homepage_events" from "anon";

revoke insert on table "public"."homepage_events" from "anon";

revoke references on table "public"."homepage_events" from "anon";

revoke select on table "public"."homepage_events" from "anon";

revoke trigger on table "public"."homepage_events" from "anon";

revoke truncate on table "public"."homepage_events" from "anon";

revoke update on table "public"."homepage_events" from "anon";

revoke delete on table "public"."homepage_events" from "authenticated";

revoke insert on table "public"."homepage_events" from "authenticated";

revoke references on table "public"."homepage_events" from "authenticated";

revoke select on table "public"."homepage_events" from "authenticated";

revoke trigger on table "public"."homepage_events" from "authenticated";

revoke truncate on table "public"."homepage_events" from "authenticated";

revoke update on table "public"."homepage_events" from "authenticated";

revoke delete on table "public"."homepage_events" from "service_role";

revoke insert on table "public"."homepage_events" from "service_role";

revoke references on table "public"."homepage_events" from "service_role";

revoke select on table "public"."homepage_events" from "service_role";

revoke trigger on table "public"."homepage_events" from "service_role";

revoke truncate on table "public"."homepage_events" from "service_role";

revoke update on table "public"."homepage_events" from "service_role";

alter table "public"."homepage_events" drop constraint "homepage_events_pkey";

drop index if exists "public"."homepage_events_pkey";

drop table "public"."homepage_events";

alter table "public"."homepage_content" drop column "about_text";

alter table "public"."homepage_content" drop column "about_title";

alter table "public"."homepage_content" drop column "featured_events_title";

alter table "public"."homepage_content" drop column "hero_image_url";

alter table "public"."homepage_content" drop column "hero_subtitle";

alter table "public"."homepage_content" drop column "hero_title";

alter table "public"."homepage_content" drop column "staff_leadership_title";

alter table "public"."homepage_content" drop column "stats_performances";

alter table "public"."homepage_content" drop column "stats_students";

alter table "public"."homepage_content" drop column "stats_years";

alter table "public"."homepage_content" add column "image_url" text;

alter table "public"."homepage_content" add column "section" character varying(50) not null;

alter table "public"."homepage_content" add column "subtitle" text;

alter table "public"."homepage_content" add column "title" text;

alter table "public"."homepage_content" alter column "created_at" set default now();

alter table "public"."homepage_content" alter column "updated_at" set default now();

alter table "public"."homepage_content" enable row level security;

create policy "Allow admins to insert homepage content"
on "public"."homepage_content"
as permissive
for insert
to public
with check ((auth.uid() IN ( SELECT auth.uid() AS uid
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow admins to update homepage content"
on "public"."homepage_content"
as permissive
for update
to public
using ((auth.uid() IN ( SELECT auth.uid() AS uid
   FROM profiles
  WHERE (profiles.role = 'admin'::text))));


create policy "Allow public read access to homepage content"
on "public"."homepage_content"
as permissive
for select
to public
using (true);



