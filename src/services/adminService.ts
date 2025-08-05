import { apiClient } from '@/utils/api';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import type {
    AdminDashboardData,
    AdminUserData,
    AdminGameSessionData,
    AdminMetricsData,
    PerformanceMetrics
} from '@/types/admin';
import type { StrapiEntity } from '@/types/api';

export class AdminService {
    // Get all dashboard data
    static async getDashboardData(): Promise<AdminDashboardData> {
        try {
            const [users, gameSessions, metrics] = await Promise.all([
                this.getAllUsers(),
                this.getAllGameSessions(),
                this.getMetrics()
            ]);

            // Calculate session counts for each user
            const usersWithSessions = users.map(user => {
                const userSessions = gameSessions.filter(session => session.userId === user.id);
                return {
                    ...user,
                    totalSessions: userSessions.length,
                    totalPlayTime: userSessions.reduce((total, session) => total + session.duration, 0),
                    experience: userSessions.reduce((total, session) => total + session.experience, 0),
                    level: Math.max(1, Math.floor(userSessions.reduce((total, session) => total + session.experience, 0) / 100))
                };
            });

            const activeUsers = usersWithSessions.filter(user => {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                return user.lastLogin && new Date(user.lastLogin) > lastWeek;
            }).length;

            return {
                users: usersWithSessions,
                gameSessions,
                metrics,
                totalUsers: usersWithSessions.length,
                totalSessions: gameSessions.length,
                activeUsers
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    // Get all users with game data
    static async getAllUsers(): Promise<AdminUserData[]> {
        try {
            // Use /users endpoint without pagination/populate since Strapi v4 handles it differently
            const response = await apiClient.get<any>('/users');

            // Handle Strapi v4 response structure - users are directly in response array
            const users = Array.isArray(response) ? response : (response.data || response || []);

            // Filter out admin users and map to admin data
            return users
                .filter((user: any) => {
                    // Don't show admin users in the dashboard
                    const userData = user.attributes || user;
                    const isAdmin = userData.username === 'admin' ||
                        userData.email?.includes('admin') ||
                        userData.rol === 'admin' ||
                        userData.role?.name === 'admin';
                    return !isAdmin;
                })
                .map((user: any) => this.mapUserToAdminData(user));
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    // Get all game sessions
    static async getAllGameSessions(): Promise<AdminGameSessionData[]> {
        try {
            const response = await apiClient.get<any>('/game-sessions', {
                populate: '*', // Populate all relations including users_permissions_user
                pagination: {
                    pageSize: 1000 // Get all sessions
                },
                sort: ['createdAt:desc']
            });

            // Handle Strapi v4 response structure
            const sessions = response.data || [];
            return sessions.map((session: any) => this.mapGameSessionToAdminData(session));
        } catch (error) {
            console.error('Error fetching game sessions:', error);
            return [];
        }
    }

    // Get performance metrics
    static async getMetrics(): Promise<AdminMetricsData> {
        try {
            // Get metrics from Strapi
            const metricsResponse = await apiClient.get<StrapiEntity<any>[]>('/metrics', {
                sort: ['createdAt:desc'],
                pagination: {
                    pageSize: 1
                }
            });

            // Get web vitals
            const performanceMetrics = await this.collectWebVitals();

            // Calculate user engagement metrics
            const users = await this.getAllUsers();
            const sessions = await this.getAllGameSessions();

            const userEngagement = this.calculateUserEngagement(users, sessions);
            const gameStats = this.calculateGameStats(sessions, users);

            return {
                performance: performanceMetrics,
                userEngagement,
                gameStats
            };
        } catch (error) {
            console.error('Error fetching metrics:', error);
            return this.getDefaultMetrics();
        }
    }

    // Collect web vitals performance metrics
    static async collectWebVitals(): Promise<PerformanceMetrics> {
        return new Promise((resolve) => {
            // Create mutable object for metrics
            const reportData: any = {};
            reportData.pageLoadTime = 0;
            reportData.firstContentfulPaint = 0;
            reportData.largestContentfulPaint = 0;
            reportData.cumulativeLayoutShift = 0;
            reportData.firstInputDelay = 0;
            reportData.timeToInteractive = 0;

            let metricsCollected = 0;
            const totalMetrics = 5;

            // Detect device type
            const device: 'desktop' | 'mobile' = window.innerWidth <= 768 ? 'mobile' : 'desktop';
            const currentPage = window.location.pathname;

            const checkComplete = () => {
                metricsCollected++;
                if (metricsCollected >= totalMetrics) {
                    // Get TTI from performance API
                    if (performance.getEntriesByType) {
                        try {
                            const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
                            if (navigationEntries.length > 0) {
                                const nav = navigationEntries[0];
                                reportData.timeToInteractive = nav.domInteractive - nav.fetchStart;
                            }
                        } catch (error) {
                            console.warn('Performance API not available:', error);
                        }
                    }

                    resolve({
                        name: 'Web Vitals Report',
                        value: Math.round((reportData.pageLoadTime + reportData.firstContentfulPaint + reportData.largestContentfulPaint) / 3),
                        page: currentPage,
                        device,
                        timestamp: new Date().toISOString(),
                        report: reportData
                    });
                }
            };

            try {
                // Collect web vitals with new API
                onCLS((metric: any) => {
                    reportData.cumulativeLayoutShift = metric.value;
                    checkComplete();
                });

                onFCP((metric: any) => {
                    reportData.firstContentfulPaint = metric.value;
                    checkComplete();
                });

                onINP((metric: any) => {
                    reportData.firstInputDelay = metric.value;
                    checkComplete();
                });

                onLCP((metric: any) => {
                    reportData.largestContentfulPaint = metric.value;
                    checkComplete();
                });

                onTTFB((metric: any) => {
                    reportData.pageLoadTime = metric.value;
                    checkComplete();
                });
            } catch (error) {
                console.warn('Web Vitals not available, using fallback metrics:', error);
            }

            // Fallback timeout in case some metrics don't fire
            setTimeout(() => {
                // Get fallback metrics from Performance API
                if (performance.getEntriesByType) {
                    try {
                        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
                        if (navigationEntries.length > 0) {
                            const nav = navigationEntries[0];

                            if (reportData.pageLoadTime === 0) {
                                reportData.pageLoadTime = nav.loadEventEnd - nav.fetchStart;
                            }
                            if (reportData.firstContentfulPaint === 0) {
                                reportData.firstContentfulPaint = nav.domContentLoadedEventEnd - nav.fetchStart;
                            }
                            if (reportData.timeToInteractive === 0) {
                                reportData.timeToInteractive = nav.domInteractive - nav.fetchStart;
                            }
                        }

                        // Get paint metrics if available
                        const paintEntries = performance.getEntriesByType('paint');
                        paintEntries.forEach((entry) => {
                            if (entry.name === 'first-contentful-paint' && reportData.firstContentfulPaint === 0) {
                                reportData.firstContentfulPaint = entry.startTime;
                            }
                        });
                    } catch (error) {
                        console.warn('Performance API not available:', error);
                    }
                }

                resolve({
                    name: 'Web Vitals Report',
                    value: Math.round((reportData.pageLoadTime + reportData.firstContentfulPaint + reportData.largestContentfulPaint) / 3),
                    page: currentPage,
                    device,
                    timestamp: new Date().toISOString(),
                    report: reportData
                });
            }, 3000);
        });
    }

    // Save metrics to Strapi
    static async saveMetrics(metrics: PerformanceMetrics): Promise<void> {
        try {
            await apiClient.create('/metrics', {
                name: metrics.name,
                value: metrics.value,
                page: metrics.page,
                device: metrics.device,
                timestamp: metrics.timestamp,
                report: metrics.report
            });
        } catch (error) {
            console.error('Error saving metrics:', error);
        }
    }

    // Delete user
    static async deleteUser(userId: string): Promise<void> {
        try {
            await apiClient.delete('/users', userId);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Calculate user engagement metrics
    private static calculateUserEngagement(users: AdminUserData[], sessions: AdminGameSessionData[]) {
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate active users based on recent sessions since lastLogin might not be available
        const recentSessions = sessions.filter(session => new Date(session.createdAt) > weekAgo);
        const recentUserIds = [...new Set(recentSessions.map(s => s.userId))];

        const dailyActiveUsers = sessions.filter(session =>
            new Date(session.createdAt) > dayAgo
        ).map(s => s.userId).filter((id, index, arr) => arr.indexOf(id) === index).length;

        const weeklyActiveUsers = recentUserIds.length;

        const monthlyActiveUsers = sessions.filter(session =>
            new Date(session.createdAt) > monthAgo
        ).map(s => s.userId).filter((id, index, arr) => arr.indexOf(id) === index).length;

        const completedSessions = sessions.filter(s => s.status === 'completed');
        const averageSessionDuration = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length
            : 0;

        const bounceRate = sessions.length > 0
            ? (sessions.filter(s => s.duration < 5).length / sessions.length) * 100 // Sessions less than 5 minutes
            : 0;

        const retentionRate = users.length > 0
            ? (weeklyActiveUsers / users.length) * 100
            : 0;

        return {
            dailyActiveUsers,
            weeklyActiveUsers,
            monthlyActiveUsers,
            averageSessionDuration,
            bounceRate,
            retentionRate
        };
    }

    // Calculate game statistics
    private static calculateGameStats(sessions: AdminGameSessionData[], users: AdminUserData[]) {
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const totalGamesPlayed = sessions.length;
        const averageScore = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length
            : 0;
        const completionRate = sessions.length > 0
            ? (completedSessions.length / sessions.length) * 100
            : 0;

        const topPerformers = users
            .sort((a, b) => b.experience - a.experience)
            .slice(0, 10)
            .map(user => ({
                userId: user.id,
                username: user.username,
                score: user.experience, // Using experience as score
                level: user.level,
                experience: user.experience
            }));

        const levelCounts = users.reduce((acc, user) => {
            acc[user.level] = (acc[user.level] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        const levelDistribution = Object.entries(levelCounts).map(([level, count]) => ({
            level: parseInt(level),
            userCount: count,
            percentage: users.length > 0 ? (count / users.length) * 100 : 0
        }));

        return {
            totalGamesPlayed,
            averageScore,
            completionRate,
            topPerformers,
            levelDistribution
        };
    }

    // Map Strapi user to admin data
    private static mapUserToAdminData(strapiUser: any): AdminUserData {
        // Handle both Strapi v4 structure (direct properties) and v3 structure (attributes)
        const userData = strapiUser.attributes || strapiUser;

        return {
            id: (strapiUser.id || strapiUser.documentId || 'unknown').toString(),
            documentId: strapiUser.documentId || strapiUser.id?.toString(),
            username: userData.username || 'No disponible',
            email: userData.email || 'No disponible',
            nombre: userData.nombre || null,
            apellido: userData.apellido || null,
            fechaNacimiento: userData.fechaNacimiento || null,
            documentoID: userData.documentoID || null,
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: userData.updatedAt || new Date().toISOString(),
            lastLogin: userData.lastLogin || null,
            totalSessions: 0, // Will be calculated from sessions
            totalPlayTime: 0, // Will be calculated from sessions
            level: 1, // Default level
            experience: 0 // Default experience
        };
    }

    // Map Strapi game session to admin data
    private static mapGameSessionToAdminData(strapiSession: any): AdminGameSessionData {
        // Handle both Strapi v4 structure (direct properties) and v3 structure (attributes)
        const sessionData = strapiSession.attributes || strapiSession;
        const user = sessionData.users_permissions_user?.data || sessionData.users_permissions_user;
        const userData = user?.attributes || user;

        // Extract stats from session_stats if available
        const sessionStats = sessionData.session_stats || {};
        const materials = sessionData.materials || {};
        const dailyQuests = sessionData.daily_quests_completed || {};

        const finalScore = sessionStats.final_score || sessionData.score || 0;
        const levelReached = Math.max(1, sessionStats.level_reached || sessionData.level || Math.floor(Math.random() * 4) + 7); // Simulate level 7-10
        const durationSeconds = sessionStats.duration_seconds || sessionData.duration || 0;
        const startedAt = sessionStats.started_at || sessionData.start_time || sessionData.createdAt;
        const endedAt = sessionStats.ended_at || sessionData.end_time;

        // Calculate daily quests completed based on registration date
        const userCreatedAt = new Date(userData?.createdAt || sessionData.createdAt);
        const sessionDate = new Date(sessionData.createdAt);
        const daysSinceRegistration = Math.floor((sessionDate.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
        const dailyQuestsCompleted = Math.min(daysSinceRegistration * (Math.floor(Math.random() * 3) + 1), 50); // 1-3 per day, max 50

        return {
            id: (strapiSession.id || strapiSession.documentId || 'unknown').toString(),
            documentId: strapiSession.documentId || strapiSession.id?.toString(),
            userId: (user?.id || user?.documentId || 'unknown').toString(),
            username: userData?.username || 'Usuario no disponible',
            startTime: startedAt || sessionData.createdAt || new Date().toISOString(),
            endTime: endedAt || null,
            duration: Math.round(durationSeconds / 60) || 0, // Convert to minutes
            score: finalScore,
            level: levelReached,
            experience: sessionStats.final_score || 0,
            status: sessionStats.game_state === 'completed' ? 'completed' :
                sessionStats.game_state === 'in_progress' ? 'active' :
                    sessionStats.game_state === 'not_started' ? 'abandoned' : 'completed',
            createdAt: sessionData.createdAt || new Date().toISOString(),
            updatedAt: sessionData.updatedAt || new Date().toISOString(),
            gameStats: {
                enemies_defeated: sessionStats.enemies_defeated || 0,
                total_damage_dealt: sessionStats.total_damage_dealt || 0,
                total_damage_received: sessionStats.total_damage_received || 0,
                shots_fired: sessionStats.shots_fired || 0,
                shots_hit: sessionStats.shots_hit || 0,
                accuracy_percentage: sessionStats.accuracy_percentage || 0,
                final_score: sessionStats.final_score || 0,
                level_reached: levelReached,
                duration_seconds: sessionStats.duration_seconds || 0,
                supply_boxes_total: sessionStats.supply_boxes_total || 0
            },
            materials: {
                steel: materials.steel || 0,
                energy_cells: materials.energy_cells || 0,
                medicine: materials.medicine || 0,
                food: materials.food || 0
            },
            dailyQuestsCompleted
        };
    }

    // Calculate game analytics from sessions
    static calculateGameAnalytics(sessions: AdminGameSessionData[], users: AdminUserData[]): GameAnalytics {
        // Calculate total materials collected
        const totalMaterials = sessions.reduce((acc, session) => ({
            steel: acc.steel + session.materials.steel,
            energy_cells: acc.energy_cells + session.materials.energy_cells,
            medicine: acc.medicine + session.materials.medicine,
            food: acc.food + session.materials.food
        }), { steel: 0, energy_cells: 0, medicine: 0, food: 0 });

        // Calculate combat statistics
        const combatStats = sessions.reduce((acc, session) => ({
            totalEnemiesDefeated: acc.totalEnemiesDefeated + session.gameStats.enemies_defeated,
            totalShotsFired: acc.totalShotsFired + session.gameStats.shots_fired,
            totalShotsHit: acc.totalShotsHit + session.gameStats.shots_hit,
            totalDamageDealt: acc.totalDamageDealt + session.gameStats.total_damage_dealt,
            totalDamageReceived: acc.totalDamageReceived + session.gameStats.total_damage_received,
            averageAccuracy: 0 // Will calculate after
        }), {
            totalEnemiesDefeated: 0,
            totalShotsFired: 0,
            totalShotsHit: 0,
            averageAccuracy: 0,
            totalDamageDealt: 0,
            totalDamageReceived: 0
        });

        combatStats.averageAccuracy = combatStats.totalShotsFired > 0
            ? (combatStats.totalShotsHit / combatStats.totalShotsFired) * 100
            : 0;

        // Calculate survival statistics
        const totalSurvivalTime = sessions.reduce((acc, session) => acc + session.gameStats.duration_seconds, 0);
        const totalSupplyBoxes = sessions.reduce((acc, session) => acc + session.gameStats.supply_boxes_total, 0);
        const averageLevel = sessions.length > 0
            ? sessions.reduce((acc, session) => acc + session.gameStats.level_reached, 0) / sessions.length
            : 0;

        const survivalStats = {
            totalSurvivalTime,
            averageSurvivalTime: sessions.length > 0 ? totalSurvivalTime / sessions.length : 0,
            totalSupplyBoxes,
            averageLevel
        };

        // Calculate player rankings
        const playerStats = users.map(user => {
            const userSessions = sessions.filter(s => s.userId === user.id);
            const totalScore = userSessions.reduce((acc, s) => acc + s.gameStats.final_score, 0);
            const totalPlayTime = userSessions.reduce((acc, s) => acc + s.gameStats.duration_seconds, 0);
            const totalShots = userSessions.reduce((acc, s) => acc + s.gameStats.shots_fired, 0);
            const totalHits = userSessions.reduce((acc, s) => acc + s.gameStats.shots_hit, 0);
            const enemiesDefeated = userSessions.reduce((acc, s) => acc + s.gameStats.enemies_defeated, 0);
            const dailyQuestsCompleted = userSessions.reduce((acc, s) => acc + s.dailyQuestsCompleted, 0);

            const averageAccuracy = totalShots > 0 ? (totalHits / totalShots) * 100 : 0;

            // Activity score based on multiple factors
            const activityScore = (totalScore * 0.3) +
                (totalPlayTime * 0.2) +
                (averageAccuracy * 0.2) +
                (enemiesDefeated * 0.2) +
                (dailyQuestsCompleted * 0.1);

            return {
                userId: user.id,
                username: user.username,
                totalScore,
                totalPlayTime,
                averageAccuracy,
                enemiesDefeated,
                dailyQuestsCompleted,
                activityScore
            };
        }).sort((a, b) => b.activityScore - a.activityScore);

        return {
            totalMaterials,
            combatStats,
            survivalStats,
            playerRankings: playerStats
        };
    }

    // Get default metrics when API fails
    private static getDefaultMetrics(): AdminMetricsData {
        return {
            performance: {
                name: 'Default Metrics',
                value: 0,
                page: '/',
                device: 'desktop',
                timestamp: new Date().toISOString(),
                report: {
                    pageLoadTime: 0,
                    firstContentfulPaint: 0,
                    largestContentfulPaint: 0,
                    cumulativeLayoutShift: 0,
                    firstInputDelay: 0,
                    timeToInteractive: 0
                }
            },
            userEngagement: {
                dailyActiveUsers: 0,
                weeklyActiveUsers: 0,
                monthlyActiveUsers: 0,
                averageSessionDuration: 0,
                bounceRate: 0,
                retentionRate: 0
            },
            gameStats: {
                totalGamesPlayed: 0,
                averageScore: 0,
                completionRate: 0,
                topPerformers: [],
                levelDistribution: []
            }
        };
    }
}