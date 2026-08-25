import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const results = sqliteTable("results", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  technicalLevel: text("technical_level").notNull(),
  goalId: text("goal_id").notNull(),
  route: text("route").notNull(),
  users: text("users").notNull(),
  workload: text("workload").notNull(),
  priority: text("priority").notNull(),
  productFamily: text("product_family").notNull(),
  productName: text("product_name").notNull(),
  confidence: integer("confidence").notNull().default(0),
  payloadJson: text("payload_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text("expires_at").notNull(),
});
