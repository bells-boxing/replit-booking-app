import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertClassBookingSchema, insertPersonalTrainingSessionSchema, insertPaymentSchema } from "@shared/schema";

// Initialize Stripe only if secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Class routes
  app.get('/api/classes', async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get('/api/classes/:id', async (req, res) => {
    try {
      const classData = await storage.getClass(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classData);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ message: "Failed to fetch class" });
    }
  });

  // Class schedule routes
  app.get('/api/class-schedules', async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const schedules = await storage.getClassSchedules(date);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Trainer routes
  app.get('/api/trainers', async (req, res) => {
    try {
      const trainers = await storage.getTrainers();
      res.json(trainers);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertClassBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      const booking = await storage.createClassBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.patch('/api/bookings/:id/cancel', isAuthenticated, async (req, res) => {
    try {
      await storage.cancelClassBooking(req.params.id);
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Personal training routes
  app.get('/api/personal-training', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const isTrainer = user?.role === 'trainer';
      
      const sessions = await storage.getPersonalTrainingSessions(userId, isTrainer);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching PT sessions:", error);
      res.status(500).json({ message: "Failed to fetch personal training sessions" });
    }
  });

  app.post('/api/personal-training', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertPersonalTrainingSessionSchema.parse({
        ...req.body,
        studentId: userId,
      });
      
      const session = await storage.createPersonalTrainingSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating PT session:", error);
      res.status(400).json({ message: "Failed to create personal training session" });
    }
  });

  // Payment routes
  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing is currently unavailable. Stripe not configured." });
    }

    try {
      const { amount, description } = req.body;
      const userId = req.user.claims.sub;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency: "gbp",
        metadata: { userId, description },
      });

      // Store payment record
      await storage.createPayment({
        userId,
        amount: amount.toString(),
        currency: 'gbp',
        description,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Subscription processing is currently unavailable. Stripe not configured." });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent']
        });
        const invoice = subscription.latest_invoice as any;
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: invoice?.payment_intent?.client_secret,
        });
      }

      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId);
      }

      // Create product and price first for subscription
      const product = await stripe.products.create({
        name: 'Premium Membership',
        description: 'Unlimited classes, 2 PT sessions/month, priority booking',
      });

      const price = await stripe.prices.create({
        unit_amount: 8999, // £89.99 in pence
        currency: 'gbp',
        recurring: { interval: 'month' },
        product: product.id,
      });

      // Create subscription for premium membership (£89.99/month)
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customerId, subscription.id);

      const invoice = subscription.latest_invoice as any;
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ error: { message: error.message } });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookingStats = await storage.getBookingStats();
      const revenueStats = await storage.getRevenueStats();

      res.json({
        bookings: bookingStats,
        revenue: revenueStats,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
