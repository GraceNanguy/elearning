// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, mot de passe et nom complet sont requis' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        }
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 400 }
      )
    }

    // Créer le profil utilisateur dans notre table users
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          full_name,
          role: 'student' // Par défaut étudiant
        }
      ])

    if (profileError) {
      console.error('Erreur création profil:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name
      }
    })

  } catch (error) {
    console.error('Erreur inscription:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}