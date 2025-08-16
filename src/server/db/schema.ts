import { pgTable, text, uuid, date, timestamp, boolean } from 'drizzle-orm/pg-core'

// BetterAuth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  sedarNumber: text("sedar_number"),
  role: text("role").default("agent"),
  fullName: text("full_name"),
  assignedCodes: text("assigned_codes"),
  status: text("status").default("pending"),
  phoneNumber: text("phone_number"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => new Date(),
  ),
});

// Legacy users table (kept for compatibility)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['salesperson','admin'] }).notNull(),
  city: text('city').notNull(),
  salespersonNumber: text('salesperson_number').unique(),
})

export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name'),
  phone: text('phone'),
  city: text('city'),
  status: text('status', { enum: ['pending','callback','completed'] }).notNull().default('pending'),
  callbackDate: date('callback_date'),
  result: text('result'),
  comments: text('comments'),
  assignedTo: text('assigned_to'),
})

export const supportLogs = pgTable('support_logs', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id'),
  role: text('role'),
  city: text('city'),
  page: text('page').notNull(),
  message: text('message').notNull(),
  stack: text('stack'),
  screenshotPath: text('screenshot_path'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})