import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await forgotPassword(email.trim());

      navigate("/verify-reset-otp", {
        state: { email: email.trim() },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your registered email address and we'll send you a
            verification code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              className="mt-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
