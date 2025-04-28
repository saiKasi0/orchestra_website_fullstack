import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest } from "next/server";

// Check if environment variables are set
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("Upstash Redis environment variables are not set. Rate limiting will be disabled.");
}

// Initialize Redis client only if variables are set
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiter for login attempts (e.g., 5 requests per minute per email)
export const loginRateLimiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per 60 seconds
      analytics: true,
      prefix: "ratelimit:login",
    })
  : null;

// Rate limiter for general API usage (e.g., 30 requests per 10 seconds per IP)
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"), // 30 requests per 10 seconds
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

// Helper to get IP address from request
export function getIdentifier(req: NextRequest | Request): string | null {
    // Prioritize standard headers
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        // Take the first IP if 'x-forwarded-for' contains a list
        return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback if headers are missing
    return null;
}
