import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setError("Password reset session expired. Please start again.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        password,
        resetToken,
      });

      navigate("/login", {
        state: {
          successMessage: "Password reset successfully. Please log in.",
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Email Address</Label>
            <Input value={email} disabled className="mt-2" />
          </div>

          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              minLength={8}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              required
              className="mt-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting Password..." : "Reset Password"}
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
