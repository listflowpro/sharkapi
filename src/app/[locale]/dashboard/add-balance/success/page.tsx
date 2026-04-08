import Link from "next/link";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function AddBalanceSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!session_id) redirect("/dashboard/add-balance");

  // Verify the session belongs to this user
  let amountUsd = 0;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.metadata?.user_id !== user.id) redirect("/dashboard");
    amountUsd = Number(session.metadata?.amount_usd ?? 0);
  } catch {
    redirect("/dashboard/add-balance");
  }

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-12">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-aqua-400/10 border-2 border-aqua-400/40 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-10 h-10 text-aqua-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Payment successful</h1>
        <p className="text-white/60 text-sm">
          <span className="text-aqua-400 font-bold text-lg">${amountUsd} USD</span>
          {" "}has been added to your wallet.
        </p>
        <p className="text-white/30 text-xs">
          Your balance will reflect within a few seconds.
        </p>
      </div>

      {/* Session ref */}
      <div className="w-full rounded-xl border border-ocean-600/40 bg-ocean-800/40 p-4 text-center">
        <p className="text-xs text-white/30 mb-1">Payment reference</p>
        <p className="text-xs font-mono text-white/50 break-all">{session_id}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col w-full gap-3">
        <Link
          href="/dashboard/generate"
          className="w-full py-3 rounded-xl bg-electric-400 text-ocean-900 font-bold text-sm text-center hover:bg-electric-300 transition-colors"
        >
          Start generating
        </Link>
        <Link
          href="/dashboard/wallet"
          className="w-full py-3 rounded-xl border border-ocean-600/60 text-white/60 font-medium text-sm text-center hover:text-white hover:bg-ocean-800/40 transition-colors"
        >
          View wallet
        </Link>
      </div>
    </div>
  );
}
