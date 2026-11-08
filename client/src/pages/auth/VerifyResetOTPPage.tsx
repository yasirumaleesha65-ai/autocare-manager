import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { verifyResetOTP } from "@/services/authService";

export default function VerifyResetOTPPage() {
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await verifyResetOTP({
        email,
        otp,
      });

      navigate("/reset-password", {
        state: {
          email,
          resetToken: response.resetToken,
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Verify OTP</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the six-digit verification code sent to your email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Email Address</Label>
            <Input value={email} disabled className="mt-2" />
          </div>

          <div>
            <Label htmlFor="otp">Verification OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
              className="mt-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={otp.length !== 6 || loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
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
