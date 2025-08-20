// src/app/api/courses/[id]/publish/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Publier/Dépublier un cours (admin seulement)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { is_published } = await request.json()

    if (typeof is_published !== 'boolean') {
      return NextResponse.json(
        { error: 'is_published doit être true ou false' },
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

    // Si on veut publier, vérifier que le cours a au moins une leçon
    if (is_published) {
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', params.id)
        .limit(1)

      if (lessonsError) {
        return NextResponse.json(
          { error: 'Erreur vérification leçons' },
          { status: 500 }
        )
      }

      if (!lessons || lessons.length === 0) {
        return NextResponse.json(
          { error: 'Impossible de publier un cours sans leçons' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour le statut de publication
    const { data: course, error } = await supabase
      .from('courses')
      .update({ 
        is_published,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        id,
        title,
        is_published,
        updated_at
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Cours ${is_published ? 'publié' : 'dépublié'} avec succès`,
      course
    })

  } catch (error) {
    console.error('Erreur publication cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}