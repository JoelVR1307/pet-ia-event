interface ActionButtonsProps {
  onIdentify: () => void;
  onReset: () => void;
  hasFile: boolean;
  isLoading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onIdentify,
  onReset,
  hasFile,
  isLoading,
}) => {
  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={onIdentify}
        disabled={!hasFile || isLoading}
        className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-300 ${
          !hasFile || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Identificando...
          </span>
        ) : (
          '🔍 Identificar Raza'
        )}
      </button>

      {hasFile && (
        <button
          onClick={onReset}
          disabled={isLoading}
          className="py-4 px-6 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-300 cursor-pointer"
        >
          🔄 Reiniciar
        </button>
      )}
    </div>
  );
};