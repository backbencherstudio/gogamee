// services/userService.ts

import axiosClient from "../lib/axiosClient";

export const getUsers = async () => {
  const response = await axiosClient.get("/users");
  return response.data.data || [];
};

export const createUser = async (payload: { name: string; email: string }) => {
  const response = await axiosClient.post("/users", payload);
  return response.data.data;
};
