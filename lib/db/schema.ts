import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['user', 'ai']);
export const todoStatusEnum = pgEnum('todo_status', ['pending', 'completed']);
export const todoCreatorEnum = pgEnum('todo_creator', ['ai', 'user']);
export const degreeEnum = pgEnum('degree', [
  'bachelor',
  'master',
  'mba',
  'phd',
]);
export const lockStatusEnum = pgEnum('lock_status', ['locked', 'unlocked']);
export const applicationStatusEnum = pgEnum('application_status', [
  'not_started',
  'in_progress',
  'submitted',
  'accepted',
  'rejected',
]);

// User
export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  subscription: boolean('subscription').default(false),
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Onboarding
export const onboardingForms = pgTable('onboarding_forms', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .references(() => users.id)
    .notNull(),
  academic: text('academic').notNull(),
  goals: text('goals').notNull(),
  budget: text('budget').notNull(),
  exams: text('exams').notNull(),
  isComplete: boolean('is_complete').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Session
export const aiSessions = pgTable('ai_sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .references(() => users.id)
    .notNull(),
  onboardingFormId: varchar('onboarding_form_id', { length: 36 })
    .references(() => onboardingForms.id)
    .notNull(),
  profileSummary: text('profile_summary'),
  isProfileChanged: boolean('is_profile_changed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Messages
export const aiMessages = pgTable('ai_messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  aiSessionId: varchar('ai_session_id', { length: 36 })
    .references(() => aiSessions.id)
    .notNull(),
  role: roleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Todo
export const todos = pgTable('todos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .references(() => users.id)
    .notNull(),
  createdBy: todoCreatorEnum('created_by').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: todoStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// University
export const universities = pgTable('universities', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  description: text('description'),
  grade: text('grade'),
  rating: integer('rating'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Course
export const courses = pgTable('courses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  universityId: varchar('university_id', { length: 36 })
    .references(() => universities.id)
    .notNull(),
  name: text('name').notNull(),
  degree: degreeEnum('degree').notNull(),
  duration: integer('duration'),
  tuitionFee: integer('tuition_fee'),
});

// Locked Universities
export const lockedUniversities = pgTable('locked_universities', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .references(() => users.id)
    .notNull(),
  universityId: varchar('university_id', { length: 36 })
    .references(() => universities.id)
    .notNull(),
  status: lockStatusEnum('status').default('locked'),
  lockedAt: timestamp('locked_at').defaultNow(),
  unlockedAt: timestamp('unlocked_at'),
});

// Applications
export const applications = pgTable('applications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .references(() => users.id)
    .notNull(),
  universityId: varchar('university_id', { length: 36 })
    .references(() => universities.id)
    .notNull(),
  status: applicationStatusEnum('status').default('not_started'),
  appliedAt: timestamp('applied_at'),
  decisionDate: timestamp('decision_date'),
});
