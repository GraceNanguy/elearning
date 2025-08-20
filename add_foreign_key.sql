-- Script pour ajouter la contrainte de clé étrangère manquante entre courses.admin_id et users.id

ALTER TABLE public.courses
ADD CONSTRAINT courses_admin_id_fkey
FOREIGN KEY (admin_id)
REFERENCES public.users(id);