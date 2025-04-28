import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@/utils/supabase/server";

const supabase = createClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "supabase-auth",
      name: "Supabase Auth",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          throw new Error("Email and password are required.");
        }
        try {
          // Step 1: Authenticate with Supabase
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

          // Combine error check for cleaner logic
          if (authError || !authData.session || !authData.user) {
            console.warn("Supabase auth failed for:", credentials.email, authError?.message ? `Reason: ${authError.message}` : '');
            // Return null for failed authentication attempts as per NextAuth convention
            return null;
          }

          console.log("Auth successful for:", credentials.email);

          // Step 2: Get user profile data from 'profiles' table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select('id, full_name, role')
            .eq("auth_id", authData.user.id)
            .single();

          // Combine error check
          if (profileError || !profileData) {
            console.error("Profile fetch failed for:", credentials.email, profileError?.message ? `Reason: ${profileError.message}` : '');
            // Sign out the user from Supabase if profile fetch fails after successful auth
            await supabase.auth.signOut();
            return null;
          }

          console.log("User profile fetched for:", credentials.email, "Role:", profileData.role);

          // Step 3: Enforce role check *during* authorization
          const allowedRoles = ["admin", "leadership"];
          if (!allowedRoles.includes(profileData.role)) {
            console.warn(`Unauthorized role attempt for ${credentials.email}: ${profileData.role}`);
            // Sign out the user from Supabase as they shouldn't have an active session if they can't log in here
            await supabase.auth.signOut();
            return null; // Deny authorization
          }

          // Return user data required for the session/token
          return {
            // Ensure id is a string as expected by NextAuth User type
            id: profileData.id.toString(),
            email: authData.user.email, // Email is guaranteed by Supabase auth success
            name: profileData.full_name || authData.user.email, // Fallback name
            role: profileData.role,
            // Access/Refresh tokens are handled in JWT/Session callbacks if needed there
            // Avoid returning sensitive tokens directly from authorize if possible
            // Pass necessary info like Supabase user ID or session details if needed by JWT callback
            supabaseUserId: authData.user.id, // Example if needed later
            accessToken: authData.session.access_token, // Pass necessary tokens
            refreshToken: authData.session.refresh_token,
          };
        } catch (error) {
          console.error("Unexpected authorization error:", error);
          // Return null in case of unexpected errors
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin",
    error: "/admin",
  },
  session: {
    strategy: "jwt",
    // Set session max age to 1 hour (3600 seconds)
    maxAge: 3600,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: session.user?.email ?? "",
        name: session.user?.name ?? "",
        role: token.role,
        accessToken: token.accessToken,
      };
      return session;
    },
  },
  events: {
    async signOut() {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error during Supabase sign-out:", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};