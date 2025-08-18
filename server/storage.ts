import {
  users,
  trainers,
  classes,
  classSchedules,
  classBookings,
  personalTrainingSessions,
  payments,
  type User,
  type UpsertUser,
  type Trainer,
  type Class,
  type ClassSchedule,
  type ClassBooking,
  type PersonalTrainingSession,
  type Payment,
  type InsertTrainer,
  type InsertClass,
  type InsertClassSchedule,
  type InsertClassBooking,
  type InsertPersonalTrainingSession,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Trainer operations
  getTrainers(): Promise<Trainer[]>;
  getTrainerByUserId(userId: string): Promise<Trainer | undefined>;
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  updateTrainer(id: string, trainer: Partial<InsertTrainer>): Promise<Trainer>;

  // Class operations
  getClasses(): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;

  // Class schedule operations
  getClassSchedules(date?: Date): Promise<ClassSchedule[]>;
  getClassSchedule(id: string): Promise<ClassSchedule | undefined>;
  createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule>;
  updateClassSchedule(id: string, schedule: Partial<InsertClassSchedule>): Promise<ClassSchedule>;

  // Booking operations
  getUserBookings(userId: string): Promise<ClassBooking[]>;
  createClassBooking(booking: InsertClassBooking): Promise<ClassBooking>;
  updateClassBooking(id: string, booking: Partial<InsertClassBooking>): Promise<ClassBooking>;
  cancelClassBooking(id: string): Promise<void>;

  // Personal training operations
  getPersonalTrainingSessions(userId: string, isTrainer?: boolean): Promise<PersonalTrainingSession[]>;
  createPersonalTrainingSession(session: InsertPersonalTrainingSession): Promise<PersonalTrainingSession>;
  updatePersonalTrainingSession(id: string, session: Partial<InsertPersonalTrainingSession>): Promise<PersonalTrainingSession>;

  // Payment operations
  getUserPayments(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;

  // Analytics for admin
  getBookingStats(): Promise<any>;
  getRevenueStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Trainer operations
  async getTrainers(): Promise<Trainer[]> {
    return await db.select().from(trainers).where(eq(trainers.isActive, true));
  }

  async getTrainerByUserId(userId: string): Promise<Trainer | undefined> {
    const [trainer] = await db.select().from(trainers).where(eq(trainers.userId, userId));
    return trainer;
  }

  async createTrainer(trainer: InsertTrainer): Promise<Trainer> {
    const [newTrainer] = await db.insert(trainers).values(trainer).returning();
    return newTrainer;
  }

  async updateTrainer(id: string, trainer: Partial<InsertTrainer>): Promise<Trainer> {
    const [updatedTrainer] = await db
      .update(trainers)
      .set(trainer)
      .where(eq(trainers.id, id))
      .returning();
    return updatedTrainer;
  }

  // Class operations
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.isActive, true));
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [classData] = await db.select().from(classes).where(eq(classes.id, id));
    return classData;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db
      .update(classes)
      .set(classData)
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  // Class schedule operations
  async getClassSchedules(date?: Date): Promise<ClassSchedule[]> {
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return await db
        .select()
        .from(classSchedules)
        .where(
          and(
            gte(classSchedules.startTime, startOfDay),
            gte(endOfDay, classSchedules.startTime)
          )
        )
        .orderBy(classSchedules.startTime);
    }
    
    return await db.select().from(classSchedules).orderBy(classSchedules.startTime);
  }

  async getClassSchedule(id: string): Promise<ClassSchedule | undefined> {
    const [schedule] = await db.select().from(classSchedules).where(eq(classSchedules.id, id));
    return schedule;
  }

  async createClassSchedule(schedule: InsertClassSchedule): Promise<ClassSchedule> {
    const [newSchedule] = await db.insert(classSchedules).values(schedule).returning();
    return newSchedule;
  }

  async updateClassSchedule(id: string, schedule: Partial<InsertClassSchedule>): Promise<ClassSchedule> {
    const [updatedSchedule] = await db
      .update(classSchedules)
      .set(schedule)
      .where(eq(classSchedules.id, id))
      .returning();
    return updatedSchedule;
  }

  // Booking operations
  async getUserBookings(userId: string): Promise<ClassBooking[]> {
    return await db
      .select()
      .from(classBookings)
      .where(eq(classBookings.userId, userId))
      .orderBy(desc(classBookings.createdAt));
  }

  async createClassBooking(booking: InsertClassBooking): Promise<ClassBooking> {
    const [newBooking] = await db.insert(classBookings).values(booking).returning();
    
    // Decrease available spots
    await db
      .update(classSchedules)
      .set({
        availableSpots: sql`${classSchedules.availableSpots} - 1`
      })
      .where(eq(classSchedules.id, booking.classScheduleId));
    
    return newBooking;
  }

  async updateClassBooking(id: string, booking: Partial<InsertClassBooking>): Promise<ClassBooking> {
    const [updatedBooking] = await db
      .update(classBookings)
      .set(booking)
      .where(eq(classBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async cancelClassBooking(id: string): Promise<void> {
    const [booking] = await db
      .update(classBookings)
      .set({ status: 'cancelled' })
      .where(eq(classBookings.id, id))
      .returning();

    if (booking) {
      // Increase available spots
      await db
        .update(classSchedules)
        .set({
          availableSpots: sql`${classSchedules.availableSpots} + 1`
        })
        .where(eq(classSchedules.id, booking.classScheduleId));
    }
  }

  // Personal training operations
  async getPersonalTrainingSessions(userId: string, isTrainer = false): Promise<PersonalTrainingSession[]> {
    const field = isTrainer ? personalTrainingSessions.trainerId : personalTrainingSessions.studentId;
    return await db
      .select()
      .from(personalTrainingSessions)
      .where(eq(field, userId))
      .orderBy(desc(personalTrainingSessions.startTime));
  }

  async createPersonalTrainingSession(session: InsertPersonalTrainingSession): Promise<PersonalTrainingSession> {
    const [newSession] = await db.insert(personalTrainingSessions).values(session).returning();
    return newSession;
  }

  async updatePersonalTrainingSession(id: string, session: Partial<InsertPersonalTrainingSession>): Promise<PersonalTrainingSession> {
    const [updatedSession] = await db
      .update(personalTrainingSessions)
      .set(session)
      .where(eq(personalTrainingSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Payment operations
  async getUserPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Analytics for admin
  async getBookingStats(): Promise<any> {
    const totalBookings = await db.select({ count: sql`count(*)` }).from(classBookings);
    const confirmedBookings = await db
      .select({ count: sql`count(*)` })
      .from(classBookings)
      .where(eq(classBookings.status, 'confirmed'));
    
    return {
      total: totalBookings[0]?.count || 0,
      confirmed: confirmedBookings[0]?.count || 0,
    };
  }

  async getRevenueStats(): Promise<any> {
    const totalRevenue = await db
      .select({ total: sql`sum(${payments.amount})` })
      .from(payments)
      .where(eq(payments.status, 'completed'));
    
    return {
      total: totalRevenue[0]?.total || 0,
    };
  }
}

export const storage = new DatabaseStorage();
