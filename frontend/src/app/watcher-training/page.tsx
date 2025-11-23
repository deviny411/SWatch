'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function WatcherTrainingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const toggleChecklistItem = (id: number) => {
    const newSet = new Set(completedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setCompletedItems(newSet)
  }

  const checklistItems = [
    'Watch the overdose recognition video below',
    'Learn the critical signs of opioid overdose',
    'Understand when to trigger emergency response',
    'Know how to keep someone conscious and breathing',
    'Review the symptoms sidebar during calls',
    'Stay calm and supportive - you are saving lives',
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2">Watcher Training Guide</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Learn how to recognize and respond to overdose situations
          </p>
        </div>

        {/* Pre-Call Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            ✅ Pre-Call Checklist
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Complete these steps before accepting your first call:
          </p>
          <div className="space-y-3">
            {checklistItems.map((item, index) => (
              <label
                key={index}
                className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked={completedItems.has(index)}
                  onChange={() => toggleChecklistItem(index)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className={completedItems.has(index) ? 'line-through text-gray-500' : ''}>
                  {item}
                </span>
              </label>
            ))}
          </div>
          {completedItems.size === checklistItems.length && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                🎉 You're ready to start watching! Remember to stay calm and supportive.
              </p>
            </div>
          )}
        </div>

        {/* Video Training */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🎥 Overdose Recognition Training
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Watch this video to learn how to recognize and respond to opioid overdoses:
          </p>
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/O-XfGu_Iq14"
              title="Opioid Overdose Recognition and Response"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Video: Overdose Recognition and Naloxone Administration Training
          </p>
        </div>

        {/* Quick Reference Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Critical Signs */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
              🚨 CRITICAL SIGNS
            </h3>
            <p className="text-sm font-semibold mb-2">Trigger emergency immediately if you see:</p>
            <ul className="space-y-2 text-sm">
              <li>✗ Unconscious / can't be woken up</li>
              <li>✗ Not breathing or very slow breathing</li>
              <li>✗ Blue/purple lips or fingernails</li>
              <li>✗ Choking or gurgling sounds</li>
              <li>✗ Limp body</li>
            </ul>
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/40 rounded">
              <p className="text-xs font-bold">
                When in doubt, click the EMERGENCY button. Better safe than sorry.
              </p>
            </div>
          </div>

          {/* What To Do */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-3">
              ✅ EMERGENCY RESPONSE
            </h3>
            <p className="text-sm font-semibold mb-2">If you see critical signs:</p>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li><strong>Click EMERGENCY button</strong> (top center)</li>
              <li>Try to keep them awake - talk to them</li>
              <li>Tell them to lay on their side</li>
              <li>Stay on the call until help arrives</li>
              <li>If they have Narcan, guide them to use it</li>
            </ol>
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/40 rounded">
              <p className="text-xs font-bold">
                Your calm presence can save a life. You've got this.
              </p>
            </div>
          </div>
        </div>

        {/* During the Call Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">💡 Tips During Calls</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">DO:</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Stay calm and reassuring</li>
                <li>✓ Keep them talking and engaged</li>
                <li>✓ Watch for signs of distress</li>
                <li>✓ Use the symptoms sidebar for reference</li>
                <li>✓ Trust your instincts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">DON'T:</h4>
              <ul className="space-y-1 text-sm">
                <li>✗ Judge or lecture</li>
                <li>✗ Leave them alone if they seem drowsy</li>
                <li>✗ Hesitate to trigger emergency</li>
                <li>✗ Panic - they need you calm</li>
                <li>✗ Share personal information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">📚 Additional Resources</h2>
          <div className="space-y-3 text-sm">
            <a
              href="https://harmreduction.org/issues/overdose-prevention/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → Harm Reduction Coalition - Overdose Prevention
            </a>
            <a
              href="https://www.cdc.gov/stopoverdose/naloxone/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → CDC - How to Use Naloxone (Narcan)
            </a>
            <a
              href="https://nextdistro.org/naloxone"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              → Free Naloxone Distribution Programs
            </a>
          </div>
        </div>

        {/* Ready Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition text-lg"
          >
            {completedItems.size === checklistItems.length
              ? "I'm Ready to Start Watching 🎯"
              : 'Return to Dashboard'}
          </button>
        </div>
      </div>
    </main>
  )
}
