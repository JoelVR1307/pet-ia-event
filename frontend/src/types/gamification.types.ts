// Gamification Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  type: AchievementType;
  rarity: AchievementRarity;
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  isUnlocked: boolean;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AchievementCategory {
  PET_CARE = 'pet_care',
  SOCIAL = 'social',
  MEDICAL = 'medical',
  TRAINING = 'training',
  COMMUNITY = 'community',
  MILESTONE = 'milestone',
  SPECIAL = 'special'
}

export enum AchievementType {
  SINGLE = 'single',
  PROGRESSIVE = 'progressive',
  STREAK = 'streak',
  COLLECTION = 'collection'
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface AchievementRequirement {
  type: RequirementType;
  target: string;
  value: number;
  operator: 'eq' | 'gte' | 'lte' | 'gt' | 'lt';
}

export enum RequirementType {
  PET_COUNT = 'pet_count',
  POST_COUNT = 'post_count',
  LIKE_COUNT = 'like_count',
  COMMENT_COUNT = 'comment_count',
  APPOINTMENT_COUNT = 'appointment_count',
  VACCINATION_COUNT = 'vaccination_count',
  DAYS_STREAK = 'days_streak',
  PROFILE_COMPLETION = 'profile_completion',
  FRIEND_COUNT = 'friend_count',
  EVENT_PARTICIPATION = 'event_participation'
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  spentPoints: number;
  level: number;
  experience: number;
  experienceToNext: number;
  rank: number;
  streak: number;
  lastActivityDate: string;
  pointsHistory: PointsTransaction[];
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: PointsTransactionType;
  amount: number;
  reason: string;
  description?: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
}

export enum PointsTransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  BONUS = 'bonus',
  PENALTY = 'penalty',
  REFUND = 'refund'
}

export interface Level {
  level: number;
  name: string;
  minExperience: number;
  maxExperience: number;
  benefits: LevelBenefit[];
  badge: string;
  color: string;
}

export interface LevelBenefit {
  type: BenefitType;
  description: string;
  value?: number;
}

export enum BenefitType {
  DISCOUNT = 'discount',
  FEATURE_UNLOCK = 'feature_unlock',
  PRIORITY_SUPPORT = 'priority_support',
  EXCLUSIVE_CONTENT = 'exclusive_content',
  BONUS_POINTS = 'bonus_points'
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  type: RewardType;
  category: RewardCategory;
  cost: number;
  availability: number;
  claimed: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  requirements?: RewardRequirement[];
  createdAt: string;
  updatedAt: string;
}

export enum RewardType {
  DISCOUNT = 'discount',
  PRODUCT = 'product',
  SERVICE = 'service',
  DIGITAL = 'digital',
  EXPERIENCE = 'experience'
}

export enum RewardCategory {
  PET_SUPPLIES = 'pet_supplies',
  VETERINARY = 'veterinary',
  GROOMING = 'grooming',
  TRAINING = 'training',
  ENTERTAINMENT = 'entertainment',
  PREMIUM_FEATURES = 'premium_features'
}

export interface RewardRequirement {
  type: 'level' | 'achievement' | 'points';
  value: string | number;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  reward: Reward;
  claimedAt: string;
  usedAt?: string;
  expiresAt?: string;
  status: RewardStatus;
  code?: string;
}

export enum RewardStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  image: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  duration: number; // in days
  startDate: string;
  endDate: string;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  participants: number;
  completions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum ChallengeType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  SPECIAL = 'special'
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface ChallengeRequirement {
  type: string;
  target: string;
  value: number;
  description: string;
}

export interface ChallengeReward {
  type: 'points' | 'achievement' | 'reward';
  value: string | number;
  description: string;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge: Challenge;
  progress: ChallengeProgress[];
  status: ChallengeStatus;
  startedAt: string;
  completedAt?: string;
  rewardsClaimed: boolean;
}

export interface ChallengeProgress {
  requirementId: string;
  current: number;
  target: number;
  completed: boolean;
}

export enum ChallengeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  category?: string;
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export enum LeaderboardType {
  POINTS = 'points',
  ACHIEVEMENTS = 'achievements',
  ACTIVITY = 'activity',
  CHALLENGES = 'challenges'
}

export enum LeaderboardPeriod {
  ALL_TIME = 'all_time',
  YEARLY = 'yearly',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily'
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  score: number;
  change: number; // position change from previous period
}

export interface GamificationStats {
  totalUsers: number;
  activeUsers: number;
  totalPoints: number;
  totalAchievements: number;
  totalRewards: number;
  activeChallenges: number;
  completedChallenges: number;
  averageLevel: number;
  topAchievers: LeaderboardEntry[];
  recentActivities: GamificationActivity[];
}

export interface GamificationActivity {
  id: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  type: ActivityType;
  description: string;
  points?: number;
  achievementId?: string;
  challengeId?: string;
  createdAt: string;
}

export enum ActivityType {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_UP = 'level_up',
  CHALLENGE_COMPLETED = 'challenge_completed',
  REWARD_CLAIMED = 'reward_claimed',
  POINTS_EARNED = 'points_earned'
}

// DTOs
export interface CreateAchievementDTO {
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  type: AchievementType;
  rarity: AchievementRarity;
  points: number;
  requirements: AchievementRequirement[];
  isSecret?: boolean;
}

export interface UpdateAchievementDTO {
  name?: string;
  description?: string;
  icon?: string;
  category?: AchievementCategory;
  type?: AchievementType;
  rarity?: AchievementRarity;
  points?: number;
  requirements?: AchievementRequirement[];
  isSecret?: boolean;
}

export interface CreateRewardDTO {
  name: string;
  description: string;
  image: string;
  type: RewardType;
  category: RewardCategory;
  cost: number;
  availability: number;
  validFrom: string;
  validTo: string;
  requirements?: RewardRequirement[];
}

export interface UpdateRewardDTO {
  name?: string;
  description?: string;
  image?: string;
  type?: RewardType;
  category?: RewardCategory;
  cost?: number;
  availability?: number;
  validFrom?: string;
  validTo?: string;
  requirements?: RewardRequirement[];
  isActive?: boolean;
}

export interface CreateChallengeDTO {
  name: string;
  description: string;
  image: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  duration: number;
  startDate: string;
  endDate: string;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
}

export interface UpdateChallengeDTO {
  name?: string;
  description?: string;
  image?: string;
  type?: ChallengeType;
  difficulty?: ChallengeDifficulty;
  duration?: number;
  startDate?: string;
  endDate?: string;
  requirements?: ChallengeRequirement[];
  rewards?: ChallengeReward[];
  isActive?: boolean;
}

export interface ClaimRewardDTO {
  rewardId: string;
}

export interface JoinChallengeDTO {
  challengeId: string;
}

// Filters
export interface AchievementFilters {
  category?: AchievementCategory;
  type?: AchievementType;
  rarity?: AchievementRarity;
  isUnlocked?: boolean;
  isSecret?: boolean;
  search?: string;
}

export interface RewardFilters {
  type?: RewardType;
  category?: RewardCategory;
  minCost?: number;
  maxCost?: number;
  isActive?: boolean;
  available?: boolean;
  search?: string;
}

export interface ChallengeFilters {
  type?: ChallengeType;
  difficulty?: ChallengeDifficulty;
  status?: ChallengeStatus;
  isActive?: boolean;
  search?: string;
}

export interface LeaderboardFilters {
  type?: LeaderboardType;
  period?: LeaderboardPeriod;
  category?: string;
}

export interface GamificationActivityFilters {
  type?: ActivityType;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}