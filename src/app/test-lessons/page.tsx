'use client'
import { useState, useEffect } from 'react'

export default function TestLessonsPage() {
  const [results, setResults] = useState<Record<string, string>>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const updateResult = (key: string, content: string, isError = false) => {
    setResults(prev => ({
      ...prev,
      [key]: `<div class="p-3 rounded border ${isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'} mb-2">${content}</div>`
    }))
  }

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      
      if (response.ok) {
        setCurrentUser(data.user)
        loadCourses()
      }
    } catch (error) {
      console.log('Utilisateur non connecté')
    }
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
        loadCourses()
      } else {
        updateResult('auth', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('auth', `❌ Erreur: ${error.message}`, true)
    }
  }

  // ========== CHARGER LES COURS ==========
  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      
      if (response.ok) {
        setCourses(data.courses)
        updateResult('courses', `✅ ${data.courses.length} cours chargés`)
      } else {
        updateResult('courses', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('courses', `❌ Erreur: ${error.message}`, true)
    }
  }

  // ========== LEÇONS ==========
  const testCreateLesson = async () => {
    if (!selectedCourse) {
      updateResult('lessons', '❌ Veuillez sélectionner un cours', true)
      return
    }

    const title = (document.getElementById('lesson-title') as HTMLInputElement).value
    const content = (document.getElementById('lesson-content') as HTMLTextAreaElement).value
    const video_url = (document.getElementById('lesson-video') as HTMLInputElement).value
    const pdf_url = (document.getElementById('lesson-pdf') as HTMLInputElement).value
    const order_index = parseInt((document.getElementById('lesson-order') as HTMLInputElement).value)
    
    if (!title || !content) {
      updateResult('lessons', '❌ Titre et contenu requis', true)
      return
    }

    try {
      const response = await fetch(`/api/courses/${selectedCourse}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content, 
          video_url: video_url || undefined,
          pdf_url: pdf_url || undefined,
          order_index: isNaN(order_index) ? undefined : order_index
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        updateResult('lessons', `✅ Leçon créée: "${title}"<br><strong>ID:</strong> ${data.lesson.id}<br><strong>Ordre:</strong> ${data.lesson.order_index}`)
        // Clear inputs
        ;(document.getElementById('lesson-title') as HTMLInputElement).value = ''
        ;(document.getElementById('lesson-content') as HTMLTextAreaElement).value = ''
        ;(document.getElementById('lesson-video') as HTMLInputElement).value = ''
        ;(document.getElementById('lesson-pdf') as HTMLInputElement).value = ''
        ;(document.getElementById('lesson-order') as HTMLInputElement).value = ''
      } else {
        updateResult('lessons', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('lessons', `❌ Erreur: ${error.message}`, true)
    }
  }

  const testGetLessons = async () => {
    if (!selectedCourse) {
      updateResult('lessons', '❌ Veuillez sélectionner un cours', true)
      return
    }

    try {
      const response = await fetch(`/api/courses/${selectedCourse}/lessons`)
      const data = await response.json()
      
      if (response.ok) {
        const simplified = data.lessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          order_index: l.order_index,
          has_video: !!l.video_url,
          has_pdf: !!l.pdf_url,
          content_length: l.content.length
        }))
        updateResult('lessons', `✅ ${data.lessons.length} leçon(s) trouvée(s)<br><pre>${JSON.stringify(simplified, null, 2)}</pre>`)
      } else {
        updateResult('lessons', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('lessons', `❌ Erreur: ${error.message}`, true)
    }
  }

  const testGetCourseWithLessons = async () => {
    if (!selectedCourse) {
      updateResult('course-details', '❌ Veuillez sélectionner un cours', true)
      return
    }

    try {
      const response = await fetch(`/api/courses/${selectedCourse}`)
      const data = await response.json()
      
      if (response.ok) {
        const courseInfo = {
          id: data.course.id,
          title: data.course.title,
          admin: data.course.admin?.full_name,
          lessons_count: data.course.lessons?.length || 0,
          lessons: data.course.lessons?.map((l: any) => ({
            title: l.title,
            order: l.order_index
          })) || []
        }
        updateResult('course-details', `✅ Cours avec leçons<br><pre>${JSON.stringify(courseInfo, null, 2)}</pre>`)
      } else {
        updateResult('course-details', `❌ ${data.error}`, true)
      }
    } catch (error: any) {
      updateResult('course-details', `❌ Erreur: ${error.message}`, true)
    }
  }

  const createSampleLessons = async () => {
    if (!selectedCourse) {
      updateResult('lessons', '❌ Veuillez sélectionner un cours', true)
      return
    }

    const sampleLessons = [
      {
        title: "Introduction au cours",
        content: "Bienvenue dans ce cours ! Dans cette première leçon, nous allons voir les objectifs et le programme.",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        order_index: 1
      },
      {
        title: "Les bases fondamentales",
        content: "Dans cette leçon, nous couvrons les concepts de base que vous devez maîtriser.",
        pdf_url: "https://example.com/lesson2.pdf",
        order_index: 2
      },
      {
        title: "Exercices pratiques",
        content: "Maintenant que vous connaissez la théorie, passons à la pratique avec des exercices concrets.",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        pdf_url: "https://example.com/exercises.pdf",
        order_index: 3
      },
      {
        title: "Projet final",
        content: "Pour terminer ce cours, vous allez réaliser un projet qui met en pratique tout ce que vous avez appris.",
        order_index: 4
      }
    ]

    let created = 0
    for (const lesson of sampleLessons) {
      try {
        const response = await fetch(`/api/courses/${selectedCourse}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lesson),
        })
        
        if (response.ok) created++
      } catch (error) {
        console.error(`Erreur création ${lesson.title}:`, error)
      }
    }
    
    updateResult('lessons', `✅ ${created}/${sampleLessons.length} leçons d'exemple créées`)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Test des Leçons</h1>
        {currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <strong>Connecté:</strong> {currentUser.full_name} ({currentUser.role})
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* AUTHENTIFICATION ADMIN */}
        {!currentUser && (
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
        )}

        {/* SÉLECTION DU COURS */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">📚 Sélection du Cours</h2>
          
          <div className="space-y-3 mb-4">
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">-- Choisir un cours --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.price}€)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={loadCourses}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
            >
              Recharger cours
            </button>
            <button 
              onClick={testGetCourseWithLessons}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              disabled={!selectedCourse}
            >
              Voir détails
            </button>
          </div>

          <div dangerouslySetInnerHTML={{ __html: results.courses || '' }} />
          <div dangerouslySetInnerHTML={{ __html: results['course-details'] || '' }} />
        </div>

        {/* GESTION LEÇONS */}
        <div className="bg-gray-50 p-4 rounded-lg col-span-full">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">📖 Leçons</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <input 
                id="lesson-title" 
                type="text" 
                placeholder="Titre de la leçon"
                className="w-full px-3 py-2 border rounded"
              />
              <textarea 
                id="lesson-content" 
                placeholder="Contenu de la leçon (texte, markdown, etc.)"
                className="w-full px-3 py-2 border rounded h-32"
              />
            </div>
            
            <div className="space-y-3">
              <input 
                id="lesson-video" 
                type="url" 
                placeholder="URL vidéo (optionnel)"
                className="w-full px-3 py-2 border rounded"
              />
              <input 
                id="lesson-pdf" 
                type="url" 
                placeholder="URL PDF (optionnel)"
                className="w-full px-3 py-2 border rounded"
              />
              <input 
                id="lesson-order" 
                type="number" 
                placeholder="Ordre (optionnel, auto si vide)"
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button 
              onClick={testCreateLesson}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              disabled={!selectedCourse}
            >
              Créer Leçon
            </button>
            <button 
              onClick={testGetLessons}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!selectedCourse}
            >
              Voir leçons du cours
            </button>
            <button 
              onClick={createSampleLessons}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={!selectedCourse}
            >
              Créer leçons d'exemple
            </button>
          </div>

          <div dangerouslySetInnerHTML={{ __html: results.lessons || '' }} />
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 col-span-full">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Instructions de Test</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li><strong>Connectez-vous</strong> en tant qu'admin (si pas déjà fait)</li>
            <li><strong>Sélectionnez un cours</strong> dans la liste déroulante</li>
            <li><strong>Créez des leçons</strong> une par une ou utilisez les exemples</li>
            <li><strong>Vérifiez</strong> avec "Voir leçons du cours" que tout s'affiche bien</li>
            <li><strong>Testez "Voir détails"</strong> pour voir le cours avec ses leçons</li>
          </ol>
          <p className="text-xs text-yellow-600 mt-2">
            💡 <strong>Conseil :</strong> L'ordre des leçons est automatique si vous ne le spécifiez pas
          </p>
        </div>
      </div>
    </div>
  )
}