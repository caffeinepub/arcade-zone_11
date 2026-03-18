import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    username: string;
    message: string;
    timestamp: Time;
}
export type Time = bigint;
export interface ScoreEntry {
    score: bigint;
    timestamp: Time;
    playerName: string;
}
export interface GameMetadata {
    name: string;
    description: string;
    category: string;
}
export interface backendInterface {
    addGame(name: string, description: string, category: string): Promise<void>;
    getGameMetadata(): Promise<Array<GameMetadata>>;
    getRecentMessages(limit: bigint): Promise<Array<ChatMessage>>;
    getTopScores(game: string, limit: bigint): Promise<Array<ScoreEntry>>;
    getTotalPlays(game: string): Promise<bigint>;
    sendMessage(username: string, message: string): Promise<void>;
    submitScore(game: string, playerName: string, score: bigint): Promise<void>;
}
