"use client";

import { redirect } from "next/navigation";

export default function SecurityAuditPage() {
  // Redirect to the settings audit page
  redirect("/settings/audit");
}