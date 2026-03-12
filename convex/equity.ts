import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyGrants = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) return [];

    return await ctx.db
      .query("equityGrants")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .collect();
  },
});

export const getGrantsByEmployee = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("equityGrants")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();
  },
});

export const getMyVestingEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) return [];

    return await ctx.db
      .query("vestingEvents")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .collect();
  },
});

export const createGrant = mutation({
  args: {
    employeeId: v.id("employees"),
    totalShares: v.number(),
    vestingScheduleMonths: v.number(),
    cliffMonths: v.number(),
    vestingStartDate: v.number(),
    strikePrice: v.number(),
    grantType: v.union(v.literal("ISO"), v.literal("NSO"), v.literal("RSU")),
    notes: v.optional(v.string()),
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
      throw new Error("Only HR can create equity grants");
    }

    const employee = await ctx.db.get(args.employeeId);
    if (!employee) throw new Error("Employee not found");

    const grantId = await ctx.db.insert("equityGrants", {
      employeeId: args.employeeId,
      companyId: caller.companyId,
      totalShares: args.totalShares,
      vestingScheduleMonths: args.vestingScheduleMonths,
      cliffMonths: args.cliffMonths,
      vestingStartDate: args.vestingStartDate,
      grantDate: Date.now(),
      strikePrice: args.strikePrice,
      grantType: args.grantType,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Create vesting events
    const sharesPerMonth = args.totalShares / args.vestingScheduleMonths;
    const startDate = new Date(args.vestingStartDate);

    for (let month = 1; month <= args.vestingScheduleMonths; month++) {
      const vestingDate = new Date(startDate);
      vestingDate.setMonth(vestingDate.getMonth() + month);

      const isAfterCliff = month >= args.cliffMonths;
      const sharesToVest = month === args.cliffMonths
        ? sharesPerMonth * args.cliffMonths // Cliff vesting
        : month > args.cliffMonths
          ? sharesPerMonth
          : 0;

      if (sharesToVest > 0) {
        await ctx.db.insert("vestingEvents", {
          grantId,
          employeeId: args.employeeId,
          sharesVested: Math.round(sharesToVest),
          vestingDate: vestingDate.getTime(),
          isVested: vestingDate.getTime() <= Date.now(),
          createdAt: Date.now(),
        });
      }
    }

    return grantId;
  },
});

export const getEquitySummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) return null;

    const grants = await ctx.db
      .query("equityGrants")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .collect();

    const vestingEvents = await ctx.db
      .query("vestingEvents")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .collect();

    const company = await ctx.db.get(employee.companyId);

    const totalGranted = grants.reduce((sum, g) => sum + g.totalShares, 0);
    const totalVested = vestingEvents
      .filter(e => e.isVested)
      .reduce((sum, e) => sum + e.sharesVested, 0);

    const nextVesting = vestingEvents
      .filter(e => !e.isVested)
      .sort((a, b) => a.vestingDate - b.vestingDate)[0];

    return {
      totalGranted,
      totalVested,
      unvested: totalGranted - totalVested,
      percentageOfCompany: company ? (totalGranted / company.totalShares) * 100 : 0,
      vestedPercentageOfCompany: company ? (totalVested / company.totalShares) * 100 : 0,
      currentValue: company ? totalVested * company.sharePrice : 0,
      potentialValue: company ? totalGranted * company.sharePrice : 0,
      nextVestingDate: nextVesting?.vestingDate,
      nextVestingShares: nextVesting?.sharesVested,
      companyTotalShares: company?.totalShares || 0,
      sharePrice: company?.sharePrice || 0,
    };
  },
});

export const getAllGrantsForCompany = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const caller = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!caller || caller.role !== "hr") return [];

    const grants = await ctx.db
      .query("equityGrants")
      .withIndex("by_company", (q) => q.eq("companyId", caller.companyId))
      .collect();

    // Enrich with employee data
    const enrichedGrants = await Promise.all(
      grants.map(async (grant) => {
        const employee = await ctx.db.get(grant.employeeId);
        return { ...grant, employee };
      })
    );

    return enrichedGrants;
  },
});
