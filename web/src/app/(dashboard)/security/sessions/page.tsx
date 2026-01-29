"use client";

import { redirect } from "next/navigation";

export default function SecuritySessionsPage() {
  // Redirect to the settings sessions page
  redirect("/settings/sessions");
}