// src/app/test-courses/page.tsx
'use client'
import { useState } from 'react'

export default function TestCoursesPage() {
  const [results, setResults] = useState<Record<string, string>>({})
  const [currentUser, setCurrentUser] = useState<any>(null)

  const updateResult = (key: string, content: string, isError = false) => {
    setResults(prev => ({
      ...prev,
      [key]: `<div class="p-3 rounded border ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'} mb-2">${content}</div>`
    }))
  }

  // ========== AUTHENTIFICATION ==========
  const testAdminLogin = async () => {
    const email = (document.getElementById('admin-email') as HTMLInputElement).value
    const password = (document.getElementById('admin-password') as HTMLInputElement).value
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setCurrentUser(data.user)
        updateResult('auth', `✅ Connecté en tant que ${data.user.role}: ${data.user.full_name}`)
      } else {
        updateResult('auth', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('auth', `❌ Erreur: ${error.message}`, true)
    }
  }

  // ========== CATÉGORIES ==========
  const testCreateCategory = async () => {
    const name = (document.getElementById('cat-name') as HTMLInputElement).value
    const description = (document.getElementById('cat-desc') as HTMLTextAreaElement).value
    
    if (!name) {
      updateResult('categories', '❌ Nom requis', true)
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      const data = await response.json()
      
      if (response.ok) {
        updateResult('categories', `✅ Catégorie créée: "${name}"<br><pre>${JSON.stringify(data.category, null, 2)}</pre>`)
        // Clear inputs
        ;(document.getElementById('cat-name') as HTMLInputElement).value = ''
        ;(document.getElementById('cat-desc') as HTMLTextAreaElement).value = ''
      } else {
        updateResult('categories', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('categories', `❌ Erreur: ${error.message}`, true)
    }
  }

  const testGetCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (response.ok) {
        updateResult('categories', `✅ ${data.categories.length} catégorie(s) trouvée(s)<br><pre>${JSON.stringify(data.categories, null, 2)}</pre>`)
      } else {
        updateResult('categories', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('categories', `❌ Erreur: ${error.message}`, true)
    }
  }

  const createDefaultCategories = async () => {
    const defaultCats = [
      { name: 'Développement Web', description: 'HTML, CSS, JavaScript, React, Next.js' },
      { name: 'Intelligence Artificielle', description: 'IA, Machine Learning, Deep Learning' },
      { name: 'Design UI/UX', description: 'Design d\'interfaces utilisateur' },
      { name: 'Marketing Digital', description: 'SEO, Réseaux sociaux, Publicité en ligne' }
    ]

    let created = 0
    for (const cat of defaultCats) {
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cat),
        })
        
        if (response.ok) created++
      } catch (error) {
        console.error(`Erreur création ${cat.name}:`, error)
      }
    }
    
    updateResult('categories', `✅ ${created}/${defaultCats.length} catégories par défaut créées`)
  }

  // ========== COURS ==========
  const testCreateCourse = async () => {
    const title = (document.getElementById('course-title') as HTMLInputElement).value
    const description = (document.getElementById('course-desc') as HTMLTextAreaElement).value
    const price = parseFloat((document.getElementById('course-price') as HTMLInputElement).value)
    const duration = (document.getElementById('course-duration') as HTMLInputElement).value
    const level = (document.getElementById('course-level') as HTMLSelectElement).value
    
    if (!title || !description || isNaN(price)) {
      updateResult('courses', '❌ Titre, description et prix requis', true)
      return
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          price, 
          duration: duration || undefined,
          level: level || undefined 
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        updateResult('courses', `✅ Cours créé: "${title}" - ${price}€<br><strong>ID:</strong> ${data.course.id}`)
        // Clear inputs
        ;(document.getElementById('course-title') as HTMLInputElement).value = ''
        ;(document.getElementById('course-desc') as HTMLTextAreaElement).value = ''
        ;(document.getElementById('course-price') as HTMLInputElement).value = ''
        ;(document.getElementById('course-duration') as HTMLInputElement).value = ''
        ;(document.getElementById('course-level') as HTMLSelectElement).selectedIndex = 0
      } else {
        updateResult('courses', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('courses', `❌ Erreur: ${error.message}`, true)
    }
  }

  const testGetCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      
      if (response.ok) {
        const simplified = data.courses.map((c: any) => ({
          id: c.id,
          title: c.title,
          price: c.price,
          level: c.level,
          duration: c.duration,
          published: c.is_published,
          admin: c.admin?.full_name
        }))
        updateResult('courses', `✅ ${data.courses.length} cours trouvé(s)<br><pre>${JSON.stringify(simplified, null, 2)}</pre>`)
      } else {
        updateResult('courses', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('courses', `❌ Erreur: ${error.message}`, true)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Test Cours & Catégories</h1>
        {currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <strong>Connecté:</strong> {currentUser.full_name} ({currentUser.role})
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* AUTHENTIFICATION ADMIN */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">🔐 Connexion Admin</h2>
          
          <div className="space-y-3 mb-4">
            <input 
              id="admin-email" 
              type="email" 
              placeholder="admin@test.com"
              className="w-full px-3 py-2 border rounded"
              defaultValue="admin@test.com"
            />
            <input 
              id="admin-password" 
              type="password" 
              placeholder="Mot de passe"
              className="w-full px-3 py-2 border rounded"
              defaultValue="admin123"
            />
          </div>

          <button 
            onClick={testAdminLogin}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
          >
            Se connecter Admin
          </button>

          <div dangerouslySetInnerHTML={{ __html: results.auth || '' }} />
        </div>

        {/* GESTION CATÉGORIES */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-600">📁 Catégories</h2>
          
          <div className="space-y-3 mb-4">
            <input 
              id="cat-name" 
              type="text" 
              placeholder="Nom de la catégorie"
              className="w-full px-3 py-2 border rounded"
            />
            <textarea 
              id="cat-desc" 
              placeholder="Description (optionnelle)"
              className="w-full px-3 py-2 border rounded h-20"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button 
              onClick={testCreateCategory}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Créer
            </button>
            <button 
              onClick={testGetCategories}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Voir toutes
            </button>
            <button 
              onClick={createDefaultCategories}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              Par défaut
            </button>
          </div>

          <div dangerouslySetInnerHTML={{ __html: results.categories || '' }} />
        </div>

        {/* GESTION COURS */}
        <div className="bg-gray-50 p-4 rounded-lg col-span-full">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">📚 Cours</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <input 
                id="course-title" 
                type="text" 
                placeholder="Titre du cours"
                className="w-full px-3 py-2 border rounded"
              />
              <textarea 
                id="course-desc" 
                placeholder="Description du cours"
                className="w-full px-3 py-2 border rounded h-24"
              />
            </div>
            
            <div className="space-y-3">
              <input 
                id="course-price" 
                type="number" 
                step="0.01"
                placeholder="Prix (€)"
                className="w-full px-3 py-2 border rounded"
              />
              <input 
                id="course-duration" 
                type="text" 
                placeholder="Durée (ex: 2h30, 5 semaines)"
                className="w-full px-3 py-2 border rounded"
              />
              <select 
                id="course-level"
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">-- Choisir le niveau --</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button 
              onClick={testCreateCourse}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Créer Cours
            </button>
            <button 
              onClick={testGetCourses}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Voir tous les cours
            </button>
          </div>

          <div dangerouslySetInnerHTML={{ __html: results.courses || '' }} />
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 col-span-full">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instructions de Test</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li><strong>D'abord</strong> : Connectez-vous en tant qu'admin</li>
            <li><strong>Ensuite</strong> : Créez quelques catégories (ou utilisez celles par défaut)</li>
            <li><strong>Puis</strong> : Créez des cours de test avec différents prix et niveaux</li>
            <li><strong>Enfin</strong> : Vérifiez avec "Voir tous les cours" que tout s'affiche bien</li>
          </ol>
          <p className="text-xs text-yellow-600 mt-2">
            💡 <strong>Conseil :</strong> Gardez la console développeur ouverte (F12) pour voir les éventuelles erreurs
          </p>
        </div>
      </div>
    </div>
  )
}