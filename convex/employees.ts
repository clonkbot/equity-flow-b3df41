import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentEmployee = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check if user is HR
    const currentEmployee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentEmployee || currentEmployee.role !== "hr") {
      return [];
    }

    return await ctx.db
      .query("employees")
      .withIndex("by_company", (q) => q.eq("companyId", currentEmployee.companyId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(args.id);
  },
});

export const createOrUpdate = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("employee"), v.literal("hr")),
    department: v.string(),
    startDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get or create company
    let company = await ctx.db.query("companies").first();
    if (!company) {
      const companyId = await ctx.db.insert("companies", {
        name: "TechVentures Inc.",
        totalShares: 10000000,
        sharePrice: 2.50,
        createdAt: Date.now(),
      });
      company = await ctx.db.get(companyId);
    }

    const existing = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        role: args.role,
        department: args.department,
        startDate: args.startDate,
      });
      return existing._id;
    }

    return await ctx.db.insert("employees", {
      userId,
      companyId: company!._id,
      name: args.name,
      email: args.email,
      role: args.role,
      department: args.department,
      startDate: args.startDate,
      createdAt: Date.now(),
    });
  },
});

export const createForUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("employee"), v.literal("hr")),
    department: v.string(),
    startDate: v.number(),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if caller is HR
    const caller = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!caller || caller.role !== "hr") {
      throw new Error("Only HR can create employee profiles");
    }

    const existing = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (existing) {
      throw new Error("Employee profile already exists for this user");
    }

    return await ctx.db.insert("employees", {
      userId: args.targetUserId,
      companyId: caller.companyId,
      name: args.name,
      email: args.email,
      role: args.role,
      department: args.department,
      startDate: args.startDate,
      createdAt: Date.now(),
    });
  },
});
