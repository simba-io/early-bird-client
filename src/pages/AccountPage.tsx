import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "../contexts/AuthContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

type Plan = "monthly" | "annual";

const PLANS = {
  monthly: {
    label: "Monthly",
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID as string,
    badge: null,
  },
  annual: {
    label: "Annual",
    priceId: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID as string,
    badge: "Save 20%",
  },
};

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account?payment=success`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Payment failed");
    } else {
      onSuccess();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <PaymentElement />
      {error && <p className="auth-error">{error}</p>}
      <button className="btn btn--primary btn--full" type="submit" disabled={!stripe || loading}>
        {loading ? "Processing…" : "Subscribe"}
      </button>
    </form>
  );
}

export function AccountPage() {
  const { user, profile, isPaid, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("monthly");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(
    new URLSearchParams(window.location.search).get("payment") === "success"
  );

  async function startCheckout() {
    if (!user) return;
    setLoadingCheckout(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId: PLANS[selectedPlan].priceId,
          stripeCustomerId: profile?.stripe_customer_id ?? null,
        }),
      });

      const data = await res.json() as { clientSecret?: string; error?: string };
      if (!res.ok || !data.clientSecret) {
        setCheckoutError(data.error ?? "Failed to start checkout");
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch {
      setCheckoutError("Network error. Is the payments server running?");
    }

    setLoadingCheckout(false);
  }

  async function handlePaymentSuccess() {
    await refreshProfile();
    setPaymentSuccess(true);
    setClientSecret(null);
  }

  if (!user) {
    return (
      <div className="page">
        <h1>Account</h1>
        <p>Please <a href="/auth">sign in</a> to manage your account.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Account Management</h1>
      <p className="page__subtitle">{user.email}</p>

      {paymentSuccess && (
        <div className="alert alert--success">
          🎉 Subscription activated! Welcome aboard.
        </div>
      )}

      {isPaid ? (
        <div className="account-status account-status--active">
          <div className="account-status__icon">✅</div>
          <div>
            <h2>Active Subscription</h2>
            <p>You have full access to Early Bird. Enjoy!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="account-status account-status--inactive">
            <div className="account-status__icon">🔒</div>
            <div>
              <h2>No Active Subscription</h2>
              <p>Choose a plan below to unlock all features.</p>
            </div>
          </div>

          {!clientSecret ? (
            <div className="plan-selector">
              <h2>Choose Your Plan</h2>
              <div className="plan-cards">
                {(Object.entries(PLANS) as [Plan, typeof PLANS.monthly][]).map(([key, plan]) => (
                  <button
                    key={key}
                    className={`plan-card ${selectedPlan === key ? "plan-card--selected" : ""}`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    {plan.badge && <span className="plan-card__badge">{plan.badge}</span>}
                    <div className="plan-card__label">{plan.label}</div>
                  </button>
                ))}
              </div>

              {checkoutError && <p className="auth-error">{checkoutError}</p>}

              <button
                className="btn btn--primary"
                onClick={startCheckout}
                disabled={loadingCheckout}
              >
                {loadingCheckout ? "Loading…" : `Continue with ${PLANS[selectedPlan].label} plan`}
              </button>
            </div>
          ) : (
            <div className="checkout-section">
              <div className="checkout-section__header">
                <button
                  className="btn btn--ghost"
                  onClick={() => setClientSecret(null)}
                >
                  ← Back
                </button>
                <h2>Complete Payment</h2>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          )}
        </>
      )}
    </div>
  );
}
