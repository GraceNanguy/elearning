// src/app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Connexion utilisateur
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur de connexion' },
        { status: 400 }
      )
    }

    // Récupérer le profil utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Erreur récupération profil:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Connexion réussie',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: userProfile.full_name,
        role: userProfile.role
      }
    })

  } catch (error) {
    console.error('Erreur connexion:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}