"use client";

import { browserApiClient } from "@/src/lib/bff/browser-api-client";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const result = await browserApiClient.post("/auth/login", {
        email,
        password,
      });

      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button type="submit">Login</button>
    </form>
  );
}
