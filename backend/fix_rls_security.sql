-- Script de sécurisation Supabase - Activation RLS sur toutes les tables
-- Ce script empêche l'accès anonyme via l'API PostgREST tout en laissant
-- Django (qui utilise le superuser Postgres) travailler normalement.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- Activer RLS sur la table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
        
        -- Supprimer les anciennes politiques si elles existent
        EXECUTE format('DROP POLICY IF EXISTS "Django Access" ON public.%I', r.tablename);
        
        -- Créer une politique qui refuse tout accès par défaut via l'API anonyme
        -- Note: Django se connecte avec le rôle 'postgres', donc il ignore RLS
        EXECUTE format('CREATE POLICY "Django Access" ON public.%I FOR ALL USING (false)', r.tablename);
        
        RAISE NOTICE 'RLS activé et politique de déni créée pour la table: %', r.tablename;
    END LOOP;
END $$;
