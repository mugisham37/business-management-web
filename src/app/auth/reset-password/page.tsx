"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PasswordResetContainer } from "@/components/auth/password-reset-container";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleBackToSignIn = () => {
    router.push("/auth");
  };

  return <PasswordResetContainer onBackToSignIn={handleBackToSignIn} resetToken={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center bg-background">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
