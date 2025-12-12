export default function Footer() {
  return (
    <footer className="bg-gray-100 py-12 px-6 md:px-20 mt-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-600">
        <div>
          <h4 className="font-bold text-gray-900 mb-4">About</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">About Yelp</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Press</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Discover</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Collections</a></li>
            <li><a href="#" className="hover:underline">Talk</a></li>
            <li><a href="#" className="hover:underline">Events</a></li>
          </ul>
        </div>
        {/* Add more columns as needed */}
      </div>
      <div className="mt-10 pt-10 border-t border-gray-300 text-center text-xs text-gray-500">
        © 2025 FoxPassport - Yelp Clone Demo
      </div>
    </footer>
  );
}