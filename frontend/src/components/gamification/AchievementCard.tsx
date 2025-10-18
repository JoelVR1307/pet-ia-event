import React from 'react';
import { type Achievement, AchievementRarity } from '../../types/gamification.types';

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (achievement: Achievement) => void;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  showProgress = true,
  size = 'md',
  onClick,
  className = ''
}) => {
  const getRarityStyles = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800'
        };
      case AchievementRarity.UNCOMMON:
        return {
          border: 'border-green-300',
          bg: 'bg-green-50',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800'
        };
      case AchievementRarity.RARE:
        return {
          border: 'border-blue-300',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800'
        };
      case AchievementRarity.EPIC:
        return {
          border: 'border-purple-300',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          badge: 'bg-purple-100 text-purple-800'
        };
      case AchievementRarity.LEGENDARY:
        return {
          border: 'border-yellow-300',
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          icon: 'w-8 h-8 text-2xl',
          title: 'text-sm font-medium',
          description: 'text-xs',
          points: 'text-xs'
        };
      case 'lg':
        return {
          card: 'p-6',
          icon: 'w-16 h-16 text-4xl',
          title: 'text-xl font-semibold',
          description: 'text-base',
          points: 'text-base'
        };
      default:
        return {
          card: 'p-4',
          icon: 'w-12 h-12 text-3xl',
          title: 'text-lg font-medium',
          description: 'text-sm',
          points: 'text-sm'
        };
    }
  };

  const rarityStyles = getRarityStyles(achievement.rarity);
  const sizeClasses = getSizeClasses();
  const progressPercentage = achievement.maxProgress 
    ? Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)
    : achievement.isUnlocked ? 100 : 0;

  const handleClick = () => {
    if (onClick) {
      onClick(achievement);
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 transition-all duration-200 
        ${rarityStyles.border} ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}
        ${achievement.isUnlocked ? '' : 'opacity-60'}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Rarity glow effect for unlocked achievements */}
      {achievement.isUnlocked && achievement.rarity !== AchievementRarity.COMMON && (
        <div className={`absolute inset-0 rounded-lg ${rarityStyles.bg} opacity-20 animate-pulse`} />
      )}

      <div className={sizeClasses.card}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Icon */}
            <div className={`
              flex items-center justify-center rounded-full
              ${achievement.isUnlocked ? rarityStyles.bg : 'bg-gray-100'}
              ${sizeClasses.icon}
            `}>
              {achievement.isUnlocked ? (
                <span className={`${rarityStyles.text}`}>
                  {achievement.icon}
                </span>
              ) : (
                <svg className="w-1/2 h-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h3 className={`${sizeClasses.title} text-gray-900 truncate`}>
                {achievement.name}
              </h3>
              <p className={`${sizeClasses.description} text-gray-600 mt-1`}>
                {achievement.description}
              </p>
            </div>
          </div>

          {/* Points */}
          <div className="flex flex-col items-end space-y-1">
            <span className={`${sizeClasses.points} font-semibold text-blue-600`}>
              {achievement.points} pts
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rarityStyles.badge}`}>
              {achievement.rarity}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && achievement.maxProgress && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Progreso</span>
              <span className="text-xs text-gray-600">
                {achievement.progress || 0} / {achievement.maxProgress}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  achievement.isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-center">
              {progressPercentage}% completado
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {achievement.isUnlocked ? (
              <>
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Desbloqueado</span>
                </div>
                {achievement.unlockedAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs font-medium">Bloqueado</span>
              </div>
            )}
          </div>

          {/* Category */}
          <span className="text-xs text-gray-500 capitalize">
            {achievement.category.replace('_', ' ')}
          </span>
        </div>

        {/* Secret achievement indicator */}
        {achievement.isSecret && !achievement.isUnlocked && (
          <div className="absolute top-2 right-2">
            <div className="bg-purple-100 text-purple-600 rounded-full p-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Achievement grid component
export const AchievementGrid: React.FC<{
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  achievements,
  onAchievementClick,
  showProgress = true,
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
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          showProgress={showProgress}
          size={size}
          onClick={onAchievementClick}
        />
      ))}
    </div>
  );
};

// Achievement stats component
export const AchievementStats: React.FC<{
  achievements: Achievement[];
  className?: string;
}> = ({
  achievements,
  className = ''
}) => {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0);
  const completionRate = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  const rarityStats = achievements.reduce((stats, achievement) => {
    if (achievement.isUnlocked) {
      stats[achievement.rarity] = (stats[achievement.rarity] || 0) + 1;
    }
    return stats;
  }, {} as Record<AchievementRarity, number>);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Logros</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{unlockedCount}</div>
          <div className="text-sm text-gray-600">Desbloqueados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
          <div className="text-sm text-gray-600">Puntos Totales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Completado</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{achievements.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Rarity breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Por Rareza</h4>
        <div className="space-y-2">
          {Object.entries(rarityStats).map(([rarity, count]) => (
            <div key={rarity} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{rarity}</span>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;