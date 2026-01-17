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
    getNearbyUsers: async (): Promise<NearbyUser[]> => {
        await delay(SIMULATED_DELAY);
        return NEARBY_USERS;
    },

    /**
     * Fetch live match results for the ticker
     */
    getMatchResults: async (): Promise<MatchResult[]> => {
        await delay(SIMULATED_DELAY);
        return MATCH_RESULTS;
    }
};
