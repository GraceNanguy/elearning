// src/app/api/courses/[id]/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Récupérer toutes les leçons d'un cours
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', params.id)
      .order('order_index')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ lessons })

  } catch (error) {
    console.error('Erreur récupération leçons:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer une leçon dans un cours (admin seulement)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const {
      title,
      content,
      video_url,
      pdf_url,
      order_index
    } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu sont requis' },
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

    // Si order_index n'est pas fourni, prendre le suivant
    let finalOrderIndex = order_index
    if (finalOrderIndex === undefined) {
      const { data: lastLesson } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('course_id', params.id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      finalOrderIndex = (lastLesson?.order_index || 0) + 1
    }

    // Créer la leçon
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert([{
        course_id: params.id,
        title,
        content,
        video_url,
        pdf_url,
        order_index: finalOrderIndex
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Leçon créée avec succès',
      lesson
    })

  } catch (error) {
    console.error('Erreur création leçon:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}