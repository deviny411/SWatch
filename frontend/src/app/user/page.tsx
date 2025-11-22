export default function UserPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Request a Watcher</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Connect with a trained watcher via video call</li>
            <li>The watcher monitors you for signs of overdose</li>
            <li>If needed, they can trigger emergency response</li>
            <li>Your privacy is protected - no recordings</li>
          </ol>
        </div>

        <div className="space-y-4">
          <button className="w-full px-6 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition">
            Request Watcher Now
          </button>

          <button className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Request Anonymous Session
          </button>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> This service is not a replacement for emergency services.
            If you are experiencing a medical emergency, call 911 immediately.
          </p>
        </div>
      </div>
    </main>
  )
}
