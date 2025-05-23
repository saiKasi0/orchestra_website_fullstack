import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from '@supabase/supabase-js';
import { loginRateLimiter } from '@/utils/rateLimiter'; // Import the rate limiter

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // --- Rate Limiting Start ---
        if (loginRateLimiter) {
          const identifier = credentials.email; // Use email as identifier for login attempts
          const { success } = await loginRateLimiter.limit(identifier);

          if (!success) {
            console.warn(`Rate limit exceeded for login attempt: ${identifier}`);
            // Optionally throw a specific error or return null to indicate failure
            // Throwing an error provides more context on the client-side if handled properly
             throw new Error("Too many login attempts. Please try again later.");
            // return null; // Or simply return null
          }
        }
        // --- Rate Limiting End ---

        try {
          // Authenticate with Supabase
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (authError || !authData.user) {
            console.error("Authentication error:", authError);
            return null;
          }

          // Get user profile to check for admin role
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_id', authData.user.id)
            .single();

          if (profileError || !profileData) {
            console.error("Profile fetch error:", profileError);
            return null;
          }

          // Check if user is an admin
          if (!["admin", "leadership"].includes(profileData.role)) {
            console.error("Invalid role:", profileData.role);
            return null;
        }

          return {
            id: authData.user.id,
            email: authData.user.email,
            name: profileData.full_name,
            role: profileData.role,
            accessToken: authData.session?.access_token || '',
            refreshToken: authData.session?.refresh_token || '',
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to JWT token if user object is available
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };