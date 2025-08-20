// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client pour les composants serveur
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client pour les composants client
export const createSupabaseClient = () => createClientComponentClient()

// Types pour la base de données
export interface User {
  id: string
  full_name: string
  role: 'admin' | 'student'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  price: number
  duration?: string
  level?: string
  image_url?: string
  category_id?: string
  admin_id?: string
  is_published: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  content: string
  video_url?: string
  pdf_url?: string
  order_index: number
  created_at: string
}

export interface Quiz {
  id: string
  lesson_id: string
  question: string
  choix_a: string
  choix_b: string
  choix_c: string
  choix_d: string
  bonne_reponse: 'A' | 'B' | 'C' | 'D'
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  completed: boolean
  completed_at?: string
  created_at: string
}