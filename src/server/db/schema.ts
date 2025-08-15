import { pgTable, text, uuid, date, timestamp } from 'drizzle-orm/pg-core'

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