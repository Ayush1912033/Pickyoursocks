import {
    FEED_ITEMS,
    MATCH_OPPORTUNITIES,
    NEARBY_USERS,
    MATCH_RESULTS,
    FeedItem,
    MatchOpportunity,
    NearbyUser,
    MatchResult
} from '../constants';
import { supabase } from '../lib/supabase';

// Simulated network delay to test loading states (in milliseconds)
const SIMULATED_DELAY = 800;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    /**
     * Fetch the main activity feed (posts, match requests, events)
     */
    getFeed: async (): Promise<FeedItem[]> => {
        await delay(SIMULATED_DELAY);
        return FEED_ITEMS;
    },

    /**
     * Fetch "Radar" match opportunities
     */
    getRadarMatches: async (): Promise<MatchOpportunity[]> => {
        await delay(SIMULATED_DELAY);
        return MATCH_OPPORTUNITIES;
    },

    /**
     * Fetch users nearby (for People Near You / Rankings)
     */
    /**
     * Fetch users nearby (for People Near You / Rankings)
     */
    getNearbyUsers: async (): Promise<NearbyUser[]> => {
        const { data, error } = await supabase.rpc('get_rankings');

        if (error) {
            console.error('Error fetching rankings:', error);
            throw error;
        }

        return (data || []).map((user: any) => ({
            id: user.id,
            name: user.name || user.username || 'Athlete',
            sport: user.sports && user.sports.length > 0 ? user.sports[0] : 'Athlete',
            distance: '1.2 miles', // Placeholder as distance isn't calculated yet
            rank: user.rank,
            image: user.profile_photo || 'https://i.pravatar.cc/150?u=' + user.id,
            points: user.elo,
            tier: user.level || 'Unranked'
        }));
    },

    /**
     * Fetch live match results for the ticker
     */
    getMatchResults: async (): Promise<MatchResult[]> => {
        await delay(SIMULATED_DELAY);
        return MATCH_RESULTS;
    },

    /**
     * Fetch match history for a specific user
     */
    getMatchHistory: async (userId: string): Promise<any[]> => {
        const { data, error } = await supabase
            .from('match_requests')
            .select(`
                *,
                challenger:profiles!match_requests_user_id_fkey (id, name, profile_photo, elo),
                opponent:profiles!match_requests_opponent_id_fkey (id, name, profile_photo, elo),
                acceptor:profiles!match_requests_accepted_by_fkey (id, name, profile_photo, elo),
                result:match_results(
                    winner_id,
                    score,
                    is_verified
                )
            `)
            .eq('status', 'completed')
            .or(`user_id.eq.${userId},accepted_by.eq.${userId},opponent_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching match history:', error);
            throw error;
        }

        return data || [];
    }
};
