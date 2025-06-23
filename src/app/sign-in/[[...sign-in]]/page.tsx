'use client';

import { SignIn } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 dark:from-[#0f0f0f] dark:to-[#1f1f1f] px-4">
      <Card className="w-full max-w-md shadow-2xl border-none bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Welcome to GitSage</CardTitle>
        </CardHeader>
        <CardContent>
          <SignIn />
        </CardContent>
      </Card>
    </div>
  );
}
