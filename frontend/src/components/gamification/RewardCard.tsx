import React from 'react';
import { type Reward, RewardType, RewardCategory, type UserReward, RewardStatus } from '../../types/gamification.types';

interface RewardCardProps {
  reward: Reward;
  userReward?: UserReward;
  userPoints?: number;
  onClaim?: (reward: Reward) => void;
  onUse?: (userReward: UserReward) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userReward,
  userPoints = 0,
  onClaim,
  onUse,
  size = 'md',
  className = ''
}) => {
  const getTypeIcon = (type: RewardType) => {
    switch (type) {
      case RewardType.DISCOUNT:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case RewardType.PRODUCT:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case RewardType.SERVICE:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case RewardType.DIGITAL:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case RewardType.EXPERIENCE:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category: RewardCategory) => {
    switch (category) {
      case RewardCategory.PET_SUPPLIES:
        return 'bg-blue-100 text-blue-800';
      case RewardCategory.VETERINARY:
        return 'bg-green-100 text-green-800';
      case RewardCategory.GROOMING:
        return 'bg-purple-100 text-purple-800';
      case RewardCategory.TRAINING:
        return 'bg-yellow-100 text-yellow-800';
      case RewardCategory.ENTERTAINMENT:
        return 'bg-pink-100 text-pink-800';
      case RewardCategory.PREMIUM_FEATURES:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          image: 'h-32',
          title: 'text-sm font-medium',
          description: 'text-xs',
          button: 'px-3 py-1 text-xs'
        };
      case 'lg':
        return {
          card: 'p-6',
          image: 'h-48',
          title: 'text-xl font-semibold',
          description: 'text-base',
          button: 'px-6 py-3 text-base'
        };
      default:
        return {
          card: 'p-4',
          image: 'h-40',
          title: 'text-lg font-medium',
          description: 'text-sm',
          button: 'px-4 py-2 text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const canAfford = userPoints >= reward.cost;
  const isAvailable = reward.availability > reward.claimed;
  const canClaim = canAfford && isAvailable && !userReward;
  const isExpired = userReward && userReward.expiresAt && new Date(userReward.expiresAt) < new Date();

  const handleClaim = () => {
    if (canClaim && onClaim) {
      onClaim(reward);
    }
  };

  const handleUse = () => {
    if (userReward && userReward.status === RewardStatus.ACTIVE && onUse) {
      onUse(userReward);
    }
  };

  const getStatusBadge = () => {
    if (userReward) {
      switch (userReward.status) {
        case RewardStatus.ACTIVE:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Disponible
            </span>
          );
        case RewardStatus.USED:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Usado
            </span>
          );
        case RewardStatus.EXPIRED:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Expirado
            </span>
          );
        case RewardStatus.REVOKED:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Revocado
            </span>
          );
      }
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Image */}
      <div className={`relative ${sizeClasses.image} bg-gray-100 rounded-t-lg overflow-hidden`}>
        {reward.image ? (
          <img
            src={reward.image}
            alt={reward.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {getTypeIcon(reward.type)}
          </div>
        )}
        
        {/* Status badge overlay */}
        {getStatusBadge() && (
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
        )}

        {/* Availability indicator */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium text-sm">Agotado</span>
          </div>
        )}
      </div>

      <div className={sizeClasses.card}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`${sizeClasses.title} text-gray-900 truncate`}>
              {reward.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(reward.category)}`}>
              {reward.category.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center text-blue-600 ml-2">
            {getTypeIcon(reward.type)}
          </div>
        </div>

        {/* Description */}
        <p className={`${sizeClasses.description} text-gray-600 mb-3 line-clamp-2`}>
          {reward.description}
        </p>

        {/* Cost and Availability */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${canAfford ? 'text-blue-600' : 'text-red-600'}`}>
              {reward.cost} pts
            </span>
            {!canAfford && (
              <span className="text-xs text-red-500">
                (Faltan {reward.cost - userPoints})
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {reward.availability - reward.claimed} disponibles
          </span>
        </div>

        {/* Expiration info for user rewards */}
        {userReward && userReward.expiresAt && (
          <div className="mb-3">
            <div className={`text-xs ${isExpired ? 'text-red-600' : 'text-yellow-600'}`}>
              {isExpired ? 'Expirado' : 'Expira'}: {new Date(userReward.expiresAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Code for claimed rewards */}
        {userReward && userReward.code && (
          <div className="mb-3 p-2 bg-gray-50 rounded border">
            <div className="text-xs text-gray-600 mb-1">Código:</div>
            <div className="font-mono text-sm font-medium text-gray-900 select-all">
              {userReward.code}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex space-x-2">
          {userReward ? (
            <>
              {userReward.status === RewardStatus.ACTIVE && (
                <button
                  onClick={handleUse}
                  className={`flex-1 ${sizeClasses.button} font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
                >
                  Usar Recompensa
                </button>
              )}
              <div className={`flex-1 ${sizeClasses.button} font-medium text-gray-500 bg-gray-100 rounded-md text-center`}>
                {userReward.status === RewardStatus.USED ? 'Usado' : 
                 userReward.status === RewardStatus.EXPIRED ? 'Expirado' : 
                 userReward.status === RewardStatus.REVOKED ? 'Revocado' : 'Reclamado'}
              </div>
            </>
          ) : (
            <button
              onClick={handleClaim}
              disabled={!canClaim}
              className={`flex-1 ${sizeClasses.button} font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                canClaim
                  ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'text-gray-500 bg-gray-100 cursor-not-allowed'
              }`}
            >
              {!canAfford ? 'Puntos Insuficientes' : 
               !isAvailable ? 'No Disponible' : 'Reclamar'}
            </button>
          )}
        </div>

        {/* Valid dates */}
        <div className="mt-3 text-xs text-gray-500">
          Válido: {new Date(reward.validFrom).toLocaleDateString()} - {new Date(reward.validTo).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Reward grid component
export const RewardGrid: React.FC<{
  rewards: Reward[];
  userRewards?: UserReward[];
  userPoints?: number;
  onClaim?: (reward: Reward) => void;
  onUse?: (userReward: UserReward) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({
  rewards,
  userRewards = [],
  userPoints = 0,
  onClaim,
  onUse,
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
      {rewards.map((reward) => {
        const userReward = userRewards.find(ur => ur.rewardId === reward.id);
        return (
          <RewardCard
            key={reward.id}
            reward={reward}
            userReward={userReward}
            userPoints={userPoints}
            onClaim={onClaim}
            onUse={onUse}
            size={size}
          />
        );
      })}
    </div>
  );
};

export default RewardCard;