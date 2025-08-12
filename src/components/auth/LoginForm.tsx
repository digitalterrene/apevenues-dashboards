"use client";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });
        router.refresh();
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        toast.error("Login failed", {
          description: "Invalid email or password.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#6BADA0]">
            <Link className="" href={"/"}>
              APE Dashboard
            </Link>
          </CardTitle>
          <CardDescription>Sign in to your business dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="items-top flex space-x-2">
              <Checkbox
                onCheckedChange={(checked: boolean) => {
                  return checked
                    ? setIsPasswordVisible(true)
                    : setIsPasswordVisible(false);
                }}
                id="show-password"
                className="border "
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="show-password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Password
                </label>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer bg-[#6BADA0] hover:bg-[#8E9196]"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/signup")}
              className="text-[#6BADA0]  cursor-pointer hover:text-black text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
