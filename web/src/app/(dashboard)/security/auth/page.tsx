"use client";

import { redirect } from "next/navigation";

export default function SecurityAuthPage() {
  // Redirect to the settings security page
  redirect("/settings/security");
}