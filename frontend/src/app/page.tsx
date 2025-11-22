export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">SafeWatch</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Overdose Prevention Platform
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/user"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            I Need a Watcher
          </a>
          <a
            href="/watcher"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Become a Watcher
          </a>
        </div>
      </div>
    </main>
  )
}
