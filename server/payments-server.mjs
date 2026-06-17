import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
  })
);
app.use(express.json());

// Create or retrieve a Stripe customer, then create a subscription
app.post("/create-subscription", async (req, res) => {
  const { userId, email, priceId, stripeCustomerId } = req.body;

  if (!userId || !email || !priceId) {
    return res.status(400).json({ error: "userId, email, and priceId are required." });
  }

  try {
    let customerId = stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { userId } });
      customerId = customer.id;

      // Persist the customer ID in Supabase
      await supabase
        .from("profiles")
        .upsert({ id: userId, stripe_customer_id: customerId });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.confirmation_secret"],
    });

    const invoice = subscription.latest_invoice;
    const confirmationSecret = invoice?.confirmation_secret;
    const clientSecret =
      typeof confirmationSecret === "object" && confirmationSecret !== null
        ? confirmationSecret.client_secret
        : null;

    if (!clientSecret) {
      return res.status(500).json({ error: "Could not retrieve payment client secret." });
    }

    res.json({ clientSecret, subscriptionId: subscription.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook to update subscription status in Supabase
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const sub = event.data.object;

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", sub.customer)
      .single();

    if (profile) {
      await supabase.from("profiles").update({
        subscription_status: sub.status,
        subscription_id: sub.id,
      }).eq("id", profile.id);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", sub.customer)
      .single();

    if (profile) {
      await supabase.from("profiles").update({
        subscription_status: "canceled",
        subscription_id: null,
      }).eq("id", profile.id);
    }
  }

  res.json({ received: true });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Payments server running on http://localhost:${PORT}`);
});
