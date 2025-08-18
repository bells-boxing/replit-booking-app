import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'trainer', 'admin']);
export const membershipTypeEnum = pgEnum('membership_type', ['basic', 'premium', 'unlimited']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const classLevelEnum = pgEnum('class_level', ['beginner', 'intermediate', 'advanced']);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('student').notNull(),
  membershipType: membershipTypeEnum("membership_type"),
  membershipExpiry: timestamp("membership_expiry"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trainers table
export const trainers = pgTable("trainers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bio: text("bio"),
  specialty: varchar("specialty"),
  experience: text("experience"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  trainerId: varchar("trainer_id").references(() => trainers.id).notNull(),
  capacity: integer("capacity").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  level: classLevelEnum("level").notNull(),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Class schedules table
export const classSchedules = pgTable("class_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").references(() => classes.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  availableSpots: integer("available_spots").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personal training sessions table
export const personalTrainingSessions = pgTable("personal_training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainerId: varchar("trainer_id").references(() => trainers.id).notNull(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default('pending').notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Class bookings table
export const classBookings = pgTable("class_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  classScheduleId: varchar("class_schedule_id").references(() => classSchedules.id).notNull(),
  status: bookingStatusEnum("status").default('pending').notNull(),
  paymentId: varchar("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default('gbp').notNull(),
  description: varchar("description").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: paymentStatusEnum("status").default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  trainer: one(trainers, {
    fields: [users.id],
    references: [trainers.userId],
  }),
  classBookings: many(classBookings),
  personalTrainingSessions: many(personalTrainingSessions),
  payments: many(payments),
}));

export const trainersRelations = relations(trainers, ({ one, many }) => ({
  user: one(users, {
    fields: [trainers.userId],
    references: [users.id],
  }),
  classes: many(classes),
  personalTrainingSessions: many(personalTrainingSessions),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  trainer: one(trainers, {
    fields: [classes.trainerId],
    references: [trainers.id],
  }),
  schedules: many(classSchedules),
}));

export const classSchedulesRelations = relations(classSchedules, ({ one, many }) => ({
  class: one(classes, {
    fields: [classSchedules.classId],
    references: [classes.id],
  }),
  bookings: many(classBookings),
}));

export const classBookingsRelations = relations(classBookings, ({ one }) => ({
  user: one(users, {
    fields: [classBookings.userId],
    references: [users.id],
  }),
  classSchedule: one(classSchedules, {
    fields: [classBookings.classScheduleId],
    references: [classSchedules.id],
  }),
}));

export const personalTrainingSessionsRelations = relations(personalTrainingSessions, ({ one }) => ({
  trainer: one(trainers, {
    fields: [personalTrainingSessions.trainerId],
    references: [trainers.id],
  }),
  student: one(users, {
    fields: [personalTrainingSessions.studentId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainerSchema = createInsertSchema(trainers).omit({
  id: true,
  createdAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertClassScheduleSchema = createInsertSchema(classSchedules).omit({
  id: true,
  createdAt: true,
});

export const insertPersonalTrainingSessionSchema = createInsertSchema(personalTrainingSessions).omit({
  id: true,
  createdAt: true,
});

export const insertClassBookingSchema = createInsertSchema(classBookings).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Trainer = typeof trainers.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type ClassSchedule = typeof classSchedules.$inferSelect;
export type PersonalTrainingSession = typeof personalTrainingSessions.$inferSelect;
export type ClassBooking = typeof classBookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;

export type InsertTrainer = z.infer<typeof insertTrainerSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertClassSchedule = z.infer<typeof insertClassScheduleSchema>;
export type InsertPersonalTrainingSession = z.infer<typeof insertPersonalTrainingSessionSchema>;
export type InsertClassBooking = z.infer<typeof insertClassBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
