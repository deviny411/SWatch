import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
          SafeWatch
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4">
          Overdose Prevention Platform
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Connect with trained volunteer watchers for support during substance use.
          Privacy-first, no recordings, anonymous option available.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition shadow-lg border-2 border-gray-200 dark:border-gray-600"
          >
            Create Account
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">📞</div>
            <h3 className="font-semibold mb-2">Instant Connection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect with trained watchers via video or audio in seconds
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No call recordings, anonymous mode, your privacy protected
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🚨</div>
            <h3 className="font-semibold mb-2">Emergency Ready</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Instant emergency alert with GPS location if needed
            </p>
          </div>
        </div>

        <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Test Mode:</strong> This is a development version. All features are for testing purposes.
          </p>
        </div>
      </div>
    </main>
  )
}
