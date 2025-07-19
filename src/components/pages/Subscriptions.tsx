"use client";
import React from "react";

import { KeyBundles } from "../subscriptions/services/KeyBundles";

const Subscriptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the perfect plan for your business needs
        </p>
      </div>
      <div>
        <KeyBundles />
      </div>
    </div>
  );
};

export default Subscriptions;
