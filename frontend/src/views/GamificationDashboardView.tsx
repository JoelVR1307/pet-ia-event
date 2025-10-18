import React, { useState, useEffect } from 'react';
import type { 
  Achievement, 
  Reward, 
  Challenge, 
  UserPoints, 
  LeaderboardEntry, 
  LeaderboardType, 
  LeaderboardPeriod,
  ChallengeType,
  RewardCategory,
  UserChallenge,
  UserReward
} from '../types/gamification.types';
import { gamificationService } from '../services/gamification.service';
import AchievementCard, { AchievementGrid, AchievementStats } from '../components/gamification/AchievementCard';
import RewardCard, { RewardGrid } from '../components/gamification/RewardCard';
import ChallengeCard, { ChallengeGrid } from '../components/gamification/ChallengeCard';
import LeaderboardTable from '../components/gamification/LeaderboardTable';
import { LoadingSpinner, PageLoader } from '../components/common/LoadingSpinner';

const GamificationDashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'rewards' | 'challenges' | 'leaderboard'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Filter states
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(LeaderboardType.POINTS);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>(LeaderboardPeriod.WEEKLY);
  const [challengeFilter, setChallengeFilter] = useState<ChallengeType | 'all'>('all');
  const [rewardFilter, setRewardFilter] = useState<RewardCategory | 'all'>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType, leaderboardPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        pointsData,
        achievementsData,
        userAchievementsData,
        rewardsData,
        userRewardsData,
        challengesData,
        userChallengesData
      ] = await Promise.all([
        gamificationService.getUserPoints(),
        gamificationService.getAchievements({ limit: 20 }),
        gamificationService.getUserAchievements(),
        gamificationService.getRewards({ limit: 20 }),
        gamificationService.getUserRewards(),
        gamificationService.getChallenges({ limit: 20 }),
        gamificationService.getUserChallenges()
      ]);

      setUserPoints(pointsData);
      setAchievements(achievementsData.achievements);
      setUserAchievements(userAchievementsData.achievements);
      setRewards(rewardsData.rewards);
      setUserRewards(userRewardsData.rewards);
      setChallenges(challengesData.challenges);
      setUserChallenges(userChallengesData.challenges);

    } catch (err) {
      setError('Error al cargar los datos de gamificación');
      console.error('Error loading gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await gamificationService.getLeaderboard({
        type: leaderboardType,
        period: leaderboardPeriod,
        limit: 50
      });
      setLeaderboard(data.entries);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  const handleClaimReward = async (reward: Reward) => {
    try {
      await gamificationService.claimReward(reward.id);
      // Reload user rewards and points
      const [userRewardsData, pointsData] = await Promise.all([
        gamificationService.getUserRewards(),
        gamificationService.getUserPoints()
      ]);
      setUserRewards(userRewardsData.rewards);
      setUserPoints(pointsData);
    } catch (err) {
      console.error('Error claiming reward:', err);
    }
  };

  const handleUseReward = async (userReward: UserReward) => {
    try {
      await gamificationService.useReward(userReward.id);
      // Reload user rewards
      const userRewardsData = await gamificationService.getUserRewards();
      setUserRewards(userRewardsData.rewards);
    } catch (err) {
      console.error('Error using reward:', err);
    }
  };

  const handleJoinChallenge = async (challenge: Challenge) => {
    try {
      await gamificationService.joinChallenge(challenge.id);
      // Reload user challenges
      const userChallengesData = await gamificationService.getUserChallenges();
      setUserChallenges(userChallengesData.challenges);
    } catch (err) {
      console.error('Error joining challenge:', err);
    }
  };

  const handleCompleteChallenge = async (userChallenge: UserChallenge) => {
    try {
      await gamificationService.completeChallenge(userChallenge.id);
      // Reload user challenges and points
      const [userChallengesData, pointsData] = await Promise.all([
        gamificationService.getUserChallenges(),
        gamificationService.getUserPoints()
      ]);
      setUserChallenges(userChallengesData.challenges);
      setUserPoints(pointsData);
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
  };

  const getFilteredChallenges = () => {
    if (challengeFilter === 'all') return challenges;
    return challenges.filter(challenge => challenge.type === challengeFilter);
  };

  const getFilteredRewards = () => {
    if (rewardFilter === 'all') return rewards;
    return rewards.filter(reward => reward.category === rewardFilter);
  };

  const getOverviewStats = () => {
    const totalAchievements = achievements.length;
    const unlockedAchievements = userAchievements.length;
    const activeChallenges = userChallenges.filter(uc => uc.status === 'IN_PROGRESS').length;
    const availableRewards = rewards.filter(r => r.availability > r.claimed).length;

    return {
      totalPoints: userPoints?.totalPoints || 0,
      level: userPoints?.level || 1,
      achievementProgress: totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0,
      activeChallenges,
      availableRewards
    };
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const stats = getOverviewStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gamificación</h1>
          <p className="text-gray-600">Gana puntos, desbloquea logros y compite con otros usuarios</p>
        </div>

        {/* User Stats Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalPoints.toLocaleString()}</div>
              <div className="text-blue-100">Puntos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">Nivel {stats.level}</div>
              <div className="text-blue-100">Nivel Actual</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.achievementProgress.toFixed(0)}%</div>
              <div className="text-blue-100">Logros Completados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.activeChallenges}</div>
              <div className="text-blue-100">Desafíos Activos</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen', icon: '📊' },
              { id: 'achievements', name: 'Logros', icon: '🏆' },
              { id: 'rewards', name: 'Recompensas', icon: '🎁' },
              { id: 'challenges', name: 'Desafíos', icon: '⚡' },
              { id: 'leaderboard', name: 'Clasificación', icon: '🏅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Achievements */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Logros Recientes</h2>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todos →
                </button>
              </div>
              <AchievementGrid
                achievements={achievements.slice(0, 6)}
                userAchievements={userAchievements}
                size="sm"
              />
            </div>

            {/* Active Challenges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Desafíos Activos</h2>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver todos →
                </button>
              </div>
              <ChallengeGrid
                challenges={challenges.filter(c => userChallenges.some(uc => uc.challengeId === c.id)).slice(0, 3)}
                userChallenges={userChallenges}
                onJoin={handleJoinChallenge}
                onComplete={handleCompleteChallenge}
                size="sm"
              />
            </div>

            {/* Top Leaderboard */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Top Clasificación</h2>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver completa →
                </button>
              </div>
              <LeaderboardTable
                entries={leaderboard}
                type={leaderboardType}
                period={leaderboardPeriod}
                showFilters={false}
                maxEntries={5}
              />
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <AchievementStats
              totalAchievements={achievements.length}
              unlockedAchievements={userAchievements.length}
              totalPoints={userPoints?.totalPoints || 0}
              recentAchievements={userAchievements.slice(0, 3)}
            />
            <AchievementGrid
              achievements={achievements}
              userAchievements={userAchievements}
            />
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recompensas Disponibles</h2>
              <select
                value={rewardFilter}
                onChange={(e) => setRewardFilter(e.target.value as RewardCategory | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las categorías</option>
                <option value={RewardCategory.PET_SUPPLIES}>Suministros para mascotas</option>
                <option value={RewardCategory.VETERINARY}>Veterinario</option>
                <option value={RewardCategory.GROOMING}>Peluquería</option>
                <option value={RewardCategory.TRAINING}>Entrenamiento</option>
                <option value={RewardCategory.ENTERTAINMENT}>Entretenimiento</option>
                <option value={RewardCategory.PREMIUM_FEATURES}>Funciones Premium</option>
              </select>
            </div>
            
            <RewardGrid
              rewards={getFilteredRewards()}
              userRewards={userRewards}
              userPoints={userPoints?.totalPoints || 0}
              onClaim={handleClaimReward}
              onUse={handleUseReward}
            />
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Desafíos</h2>
              <select
                value={challengeFilter}
                onChange={(e) => setChallengeFilter(e.target.value as ChallengeType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value={ChallengeType.DAILY}>Diarios</option>
                <option value={ChallengeType.WEEKLY}>Semanales</option>
                <option value={ChallengeType.MONTHLY}>Mensuales</option>
                <option value={ChallengeType.SPECIAL}>Especiales</option>
                <option value={ChallengeType.COMMUNITY}>Comunitarios</option>
              </select>
            </div>
            
            <ChallengeGrid
              challenges={getFilteredChallenges()}
              userChallenges={userChallenges}
              onJoin={handleJoinChallenge}
              onComplete={handleCompleteChallenge}
            />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTable
            entries={leaderboard}
            type={leaderboardType}
            period={leaderboardPeriod}
            currentUserId={userPoints?.userId}
            onTypeChange={setLeaderboardType}
            onPeriodChange={setLeaderboardPeriod}
            showFilters={true}
          />
        )}
      </div>
    </div>
  );
};

export default GamificationDashboardView;