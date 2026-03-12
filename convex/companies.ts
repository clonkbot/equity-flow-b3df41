import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Get the first company (for demo purposes)
    const companies = await ctx.db.query("companies").collect();
    return companies[0] || null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    totalShares: v.number(),
    sharePrice: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("companies", {
      name: args.name,
      totalShares: args.totalShares,
      sharePrice: args.sharePrice,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    totalShares: v.optional(v.number()),
    sharePrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const seedCompany = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("companies").collect();
    if (existing.length > 0) return existing[0]._id;

    return await ctx.db.insert("companies", {
      name: "TechVentures Inc.",
      totalShares: 10000000,
      sharePrice: 2.50,
      createdAt: Date.now(),
    });
  },
});
