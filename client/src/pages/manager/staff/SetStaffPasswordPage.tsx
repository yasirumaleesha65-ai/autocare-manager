import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { setStaffPassword } from "@/services/authService";

export default function SetStaffPasswordPage() {
  const location = useLocation();

  const email = location.state?.email || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const registrationToken = location.state?.registrationToken || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!registrationToken) {
      setError("Registration session expired. Please start again.");
      return;
    }

    setLoading(true);

    try {
      await setStaffPassword({
        password,
        registrationToken,
      });

      navigate("/manager/staff", {
        state: {
          successMessage: "Staff account created successfully.",
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to set password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Set Staff Password
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a password for the new staff account.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Email Address</Label>
            <Input value={email} disabled className="mt-2" />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
              minLength={8}
              className="mt-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              required
              minLength={8}
              className="mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Link to="/manager/staff">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>

            <Button type="submit" disabled={loading}>
              {loading ? "Setting Password..." : "Set Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
