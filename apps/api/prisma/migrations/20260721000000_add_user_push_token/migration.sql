-- Expo push token of the user's current device (order-status notifications).
ALTER TABLE "User" ADD COLUMN "pushToken" TEXT;
