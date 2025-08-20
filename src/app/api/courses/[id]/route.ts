// src/app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Récupérer un cours spécifique avec ses leçons
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Récupérer le cours avec ses relations
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        category:categories(id, name),
        admin:users!courses_admin_id_fkey(id, full_name),
        lessons(*)
      `)
      .eq('id', params.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      )
    }

    // Trier les leçons par ordre
    if (course.lessons) {
      course.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
    }

    return NextResponse.json({ course })

  } catch (error) {
    console.error('Erreur récupération cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un cours (admin seulement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

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

    // Mettre à jour le cours
    const { data: course, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
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
      message: 'Cours mis à jour avec succès',
      course
    })

  } catch (error) {
    console.error('Erreur mise à jour cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un cours (admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Supprimer le cours (CASCADE supprime automatiquement les leçons)
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Cours supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression cours:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}