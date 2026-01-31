export default function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-stone-600">
          © {new Date().getFullYear()} Podcast platforma. Sva prava zadržana.
        </p>

        <div className="flex gap-6 text-sm text-stone-600">
          <span>Kontaktirajte nas:</span>
          
          <span>podcastify@gmail.com</span>
        </div>
      </div>
    </footer>
  );
}
