import { User, InsertUser, Scan, InsertScan } from "@shared/schema";
import { users, scans } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScan(userId: number, scan: InsertScan, results: any): Promise<Scan>;
  getUserScans(userId: number): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createScan(userId: number, scanData: InsertScan, results: any): Promise<Scan> {
    const [scan] = await db
      .insert(scans)
      .values({
        userId,
        url: scanData.url,
        riskScore: results.riskScore,
        isPhishing: results.isPhishing,
        features: JSON.stringify(results.features),
        createdAt: new Date(),
      })
      .returning();
    return scan;
  }

  async getUserScans(userId: number): Promise<Scan[]> {
    return db
      .select()
      .from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(scans.createdAt);
  }

  async getScan(id: number): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }
}

export const storage = new DatabaseStorage();