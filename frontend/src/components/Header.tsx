import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2 cursor-pointer">
              <span className="text-3xl">🐾</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pet ID AI
              </span>
            </Link>

            <Link
              to="/predict"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
            >
              <span className="text-xl">🔍</span>
              <span>Identificar Raza</span>
            </Link>
          </div>

          {/* Perfil de usuario */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name ? getInitials(user.name) : '👤'}
                </div>
                
                {/* Nombre */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                {/* Icono dropdown */}
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 animate-fadeIn">
                  {/* Info del usuario */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>

                  {/* Opciones */}
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xl">🏠</span>
                      <span className="text-sm font-medium text-gray-700">
                        Dashboard
                      </span>
                    </Link>

                    {/* <Link
                      to="/prediction"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xl">🔍</span>
                      <span className="text-sm font-medium text-gray-700">
                        Identificar Raza
                      </span>
                    </Link> */}
                  </div>

                  {/* Cerrar sesión */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <span className="text-xl">🚪</span>
                      <span className="text-sm font-medium text-red-600">
                        Cerrar Sesión
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};