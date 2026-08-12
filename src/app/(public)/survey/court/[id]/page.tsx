"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Маршрут court/[id] не используется — анкета на opros.sot.kg */
export default function SurveyCourtRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/survey");
  }, [router]);
  return null;
}
