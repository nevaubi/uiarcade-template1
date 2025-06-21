import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing required Stripe keys");
    }

    logStep("Stripe keys verified");

    // Get the raw body and signature
    const body = await req.arrayBuffer();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    logStep("Signature found, verifying webhook");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Verify the webhook signature using async method
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        new Uint8Array(body),
        signature,
        webhookSecret
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    logStep("Webhook verified successfully", { type: event.type, id: event.id });

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Process the event
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object, supabaseClient);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, supabaseClient, stripe);
        break;
      
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object, supabaseClient, stripe);
        break;
      
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, supabaseClient, stripe);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    logStep("Webhook processed successfully");

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionChange(subscription: any, supabaseClient: any) {
  logStep("Processing subscription change", { subscriptionId: subscription.id });

  const customer = await getCustomerEmail(subscription.customer, supabaseClient);
  if (!customer?.email) {
    logStep("No customer email found", { customerId: subscription.customer });
    return;
  }

  // Map price IDs to tiers
  const priceToTierMap: { [key: string]: string } = {
    'price_1RcNqWDBIslKIY5sRPrUZSwO': 'Starter', // $9/month
    'price_1RcNtSDBIslKIY5sbtJZKhIi': 'Starter', // $86/year
    'price_1RcNryDBIslKIY5sJpOan8AV': 'Pro', // $29/month
    'price_1RcNubDBIslKIY5sZMM2yYNG': 'Pro', // $278/year
    'price_1RcNsfDBIslKIY5sIVc446gj': 'Enterprise', // $99/month
    'price_1RcNvSDBIslKIY5s2eB93M48': 'Enterprise', // $950/year
  };

  const priceId = subscription.items.data[0]?.price?.id;
  const subscriptionTier = priceToTierMap[priceId] || 'Unknown';
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const isActive = subscription.status === 'active';

  logStep("Updating subscription in database", {
    email: customer.email,
    tier: subscriptionTier,
    active: isActive,
    endDate: subscriptionEnd
  });

  const { error } = await supabaseClient.from("subscribers").upsert({
    email: customer.email,
    user_id: customer.user_id,
    stripe_customer_id: subscription.customer,
    subscribed: isActive,
    subscription_tier: subscriptionTier,
    subscription_end: subscriptionEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });

  if (error) {
    logStep("Error updating subscription", { error: error.message });
  } else {
    logStep("Subscription updated successfully");
  }
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  logStep("Processing subscription deletion", { subscriptionId: subscription.id });

  const customer = await getCustomerEmail(subscription.customer, supabaseClient);
  if (!customer?.email) {
    logStep("No customer email found for deletion", { customerId: subscription.customer });
    return;
  }

  const { error } = await supabaseClient.from("subscribers").upsert({
    email: customer.email,
    user_id: customer.user_id,
    stripe_customer_id: subscription.customer,
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });

  if (error) {
    logStep("Error deleting subscription", { error: error.message });
  } else {
    logStep("Subscription deleted successfully");
  }
}

async function handleCheckoutCompleted(session: any, supabaseClient: any, stripe: any) {
  logStep("Processing checkout completion", { sessionId: session.id });

  if (session.mode === 'subscription' && session.subscription) {
    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await handleSubscriptionChange(subscription, supabaseClient);
  }
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any, stripe: any) {
  logStep("Processing successful payment", { invoiceId: invoice.id });

  if (invoice.subscription) {
    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    await handleSubscriptionChange(subscription, supabaseClient);
  }
}

async function handlePaymentFailed(invoice: any, supabaseClient: any, stripe: any) {
  logStep("Processing failed payment", { invoiceId: invoice.id });

  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // If subscription is past_due or unpaid, we might want to handle differently
    if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      logStep("Subscription past due or unpaid", { 
        subscriptionId: subscription.id, 
        status: subscription.status 
      });
      
      // You might want to mark subscription as inactive or send notifications
      // For now, we'll let the subscription change handler deal with it
      await handleSubscriptionChange(subscription, supabaseClient);
    }
  }
}

async function getCustomerEmail(customerId: string, supabaseClient: any) {
  // First try to get from our subscribers table
  const { data: subscriber } = await supabaseClient
    .from("subscribers")
    .select("email, user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (subscriber) {
    return subscriber;
  }

  // If not found, we'll need to get it from Stripe (this shouldn't normally happen
  // but is a fallback for edge cases)
  logStep("Customer not found in database, this may indicate a data sync issue", { customerId });
  return null;
}
