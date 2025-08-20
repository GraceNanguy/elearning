// src/app/page.tsx
'use client'
import { useState } from 'react'

export default function Home() {
  const [results, setResults] = useState<Record<string, string>>({})

  const updateResult = (key: string, content: string, isError = false) => {
    setResults(prev => ({
      ...prev,
      [key]: `<span class="${isError ? 'text-red-600' : 'text-green-600'}">${content}</span>`
    }))
  }

  const testSignup = async () => {
    const email = (document.getElementById('signup-email') as HTMLInputElement).value
    const password = (document.getElementById('signup-password') as HTMLInputElement).value
    const full_name = (document.getElementById('signup-name') as HTMLInputElement).value
    
    if (!email || !password || !full_name) {
      updateResult('signup', '❌ Veuillez remplir tous les champs', true)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, full_name }),
      })

      const data = await response.json()
      
      if (response.ok) {
        updateResult('signup', `✅ ${data.message}<br><pre>${JSON.stringify(data.user, null, 2)}</pre>`)
      } else {
        updateResult('signup', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('signup', `❌ Erreur réseau: ${error.message}`, true)
    }
  }

  const testSignin = async () => {
    const email = (document.getElementById('signin-email') as HTMLInputElement).value
    const password = (document.getElementById('signin-password') as HTMLInputElement).value
    
    if (!email || !password) {
      updateResult('signin', '❌ Veuillez remplir email et mot de passe', true)
      return
    }

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (response.ok) {
        updateResult('signin', `✅ ${data.message}<br><pre>${JSON.stringify(data.user, null, 2)}</pre>`)
      } else {
        updateResult('signin', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('signin', `❌ Erreur réseau: ${error.message}`, true)
    }
  }

  const testMe = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
      })

      const data = await response.json()
      
      if (response.ok) {
        updateResult('me', `✅ Utilisateur connecté<br><pre>${JSON.stringify(data.user, null, 2)}</pre>`)
      } else {
        updateResult('me', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('me', `❌ Erreur réseau: ${error.message}`, true)
    }
  }

  const testSignout = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (response.ok) {
        updateResult('signout', `✅ ${data.message}`)
      } else {
        updateResult('signout', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('signout', `❌ Erreur réseau: ${error.message}`, true)
    }
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Test des APIs d&apos;Authentification</h1>
      
      <div className="space-y-6">
        {/* Test Inscription */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">1️⃣ Test Inscription Étudiant</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <input 
              id="signup-email" 
              type="email" 
              placeholder="email@test.com"
              className="px-3 py-2 border rounded"
            />
            <input 
              id="signup-password" 
              type="password" 
              placeholder="password"
              className="px-3 py-2 border rounded"
            />
            <input 
              id="signup-name" 
              type="text" 
              placeholder="Nom complet"
              className="px-3 py-2 border rounded"
            />
            <button 
              onClick={testSignup}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tester Inscription
            </button>
          </div>
          <div 
            className="bg-white p-3 border rounded"
            dangerouslySetInnerHTML={{ __html: results.signup || '' }}
          />
        </div>

        {/* Test Connexion */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">2️⃣ Test Connexion (Admin existant)</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <input 
              id="signin-email" 
              type="email" 
              placeholder="admin@test.com"
              className="px-3 py-2 border rounded"
            />
            <input 
              id="signin-password" 
              type="password" 
              placeholder="admin123"
              className="px-3 py-2 border rounded"
            />
            <button 
              onClick={testSignin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tester Connexion
            </button>
          </div>
          <div 
            className="bg-white p-3 border rounded"
            dangerouslySetInnerHTML={{ __html: results.signin || '' }}
          />
        </div>

        {/* Test Me */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">3️⃣ Test Récupérer Utilisateur</h2>
          <button 
            onClick={testMe}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-3"
          >
            Qui suis-je ?
          </button>
          <div 
            className="bg-white p-3 border rounded"
            dangerouslySetInnerHTML={{ __html: results.me || '' }}
          />
        </div>

        {/* Test Déconnexion */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">4️⃣ Test Déconnexion</h2>
          <button 
            onClick={testSignout}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-3"
          >
            Se déconnecter
          </button>
          <div 
            className="bg-white p-3 border rounded"
            dangerouslySetInnerHTML={{ __html: results.signout || '' }}
          />
        </div>
      </div>
    </div>
  )
}
