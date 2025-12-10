// Supabase Configuration
const SUPABASE_URL = 'https://zflnvxibztdvshvxefew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbG52eGlienRkdnNodnhlZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjgwMTIsImV4cCI6MjA4MDk0NDAxMn0.uDDZnAl7ffy3yFfzsXRD77N1tT8dNXZkCKGaDVytgvQ';

// Simple Supabase client for browser
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async from(table) {
        return new SupabaseQuery(this, table);
    }
}

class SupabaseQuery {
    constructor(client, table) {
        this.client = client;
        this.table = table;
        this.queryParams = [];
        this.orderBy = null;
        this.limitNum = null;
    }

    select(columns = '*') {
        this.selectColumns = columns;
        return this;
    }

    eq(column, value) {
        this.queryParams.push(`${column}=eq.${value}`);
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.orderBy = `${column}.${ascending ? 'asc' : 'desc'}`;
        return this;
    }

    limit(num) {
        this.limitNum = num;
        return this;
    }

    async execute() {
        let url = `${this.client.url}/rest/v1/${this.table}`;
        const params = [];

        if (this.selectColumns) params.push(`select=${this.selectColumns}`);
        if (this.queryParams.length > 0) params.push(...this.queryParams);
        if (this.orderBy) params.push(`order=${this.orderBy}`);
        if (this.limitNum) params.push(`limit=${this.limitNum}`);

        if (params.length > 0) url += '?' + params.join('&');

        const response = await fetch(url, {
            method: 'GET',
            headers: this.client.headers
        });

        const data = await response.json();
        return { data, error: response.ok ? null : data };
    }

    async insert(data) {
        const url = `${this.client.url}/rest/v1/${this.table}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.client.headers,
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return { data: result, error: response.ok ? null : result };
    }

    async update(data) {
        let url = `${this.client.url}/rest/v1/${this.table}`;
        if (this.queryParams.length > 0) url += '?' + this.queryParams.join('&');

        console.log('Updating:', url, data);

        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.client.headers,
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Update result:', result, 'Status:', response.status);
        return { data: result, error: response.ok ? null : result };
    }

    async upsert(data) {
        const url = `${this.client.url}/rest/v1/${this.table}`;
        const headers = { ...this.client.headers, 'Prefer': 'resolution=merge-duplicates,return=representation' };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return { data: result, error: response.ok ? null : result };
    }
}

// Leaderboard Manager
export class LeaderboardManager {
    constructor() {
        this.supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.currentPlayer = null;
        this.playerId = null;
    }

    // Get or create player
    async loginPlayer(playerName) {
        playerName = playerName.trim().substring(0, 20); // Max 20 chars

        // Check if player exists
        const query = new SupabaseQuery(this.supabase, 'scores');
        query.eq('player_name', playerName);
        query.selectColumns = '*';
        const { data, error } = await query.execute();

        if (error) {
            console.error('Supabase error:', error);
            return null;
        }

        if (data && data.length > 0) {
            // Existing player
            this.currentPlayer = data[0];
            this.playerId = data[0].id;
            return this.currentPlayer;
        } else {
            // New player
            const insertQuery = new SupabaseQuery(this.supabase, 'scores');
            const { data: newPlayer, error: insertError } = await insertQuery.insert({
                player_name: playerName,
                total_score: 0,
                levels_completed: 0,
                total_stars: 0
            });

            if (insertError) {
                console.error('Insert error:', insertError);
                return null;
            }

            this.currentPlayer = newPlayer[0];
            this.playerId = newPlayer[0].id;
            return this.currentPlayer;
        }
    }

    // Update player score
    async updateScore(totalScore, levelsCompleted, totalStars) {
        if (!this.playerId) return null;

        const query = new SupabaseQuery(this.supabase, 'scores');
        query.eq('id', this.playerId);

        const { data, error } = await query.update({
            total_score: totalScore,
            levels_completed: levelsCompleted,
            total_stars: totalStars
        });

        if (error) {
            console.error('Update error:', error);
            return null;
        }

        this.currentPlayer = data[0];
        return this.currentPlayer;
    }

    // Get top players
    async getLeaderboard(limit = 10) {
        const query = new SupabaseQuery(this.supabase, 'scores');
        query.selectColumns = '*';
        query.orderBy = 'total_score.desc';
        query.limitNum = limit;

        const { data, error } = await query.execute();

        if (error) {
            console.error('Leaderboard error:', error);
            return [];
        }

        return data || [];
    }

    // Get player rank
    async getPlayerRank() {
        if (!this.currentPlayer) return null;

        const leaderboard = await this.getLeaderboard(100);
        const rank = leaderboard.findIndex(p => p.id === this.playerId) + 1;
        return rank > 0 ? rank : null;
    }
}

// Export singleton
export const leaderboard = new LeaderboardManager();
