// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Récupérer tous les cours (avec filtres optionnels)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category_id = searchParams.get('category_id')
    const published_only = searchParams.get('published_only') === 'true'
    const search = searchParams.get('search')

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    let query = supabase
      .from('courses')
      .select(`
        *,
        category:categories(id, name),
        admin:users!courses_admin_id_fkey(id, full_name)
      `)

    // Filtres
    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    if (published_only) {
      query = query.eq('is_published', true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: courses, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ courses })

  } catch (error) {
    console.error('Erreur récupération cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un cours (admin seulement)
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      price,
      duration,
      level,
      image_url,
      category_id
    } = await request.json()

    if (!title || !description || price === undefined) {
      return NextResponse.json(
        { error: 'Titre, description et prix sont requis' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Vérifier l'authentification
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Créer le cours
    const { data: course, error } = await supabase
      .from('courses')
      .insert([{
        title,
        description,
        price,
        duration,
        level,
        image_url,
        category_id,
        admin_id: session.user.id,
        is_published: false // Par défaut non publié
      }])
      .select(`
        *,
        category:categories(id, name),
        admin:users!courses_admin_id_fkey(id, full_name)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Cours créé avec succès',
      course
    })

  } catch (error) {
    console.error('Erreur création cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}