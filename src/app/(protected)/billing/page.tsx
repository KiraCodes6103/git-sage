"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { createCheckoutSession } from "@/lib/stripe";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import React, { useState } from "react";

const BillingPage = () => {
  const { data: user } = api.project.getMyCredits.useQuery();
  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);
  const creditsToBuyAmount = creditsToBuy[0]!;
  const price = (creditsToBuyAmount * 2).toFixed(2);
  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>
      <p className="text-sm text-gray-500">
        You have <b>{user?.credits}</b> credits left to spend{" "}
      </p>

      <div className="h-2"></div>
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
        {" "}
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm">
            Each credit allows you to index 1 file in a repository.
          </p>{" "}
        </div>
        <p className="text-sm">
          E.g. If your project has 100 files, you will need 100 credits to index
          it.
        </p>{" "}
      </div>
      <div className="h-4"></div>
      <Slider
        defaultValue={[100]}
        min={20}
        max={1000}
        step={20}
        onValueChange={(value) => setCreditsToBuy(value)}
        value={creditsToBuy}
      />
      <div className="h-4"></div>
      <Button
        onClick={() => {
          createCheckoutSession(creditsToBuyAmount);
        }}
      >
        Buy {creditsToBuyAmount} for Rs.{price}
      </Button>
    </div>
  );
};

export default BillingPage;
