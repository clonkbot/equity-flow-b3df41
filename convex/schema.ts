import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Company information
  companies: defineTable({
    name: v.string(),
    totalShares: v.number(),
    sharePrice: v.number(), // Current valuation per share
    createdAt: v.number(),
  }),

  // Employee profiles
  employees: defineTable({
    userId: v.id("users"),
    companyId: v.id("companies"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("employee"), v.literal("hr")),
    department: v.string(),
    startDate: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_company", ["companyId"]),

  // Equity grants
  equityGrants: defineTable({
    employeeId: v.id("employees"),
    companyId: v.id("companies"),
    totalShares: v.number(),
    vestingScheduleMonths: v.number(), // Total vesting period
    cliffMonths: v.number(), // Cliff period before any vesting
    vestingStartDate: v.number(),
    grantDate: v.number(),
    strikePrice: v.number(), // Exercise price per share
    grantType: v.union(v.literal("ISO"), v.literal("NSO"), v.literal("RSU")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_employee", ["employeeId"])
    .index("by_company", ["companyId"]),

  // Vesting events (monthly/annual milestones)
  vestingEvents: defineTable({
    grantId: v.id("equityGrants"),
    employeeId: v.id("employees"),
    sharesVested: v.number(),
    vestingDate: v.number(),
    isVested: v.boolean(),
    createdAt: v.number(),
  }).index("by_grant", ["grantId"])
    .index("by_employee", ["employeeId"]),
});
