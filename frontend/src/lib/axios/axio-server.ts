import axios from "axios";

export const serverClient = axios.create({
  baseURL: process.env.BACKEND_API_URL || "http://localhost:8080/api/v1",

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
  },
});
