import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

// Type definitions
type EquityGrant = {
  _id: Id<"equityGrants">;
  employeeId: Id<"employees">;
  companyId: Id<"companies">;
  totalShares: number;
  vestingScheduleMonths: number;
  cliffMonths: number;
  vestingStartDate: number;
  grantDate: number;
  strikePrice: number;
  grantType: "ISO" | "NSO" | "RSU";
  notes?: string;
  createdAt: number;
  employee?: {
    _id: Id<"employees">;
    name: string;
    email: string;
    department: string;
  } | null;
};

type Employee = {
  _id: Id<"employees">;
  userId: Id<"users">;
  companyId: Id<"companies">;
  name: string;
  email: string;
  role: "employee" | "hr";
  department: string;
  startDate: number;
  createdAt: number;
};

// Auth Component
function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError("Authentication failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-600/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-600/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">EquityFlow</h1>
          </div>
          <p className="text-zinc-400 text-sm">Your equity, visualized and simplified</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : flow === "signIn" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-zinc-400 hover:text-emerald-400 text-sm transition-colors"
            >
              {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Onboarding Component
function OnboardingScreen() {
  const createEmployee = useMutation(api.employees.createOrUpdate);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await createEmployee({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as "employee" | "hr",
      department: formData.get("department") as string,
      startDate: new Date(formData.get("startDate") as string).getTime(),
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-zinc-400">Tell us about yourself to get started</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Full Name</label>
              <input
                name="name"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="john@company.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Role</label>
                <select
                  name="role"
                  required
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR / Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Department</label>
                <input
                  name="department"
                  required
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="Engineering"
                />
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Start Date</label>
              <input
                name="startDate"
                type="date"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, subValue, icon, gradient }: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-5 sm:p-6 hover:border-zinc-700/50 transition-all group">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        {subValue && (
          <span className="text-xs sm:text-sm text-zinc-500">{subValue}</span>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white mb-1 break-all">{value}</p>
      <p className="text-xs sm:text-sm text-zinc-400">{label}</p>
    </div>
  );
}

// Vesting Timeline Component
function VestingTimeline({ events }: { events: { vestingDate: number; sharesVested: number; isVested: boolean }[] }) {
  const sortedEvents = [...events].sort((a, b) => a.vestingDate - b.vestingDate);
  const now = Date.now();

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">Vesting Schedule</h3>
      <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto pr-2">
        {sortedEvents.slice(0, 12).map((event, index) => {
          const date = new Date(event.vestingDate);
          const isPast = event.vestingDate <= now;

          return (
            <div key={index} className="flex items-center gap-3 sm:gap-4">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isPast ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-zinc-600'}`}></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isPast ? 'text-white' : 'text-zinc-400'}`}>
                  {event.sharesVested.toLocaleString()} shares
                </p>
                <p className="text-xs text-zinc-500">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${isPast ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                {isPast ? 'Vested' : 'Pending'}
              </span>
            </div>
          );
        })}
        {sortedEvents.length > 12 && (
          <p className="text-xs text-zinc-500 text-center pt-2">+{sortedEvents.length - 12} more events</p>
        )}
      </div>
    </div>
  );
}

// Employee Dashboard
function EmployeeDashboard() {
  const { signOut } = useAuthActions();
  const employee = useQuery(api.employees.getCurrentEmployee);
  const summary = useQuery(api.equity.getEquitySummary);
  const vestingEvents = useQuery(api.equity.getMyVestingEvents);
  const grants = useQuery(api.equity.getMyGrants);
  const company = useQuery(api.companies.get);

  if (!employee || !summary) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading your equity data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-600/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">EquityFlow</h1>
              <p className="text-xs text-zinc-500">{company?.name || 'Your Company'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{employee.name}</p>
              <p className="text-xs text-zinc-500">{employee.department}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-3 sm:px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {employee.name.split(' ')[0]}</h2>
          <p className="text-zinc-400 text-sm sm:text-base">Here's your equity overview at {company?.name || 'the company'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          <StatCard
            label="Total Shares Granted"
            value={summary.totalGranted.toLocaleString()}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <StatCard
            label="Vested Shares"
            value={summary.totalVested.toLocaleString()}
            subValue={`${((summary.totalVested / summary.totalGranted) * 100 || 0).toFixed(1)}%`}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            label="Ownership"
            value={`${summary.percentageOfCompany.toFixed(4)}%`}
            subValue={`of ${(summary.companyTotalShares / 1000000).toFixed(1)}M`}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <StatCard
            label="Current Value"
            value={`$${summary.currentValue.toLocaleString()}`}
            subValue={`@$${summary.sharePrice}/share`}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Equity Breakdown */}
          <div className="lg:col-span-2 bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">Equity Grants</h3>
            {grants && grants.length > 0 ? (
              <div className="space-y-4">
                {grants.map((grant: EquityGrant) => (
                  <div key={grant._id} className="bg-zinc-800/40 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                        grant.grantType === 'ISO' ? 'bg-emerald-500/20 text-emerald-400' :
                        grant.grantType === 'RSU' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {grant.grantType}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Granted {new Date(grant.grantDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Shares</p>
                        <p className="text-white font-medium">{grant.totalShares.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Strike Price</p>
                        <p className="text-white font-medium">${grant.strikePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Vesting</p>
                        <p className="text-white font-medium">{grant.vestingScheduleMonths}mo</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">Cliff</p>
                        <p className="text-white font-medium">{grant.cliffMonths}mo</p>
                      </div>
                    </div>
                    {grant.notes && (
                      <p className="text-xs text-zinc-500 mt-3 italic">{grant.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-zinc-400 mb-2">No equity grants yet</p>
                <p className="text-zinc-500 text-sm">Your HR team will add your equity grants here</p>
              </div>
            )}
          </div>

          {/* Vesting Timeline */}
          {vestingEvents && vestingEvents.length > 0 ? (
            <VestingTimeline events={vestingEvents} />
          ) : (
            <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">Vesting Schedule</h3>
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">No vesting events scheduled</p>
              </div>
            </div>
          )}
        </div>

        {/* Next Vesting */}
        {summary.nextVestingDate && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-emerald-400 text-sm font-medium mb-1">Next Vesting Event</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {summary.nextVestingShares?.toLocaleString()} shares
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-zinc-400 text-sm">Vesting on</p>
                <p className="text-lg sm:text-xl font-semibold text-white">
                  {new Date(summary.nextVestingDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// HR Dashboard
function HRDashboard() {
  const { signOut } = useAuthActions();
  const employee = useQuery(api.employees.getCurrentEmployee);
  const allEmployees = useQuery(api.employees.getAll);
  const allGrants = useQuery(api.equity.getAllGrantsForCompany);
  const company = useQuery(api.companies.get);

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Id<"employees"> | null>(null);

  const createGrant = useMutation(api.equity.createGrant);

  const handleCreateGrant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const formData = new FormData(e.currentTarget);
    await createGrant({
      employeeId: selectedEmployee,
      totalShares: parseInt(formData.get("totalShares") as string),
      vestingScheduleMonths: parseInt(formData.get("vestingMonths") as string),
      cliffMonths: parseInt(formData.get("cliffMonths") as string),
      vestingStartDate: new Date(formData.get("startDate") as string).getTime(),
      strikePrice: parseFloat(formData.get("strikePrice") as string),
      grantType: formData.get("grantType") as "ISO" | "NSO" | "RSU",
      notes: formData.get("notes") as string || undefined,
    });

    setShowGrantModal(false);
    setSelectedEmployee(null);
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  const totalAllocated = allGrants?.reduce((sum: number, g: EquityGrant) => sum + g.totalShares, 0) || 0;
  const allocationPercentage = company ? (totalAllocated / company.totalShares) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-pink-600/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">HR Portal</h1>
              <p className="text-xs text-zinc-500">{company?.name || 'Company'} - Equity Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-full font-medium">
              HR Admin
            </span>
            <button
              onClick={() => signOut()}
              className="px-3 sm:px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          <StatCard
            label="Total Company Shares"
            value={(company?.totalShares || 0).toLocaleString()}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            gradient="bg-gradient-to-br from-slate-500 to-slate-700"
          />
          <StatCard
            label="Shares Allocated"
            value={totalAllocated.toLocaleString()}
            subValue={`${allocationPercentage.toFixed(2)}%`}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          />
          <StatCard
            label="Active Employees"
            value={(allEmployees?.length || 0).toString()}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />
          <StatCard
            label="Share Price"
            value={`$${company?.sharePrice.toFixed(2) || '0.00'}`}
            icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        </div>

        {/* Employees Table */}
        <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800/50 overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Employee Equity</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800/50">
                  <th className="px-4 sm:px-6 py-4 font-medium">Employee</th>
                  <th className="px-4 sm:px-6 py-4 font-medium">Department</th>
                  <th className="px-4 sm:px-6 py-4 font-medium">Grants</th>
                  <th className="px-4 sm:px-6 py-4 font-medium">Total Shares</th>
                  <th className="px-4 sm:px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allEmployees?.map((emp: Employee) => {
                  const empGrants = allGrants?.filter((g: EquityGrant) => g.employeeId === emp._id) || [];
                  const totalShares = empGrants.reduce((sum: number, g: EquityGrant) => sum + g.totalShares, 0);

                  return (
                    <tr key={emp._id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="text-white font-medium text-sm">{emp.name}</p>
                          <p className="text-zinc-500 text-xs">{emp.email}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-zinc-400 text-sm">{emp.department}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-zinc-400 text-sm">{empGrants.length}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-white font-medium text-sm">{totalShares.toLocaleString()}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp._id);
                            setShowGrantModal(true);
                          }}
                          className="px-3 py-1.5 bg-violet-500/20 text-violet-400 text-xs rounded-lg hover:bg-violet-500/30 transition-colors"
                        >
                          + Add Grant
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(!allEmployees || allEmployees.length === 0) && (
            <div className="text-center py-12">
              <p className="text-zinc-400">No employees found</p>
            </div>
          )}
        </div>

        {/* Recent Grants */}
        <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4 sm:mb-6">Recent Grants</h3>
          <div className="space-y-3">
            {allGrants?.slice(0, 5).map((grant: EquityGrant) => (
              <div key={grant._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-zinc-800/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {grant.employee?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{grant.employee?.name || 'Unknown'}</p>
                    <p className="text-zinc-500 text-xs">{grant.grantType} - {grant.totalShares.toLocaleString()} shares</p>
                  </div>
                </div>
                <span className="text-zinc-500 text-xs">
                  {new Date(grant.grantDate).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!allGrants || allGrants.length === 0) && (
              <p className="text-zinc-500 text-sm text-center py-4">No grants created yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Grant Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-semibold text-white">Create Equity Grant</h3>
            </div>
            <form onSubmit={handleCreateGrant} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Total Shares</label>
                  <input
                    name="totalShares"
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Grant Type</label>
                  <select
                    name="grantType"
                    required
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  >
                    <option value="ISO">ISO</option>
                    <option value="NSO">NSO</option>
                    <option value="RSU">RSU</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Vesting Period (months)</label>
                  <input
                    name="vestingMonths"
                    type="number"
                    required
                    defaultValue={48}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Cliff (months)</label>
                  <input
                    name="cliffMonths"
                    type="number"
                    required
                    defaultValue={12}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Strike Price ($)</label>
                  <input
                    name="strikePrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={company?.sharePrice || 1}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Vesting Start Date</label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Notes (optional)</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
                  placeholder="Additional notes about this grant..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGrantModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="flex-1 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                >
                  Create Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="py-6 text-center">
      <p className="text-zinc-600 text-xs">
        Requested by <span className="text-zinc-500">@web-user</span> · Built by <span className="text-zinc-500">@clonkbot</span>
      </p>
    </footer>
  );
}

// Main App
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const employee = useQuery(api.employees.getCurrentEmployee);
  const seedCompany = useMutation(api.companies.seedCompany);

  useEffect(() => {
    if (isAuthenticated) {
      seedCompany();
    }
  }, [isAuthenticated, seedCompany]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-zinc-400 text-sm">Loading EquityFlow...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (employee === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading profile...</div>
      </div>
    );
  }

  if (!employee) {
    return <OnboardingScreen />;
  }

  if (employee.role === "hr") {
    return <HRDashboard />;
  }

  return <EmployeeDashboard />;
}
