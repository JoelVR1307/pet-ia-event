import React, { useState } from 'react';
import { type LeaderboardEntry, LeaderboardType, LeaderboardPeriod } from '../../types/gamification.types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: LeaderboardType;
  period: LeaderboardPeriod;
  currentUserId?: string;
  onTypeChange?: (type: LeaderboardType) => void;
  onPeriodChange?: (period: LeaderboardPeriod) => void;
  showFilters?: boolean;
  maxEntries?: number;
  className?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  type,
  period,
  currentUserId,
  onTypeChange,
  onPeriodChange,
  showFilters = true,
  maxEntries,
  className = ''
}) => {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const displayEntries = maxEntries ? entries.slice(0, maxEntries) : entries;
  const currentUserEntry = entries.find(entry => entry.userId === currentUserId);
  const currentUserRank = currentUserEntry?.rank;

  const getTypeIcon = (type: LeaderboardType) => {
    switch (type) {
      case LeaderboardType.POINTS:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        );
      case LeaderboardType.ACHIEVEMENTS:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case LeaderboardType.CHALLENGES:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case LeaderboardType.SOCIAL:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
            {rank}
          </div>
        );
    }
  };

  const formatValue = (value: number, type: LeaderboardType) => {
    switch (type) {
      case LeaderboardType.POINTS:
        return `${value.toLocaleString()} pts`;
      case LeaderboardType.ACHIEVEMENTS:
        return `${value} logros`;
      case LeaderboardType.CHALLENGES:
        return `${value} desafíos`;
      case LeaderboardType.SOCIAL:
        return `${value} likes`;
      default:
        return value.toString();
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span className="text-xs">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
          <span className="text-xs">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-400">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
        <span className="text-xs">0</span>
      </div>
    );
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header with filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {getTypeIcon(type)}
              <span className="ml-2">Clasificación</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Type selector */}
              {onTypeChange && (
                <select
                  value={type}
                  onChange={(e) => onTypeChange(e.target.value as LeaderboardType)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={LeaderboardType.POINTS}>Puntos</option>
                  <option value={LeaderboardType.ACHIEVEMENTS}>Logros</option>
                  <option value={LeaderboardType.CHALLENGES}>Desafíos</option>
                  <option value={LeaderboardType.SOCIAL}>Social</option>
                </select>
              )}
              
              {/* Period selector */}
              {onPeriodChange && (
                <select
                  value={period}
                  onChange={(e) => onPeriodChange(e.target.value as LeaderboardPeriod)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={LeaderboardPeriod.DAILY}>Diario</option>
                  <option value={LeaderboardPeriod.WEEKLY}>Semanal</option>
                  <option value={LeaderboardPeriod.MONTHLY}>Mensual</option>
                  <option value={LeaderboardPeriod.ALL_TIME}>Todo el tiempo</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Current user position (if not in top entries) */}
      {currentUserEntry && currentUserRank && currentUserRank > (maxEntries || 10) && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 font-medium">Tu posición:</span>
            <div className="flex items-center space-x-3">
              {getRankIcon(currentUserRank)}
              <div className="text-right">
                <div className="font-medium text-gray-900">{currentUserEntry.userName}</div>
                <div className="text-sm text-gray-600">{formatValue(currentUserEntry.value, type)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard entries */}
      <div className="divide-y divide-gray-200">
        {displayEntries.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;
          const isExpanded = expandedEntry === entry.userId;
          
          return (
            <div
              key={entry.userId}
              className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${
                isCurrentUser ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Rank */}
                  {getRankIcon(entry.rank)}
                  
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                          {entry.userName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600 font-normal">(Tú)</span>
                          )}
                        </div>
                        {entry.level && (
                          <div className="text-xs text-gray-500">Nivel {entry.level}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Value and change */}
                  <div className="text-right">
                    <div className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                      {formatValue(entry.value, type)}
                    </div>
                    {entry.change !== undefined && getChangeIcon(entry.change)}
                  </div>
                  
                  {/* Expand button */}
                  {entry.details && (
                    <button
                      onClick={() => toggleExpanded(entry.userId)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                    >
                      <svg
                        className={`w-4 h-4 transform transition-transform duration-150 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Expanded details */}
              {isExpanded && entry.details && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {Object.entries(entry.details).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-gray-500 text-xs uppercase tracking-wide">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="font-medium text-gray-900 mt-1">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {displayEntries.length === 0 && (
        <div className="p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-500">La clasificación aparecerá aquí cuando haya actividad.</p>
        </div>
      )}

      {/* Show more indicator */}
      {maxEntries && entries.length > maxEntries && (
        <div className="p-4 text-center border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Mostrando {maxEntries} de {entries.length} entradas
          </span>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;