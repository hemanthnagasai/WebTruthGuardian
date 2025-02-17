import { User, InsertUser, Scan, InsertScan } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScan(userId: number, scan: InsertScan, results: any): Promise<Scan>;
  getUserScans(userId: number): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scans: Map<number, Scan>;
  private currentUserId: number;
  private currentScanId: number;
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.currentUserId = 1;
    this.currentScanId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScan(userId: number, scanData: InsertScan, results: any): Promise<Scan> {
    const id = this.currentScanId++;
    const scan: Scan = {
      id,
      userId,
      url: scanData.url,
      riskScore: results.riskScore,
      isPhishing: results.isPhishing,
      createdAt: new Date(),
      features: JSON.stringify(results.features),
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getUserScans(userId: number): Promise<Scan[]> {
    return Array.from(this.scans.values()).filter(
      (scan) => scan.userId === userId,
    );
  }

  async getScan(id: number): Promise<Scan | undefined> {
    return this.scans.get(id);
  }
}

export const storage = new MemStorage();
