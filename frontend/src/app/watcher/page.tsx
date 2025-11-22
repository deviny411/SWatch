export default function WatcherPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Become a Watcher</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Requirements:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Complete training on overdose recognition and response</li>
            <li>Pass a background check</li>
            <li>Commit to regular shifts (minimum 4 hours per week)</li>
            <li>Have a stable internet connection and webcam</li>
            <li>Be 18 years or older</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">What you'll do:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Monitor individuals via video call for signs of overdose</li>
            <li>Provide emotional support and guidance</li>
            <li>Trigger emergency response if needed</li>
            <li>Document sessions (without personal information)</li>
          </ul>
        </div>

        <button className="w-full px-6 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition">
          Apply to Become a Watcher
        </button>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Volunteer Position:</strong> This is a volunteer role. Training and
            support will be provided. You'll be making a real difference in preventing
            overdose deaths.
          </p>
        </div>
      </div>
    </main>
  )
}
