import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyRegistrationOTP } from "@/services/authService";

export default function VerifyStaffOTPPage() {
  const location = useLocation();

  const email = location.state?.email || "";
  const userId = location.state?.userId || "";

  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await verifyRegistrationOTP({
        userId,
        otp,
      });

      navigate("/manager/staff/set-password", {
        state: {
          userId,
          email,
          registrationToken: response.registrationToken,
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
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Verify Staff Email
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the verification code sent to the staff member's email address.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
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

          <div className="flex gap-3">
            <Link to="/manager/staff">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            <Button type="submit" disabled={otp.length !== 6 || loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
