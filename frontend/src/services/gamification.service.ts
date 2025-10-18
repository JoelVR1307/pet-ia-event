import axios, { type AxiosResponse } from 'axios';
import type {
  Achievement,
  UserPoints,
  Reward,
  UserReward,
  Challenge,
  UserChallenge,
  Leaderboard,
  GamificationStats,
  GamificationActivity,
  CreateAchievementDTO,
  UpdateAchievementDTO,
  CreateRewardDTO,
  UpdateRewardDTO,
  CreateChallengeDTO,
  UpdateChallengeDTO,
  ClaimRewardDTO,
  JoinChallengeDTO,
  AchievementFilters,
  RewardFilters,
  ChallengeFilters,
  LeaderboardFilters,
  GamificationActivityFilters,
  Level,
  PointsTransaction
} from '../types/gamification.types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class GamificationService {
  private baseURL = `${API_BASE_URL}/gamification`;

  // Achievements
  async getAchievements(filters?: AchievementFilters): Promise<Achievement[]> {
    try {
      const response: AxiosResponse<Achievement[]> = await axios.get(`${this.baseURL}/achievements`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: string, filters?: AchievementFilters): Promise<Achievement[]> {
    try {
      const response: AxiosResponse<Achievement[]> = await axios.get(`${this.baseURL}/users/${userId}/achievements`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  async getAchievementById(id: string): Promise<Achievement> {
    try {
      const response: AxiosResponse<Achievement> = await axios.get(`${this.baseURL}/achievements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievement:', error);
      throw error;
    }
  }

  async createAchievement(data: CreateAchievementDTO): Promise<Achievement> {
    try {
      const response: AxiosResponse<Achievement> = await axios.post(`${this.baseURL}/achievements`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  }

  async updateAchievement(id: string, data: UpdateAchievementDTO): Promise<Achievement> {
    try {
      const response: AxiosResponse<Achievement> = await axios.put(`${this.baseURL}/achievements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating achievement:', error);
      throw error;
    }
  }

  async deleteAchievement(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/achievements/${id}`);
    } catch (error) {
      console.error('Error deleting achievement:', error);
      throw error;
    }
  }

  async checkAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response: AxiosResponse<Achievement[]> = await axios.post(`${this.baseURL}/users/${userId}/check-achievements`);
      return response.data;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Points and Levels
  async getUserPoints(userId: string): Promise<UserPoints> {
    try {
      const response: AxiosResponse<UserPoints> = await axios.get(`${this.baseURL}/users/${userId}/points`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user points:', error);
      throw error;
    }
  }

  async addPoints(userId: string, amount: number, reason: string, relatedId?: string, relatedType?: string): Promise<UserPoints> {
    try {
      const response: AxiosResponse<UserPoints> = await axios.post(`${this.baseURL}/users/${userId}/points`, {
        amount,
        reason,
        relatedId,
        relatedType
      });
      return response.data;
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  async spendPoints(userId: string, amount: number, reason: string, relatedId?: string, relatedType?: string): Promise<UserPoints> {
    try {
      const response: AxiosResponse<UserPoints> = await axios.post(`${this.baseURL}/users/${userId}/points/spend`, {
        amount,
        reason,
        relatedId,
        relatedType
      });
      return response.data;
    } catch (error) {
      console.error('Error spending points:', error);
      throw error;
    }
  }

  async getPointsHistory(userId: string, limit?: number, offset?: number): Promise<PointsTransaction[]> {
    try {
      const response: AxiosResponse<PointsTransaction[]> = await axios.get(`${this.baseURL}/users/${userId}/points/history`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching points history:', error);
      throw error;
    }
  }

  async getLevels(): Promise<Level[]> {
    try {
      const response: AxiosResponse<Level[]> = await axios.get(`${this.baseURL}/levels`);
      return response.data;
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw error;
    }
  }

  async getUserLevel(userId: string): Promise<Level> {
    try {
      const response: AxiosResponse<Level> = await axios.get(`${this.baseURL}/users/${userId}/level`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user level:', error);
      throw error;
    }
  }

  // Rewards
  async getRewards(filters?: RewardFilters): Promise<Reward[]> {
    try {
      const response: AxiosResponse<Reward[]> = await axios.get(`${this.baseURL}/rewards`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  }

  async getRewardById(id: string): Promise<Reward> {
    try {
      const response: AxiosResponse<Reward> = await axios.get(`${this.baseURL}/rewards/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reward:', error);
      throw error;
    }
  }

  async createReward(data: CreateRewardDTO): Promise<Reward> {
    try {
      const response: AxiosResponse<Reward> = await axios.post(`${this.baseURL}/rewards`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating reward:', error);
      throw error;
    }
  }

  async updateReward(id: string, data: UpdateRewardDTO): Promise<Reward> {
    try {
      const response: AxiosResponse<Reward> = await axios.put(`${this.baseURL}/rewards/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating reward:', error);
      throw error;
    }
  }

  async deleteReward(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/rewards/${id}`);
    } catch (error) {
      console.error('Error deleting reward:', error);
      throw error;
    }
  }

  async claimReward(data: ClaimRewardDTO): Promise<UserReward> {
    try {
      const response: AxiosResponse<UserReward> = await axios.post(`${this.baseURL}/rewards/claim`, data);
      return response.data;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  async getUserRewards(userId: string): Promise<UserReward[]> {
    try {
      const response: AxiosResponse<UserReward[]> = await axios.get(`${this.baseURL}/users/${userId}/rewards`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      throw error;
    }
  }

  async useReward(userRewardId: string): Promise<UserReward> {
    try {
      const response: AxiosResponse<UserReward> = await axios.post(`${this.baseURL}/user-rewards/${userRewardId}/use`);
      return response.data;
    } catch (error) {
      console.error('Error using reward:', error);
      throw error;
    }
  }

  // Challenges
  async getChallenges(filters?: ChallengeFilters): Promise<Challenge[]> {
    try {
      const response: AxiosResponse<Challenge[]> = await axios.get(`${this.baseURL}/challenges`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  async getChallengeById(id: string): Promise<Challenge> {
    try {
      const response: AxiosResponse<Challenge> = await axios.get(`${this.baseURL}/challenges/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  }

  async createChallenge(data: CreateChallengeDTO): Promise<Challenge> {
    try {
      const response: AxiosResponse<Challenge> = await axios.post(`${this.baseURL}/challenges`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  async updateChallenge(id: string, data: UpdateChallengeDTO): Promise<Challenge> {
    try {
      const response: AxiosResponse<Challenge> = await axios.put(`${this.baseURL}/challenges/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  }

  async deleteChallenge(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/challenges/${id}`);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  }

  async joinChallenge(data: JoinChallengeDTO): Promise<UserChallenge> {
    try {
      const response: AxiosResponse<UserChallenge> = await axios.post(`${this.baseURL}/challenges/join`, data);
      return response.data;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  async getUserChallenges(userId: string, filters?: ChallengeFilters): Promise<UserChallenge[]> {
    try {
      const response: AxiosResponse<UserChallenge[]> = await axios.get(`${this.baseURL}/users/${userId}/challenges`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      throw error;
    }
  }

  async updateChallengeProgress(userChallengeId: string): Promise<UserChallenge> {
    try {
      const response: AxiosResponse<UserChallenge> = await axios.post(`${this.baseURL}/user-challenges/${userChallengeId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  }

  async claimChallengeRewards(userChallengeId: string): Promise<UserChallenge> {
    try {
      const response: AxiosResponse<UserChallenge> = await axios.post(`${this.baseURL}/user-challenges/${userChallengeId}/claim-rewards`);
      return response.data;
    } catch (error) {
      console.error('Error claiming challenge rewards:', error);
      throw error;
    }
  }

  // Leaderboards
  async getLeaderboards(filters?: LeaderboardFilters): Promise<Leaderboard[]> {
    try {
      const response: AxiosResponse<Leaderboard[]> = await axios.get(`${this.baseURL}/leaderboards`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      throw error;
    }
  }

  async getLeaderboard(type: string, period: string, category?: string): Promise<Leaderboard> {
    try {
      const response: AxiosResponse<Leaderboard> = await axios.get(`${this.baseURL}/leaderboards/${type}/${period}`, {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  async getUserRank(userId: string, type: string, period: string, category?: string): Promise<number> {
    try {
      const response: AxiosResponse<{ rank: number }> = await axios.get(`${this.baseURL}/users/${userId}/rank`, {
        params: { type, period, category }
      });
      return response.data.rank;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      throw error;
    }
  }

  // Statistics and Activities
  async getGamificationStats(): Promise<GamificationStats> {
    try {
      const response: AxiosResponse<GamificationStats> = await axios.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      throw error;
    }
  }

  async getGamificationActivities(filters?: GamificationActivityFilters): Promise<GamificationActivity[]> {
    try {
      const response: AxiosResponse<GamificationActivity[]> = await axios.get(`${this.baseURL}/activities`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching gamification activities:', error);
      throw error;
    }
  }

  async getUserActivities(userId: string, filters?: GamificationActivityFilters): Promise<GamificationActivity[]> {
    try {
      const response: AxiosResponse<GamificationActivity[]> = await axios.get(`${this.baseURL}/users/${userId}/activities`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  // Utility methods
  async triggerAction(userId: string, action: string, data?: any): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/users/${userId}/trigger`, {
        action,
        data
      });
    } catch (error) {
      console.error('Error triggering action:', error);
      throw error;
    }
  }

  async recalculateUserStats(userId: string): Promise<UserPoints> {
    try {
      const response: AxiosResponse<UserPoints> = await axios.post(`${this.baseURL}/users/${userId}/recalculate`);
      return response.data;
    } catch (error) {
      console.error('Error recalculating user stats:', error);
      throw error;
    }
  }

  async resetUserProgress(userId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/users/${userId}/reset`);
    } catch (error) {
      console.error('Error resetting user progress:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkCreateAchievements(achievements: CreateAchievementDTO[]): Promise<Achievement[]> {
    try {
      const response: AxiosResponse<Achievement[]> = await axios.post(`${this.baseURL}/achievements/bulk`, {
        achievements
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating achievements:', error);
      throw error;
    }
  }

  async bulkCreateRewards(rewards: CreateRewardDTO[]): Promise<Reward[]> {
    try {
      const response: AxiosResponse<Reward[]> = await axios.post(`${this.baseURL}/rewards/bulk`, {
        rewards
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating rewards:', error);
      throw error;
    }
  }

  async bulkCreateChallenges(challenges: CreateChallengeDTO[]): Promise<Challenge[]> {
    try {
      const response: AxiosResponse<Challenge[]> = await axios.post(`${this.baseURL}/challenges/bulk`, {
        challenges
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk creating challenges:', error);
      throw error;
    }
  }

  // Export data
  async exportUserData(userId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/users/${userId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  async exportGamificationData(): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting gamification data:', error);
      throw error;
    }
  }
}

export const gamificationService = new GamificationService();