// middleware.ts (à la racine du projet, pas dans src)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Routes protégées admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // Vérifier si l'utilisateur est admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Routes protégées étudiants
  if (req.nextUrl.pathname.startsWith('/student') || 
      req.nextUrl.pathname.startsWith('/courses/') ||
      req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/courses/:path*',
    '/dashboard/:path*'
  ]
}