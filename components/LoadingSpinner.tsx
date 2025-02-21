export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-black rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>
  );
} 