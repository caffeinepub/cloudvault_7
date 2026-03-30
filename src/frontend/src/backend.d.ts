import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface FileMeta {
    blob: ExternalBlob;
    fileName: string;
    fileType: FileType;
    uploadDate: Time;
}
export interface UserProfile {
    username: string;
}
export enum FileType {
    video = "video",
    image = "image",
    document = "document",
    other = "other"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteFile(fileName: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listFiles(): Promise<Array<FileMeta>>;
    register(username: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadFile(fileName: string, fileType: FileType, externalBlob: ExternalBlob): Promise<void>;
}
