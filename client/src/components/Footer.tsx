export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-500 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">
          EventLoop &copy; {new Date().getFullYear()}. Built with React, GraphQL, MongoDB, and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
