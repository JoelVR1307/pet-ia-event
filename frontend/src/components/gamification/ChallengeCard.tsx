import React from 'react';
import { type Challenge, ChallengeType, ChallengeStatus, type UserChallenge } from '../../types/gamification.types';

interface ChallengeCardProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  onJoin?: (challenge: Challenge) => void;
  onComplete?: (userChallenge: UserChallenge) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  userChallenge,
  onJoin,
  onComplete,
  size = 'md',
  className = ''
}) => {
  const getTypeIcon = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.DAILY:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case ChallengeType.WEEKLY:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case ChallengeType.MONTHLY:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case ChallengeType.SPECIAL:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case ChallengeType.COMMUNITY:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: ChallengeType) => {
    switch (type) {
      case ChallengeType.DAILY:
        return 'bg-blue-100 text-blue-800';
      case ChallengeType.WEEKLY:
        return 'bg-green-100 text-green-800';
      case ChallengeType.MONTHLY:
        return 'bg-purple-100 text-purple-800';
      case ChallengeType.SPECIAL:
        return 'bg-yellow-100 text-yellow-800';
      case ChallengeType.COMMUNITY:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          title: 'text-sm font-medium',
          description: 'text-xs',
          button: 'px-3 py-1 text-xs'
        };
      case 'lg':
        return {
          card: 'p-6',
          title: 'text-xl font-semibold',
          description: 'text-base',
          button: 'px-6 py-3 text-base'
        };
      default:
        return {
          card: 'p-4',
          title: 'text-lg font-medium',
          description: 'text-sm',
          button: 'px-4 py-2 text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const isActive = challenge.status === ChallengeStatus.ACTIVE;
  const isExpired = new Date(challenge.endDate) < new Date();
  const canJoin = isActive && !isExpired && !userChallenge;
  const progress = userChallenge ? (userChallenge.progress / challenge.target) * 100 : 0;
  const isCompleted = userChallenge?.status === ChallengeStatus.COMPLETED;

  const handleJoin = () => {
    if (canJoin && onJoin) {
      onJoin(challenge);
    }
  };

  const handleComplete = () => {
    if (userChallenge && userChallenge.status === ChallengeStatus.IN_PROGRESS && onComplete) {
      onComplete(userChallenge);
    }
  };

  const getStatusBadge = () => {
    if (userChallenge) {
      switch (userChallenge.status) {
        case ChallengeStatus.IN_PROGRESS:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              En Progreso
            </span>
          );
        case ChallengeStatus.COMPLETED:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completado
            </span>
          );
        case ChallengeStatus.FAILED:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Fallido
            </span>
          );
      }
    }
    
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Expirado
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Disponible
      </span>
    );
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${i < difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const formatTimeRemaining = () => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className={sizeClasses.card}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(challenge.type)}`}>
                <span className="mr-1">{getTypeIcon(challenge.type)}</span>
                {challenge.type}
              </span>
              {getStatusBadge()}
            </div>
            <h3 className={`${sizeClasses.title} text-gray-900`}>
              {challenge.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className={`${sizeClasses.description} text-gray-600 mb-3`}>
          {challenge.description}
        </p>

        {/* Progress bar for joined challenges */}
        {userChallenge && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm text-gray-500">
                {userChallenge.progress} / {challenge.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progress.toFixed(1)}% completado
            </div>
          </div>
        )}

        {/* Challenge details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Recompensa</div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-900">{challenge.reward} pts</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Dificultad</div>
            <div className="flex items-center space-x-1">
              {getDifficultyStars(challenge.difficulty)}
            </div>
          </div>
        </div>

        {/* Time remaining */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Tiempo restante</div>
          <div className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTimeRemaining()}
          </div>
        </div>

        {/* Participants count for community challenges */}
        {challenge.type === ChallengeType.COMMUNITY && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Participantes</div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm text-gray-900">{challenge.participants || 0}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex space-x-2">
          {userChallenge ? (
            <>
              {userChallenge.status === ChallengeStatus.IN_PROGRESS && progress >= 100 && (
                <button
                  onClick={handleComplete}
                  className={`flex-1 ${sizeClasses.button} font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
                >
                  Reclamar Recompensa
                </button>
              )}
              {userChallenge.status === ChallengeStatus.IN_PROGRESS && progress < 100 && (
                <div className={`flex-1 ${sizeClasses.button} font-medium text-blue-600 bg-blue-50 rounded-md text-center`}>
                  En Progreso
                </div>
              )}
              {userChallenge.status === ChallengeStatus.COMPLETED && (
                <div className={`flex-1 ${sizeClasses.button} font-medium text-green-600 bg-green-50 rounded-md text-center`}>
                  ✓ Completado
                </div>
              )}
              {userChallenge.status === ChallengeStatus.FAILED && (
                <div className={`flex-1 ${sizeClasses.button} font-medium text-red-600 bg-red-50 rounded-md text-center`}>
                  Fallido
                </div>
              )}
            </>
          ) : (
            <button
              onClick={handleJoin}
              disabled={!canJoin}
              className={`flex-1 ${sizeClasses.button} font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                canJoin
                  ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'text-gray-500 bg-gray-100 cursor-not-allowed'
              }`}
            >
              {isExpired ? 'Expirado' : 'Unirse al Desafío'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Challenge grid component
export const ChallengeGrid: React.FC<{
  challenges: Challenge[];
  userChallenges?: UserChallenge[];
  onJoin?: (challenge: Challenge) => void;
  onComplete?: (userChallenge: UserChallenge) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  challenges,
  userChallenges = [],
  onJoin,
  onComplete,
  size = 'md',
  className = ''
}) => {
  const getGridClasses = () => {
    switch (size) {
      case 'sm':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3';
      case 'lg':
        return 'grid-cols-1 lg:grid-cols-2 gap-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  return (
    <div className={`grid ${getGridClasses()} ${className}`}>
      {challenges.map((challenge) => {
        const userChallenge = userChallenges.find(uc => uc.challengeId === challenge.id);
        return (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            userChallenge={userChallenge}
            onJoin={onJoin}
            onComplete={onComplete}
            size={size}
          />
        );
      })}
    </div>
  );
};

export default ChallengeCard;