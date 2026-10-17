"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintButton() {
  return (
    <Button data-testid="certificate-print" onClick={() => window.print()} variant="outline">
      <Printer /> พิมพ์ / บันทึกเป็น PDF
    </Button>
  );
}
