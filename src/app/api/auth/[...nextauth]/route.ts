import NextAuth from "next-auth";
import { authOptions } from "./options"; 

export const { GET, POST } = NextAuth(authOptions);