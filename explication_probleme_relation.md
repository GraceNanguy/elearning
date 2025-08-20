# Problème de relation entre 'courses' et 'users'

## Problème identifié

L'erreur "Could not find a relationship between 'courses' and 'users' in the schema cache" est due à une contrainte de clé étrangère manquante dans votre schéma de base de données.

Dans le code de votre API (src/app/api/courses/route.ts), vous faites référence à une relation nommée `courses_admin_id_fkey` entre les tables `courses` et `users` :

```typescript
let query = supabase
  .from('courses')
  .select(`
    *,
    category:categories(id, name),
    admin:users!courses_admin_id_fkey(id, full_name)
  `)
```

Cependant, cette contrainte de clé étrangère n'est pas définie dans votre schéma SQL. La table `courses` a un champ `admin_id` qui devrait référencer `users.id`, mais la contrainte n'est pas déclarée.

## Solution

J'ai créé un script SQL (`add_foreign_key.sql`) qui ajoute la contrainte de clé étrangère manquante :

```sql
ALTER TABLE public.courses
ADD CONSTRAINT courses_admin_id_fkey
FOREIGN KEY (admin_id)
REFERENCES public.users(id);
```

## Comment appliquer la solution

Vous devez exécuter ce script SQL dans votre base de données Supabase. Vous pouvez le faire de plusieurs façons :

1. **Via l'interface Supabase** : Connectez-vous à votre projet Supabase, allez dans l'onglet "SQL Editor" et exécutez le script.

2. **Via l'API Supabase** : Utilisez la fonction `rpc` pour exécuter le script SQL.

3. **Via un outil de gestion de base de données** : Si vous utilisez un outil comme pgAdmin, vous pouvez vous connecter à votre base de données Supabase et exécuter le script.

Après avoir exécuté ce script, l'erreur devrait disparaître car la relation entre `courses` et `users` sera correctement définie dans le schéma de la base de données.