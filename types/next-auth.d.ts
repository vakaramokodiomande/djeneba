import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "producteur" | "acheteur" | "admin" | "transporteur";
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "producteur" | "acheteur" | "admin" | "transporteur";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "producteur" | "acheteur" | "admin" | "transporteur";
  }
}
