export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Loading product...</p>
      </div>
    </div>
  );
}
