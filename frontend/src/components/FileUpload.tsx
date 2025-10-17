import { useRef, type ChangeEvent } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  previewUrl: string;
  fileName?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  previewUrl,
  fileName,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors duration-300">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={`${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'} flex flex-col items-center`}
      >
        {!previewUrl ? (
          <>
            <svg
              className="w-20 h-20 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              Haz clic para seleccionar una imagen
            </p>
            <p className="text-sm text-gray-500">o arrastra y suelta aquí</p>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF hasta 16MB</p>
          </>
        ) : (
          <div className="w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-96 mx-auto rounded-lg shadow-md"
            />
            {fileName && (
              <p className="text-sm text-gray-600 mt-4">{fileName}</p>
            )}
          </div>
        )}
      </label>
    </div>
  );
};