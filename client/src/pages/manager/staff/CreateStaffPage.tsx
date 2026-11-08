import { useState, type FormEvent } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { createStaffUser } from "@/services/authService";

const staffRoles = [
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "MECHANIC", label: "Mechanic" },
  { value: "INVENTORY", label: "Inventory Staff" },
];

export default function CreateStaffPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("RECEPTIONIST");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await createStaffUser({
        name: name.trim(),
        email: email.trim(),
        role: role as "RECEPTIONIST" | "MECHANIC" | "INVENTORY",
      });

      navigate("/manager/staff/verify-otp", {
        state: {
          userId: response.userId,
          email: email.trim(),
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to create staff account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/manager/staff"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Staff Management
        </Link>

        <div className="mt-5">
          <h1 className="text-2xl font-bold text-slate-900">
            Create Staff Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Register a new employee for your vehicle service center.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
            <UserPlus size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Staff Information</h2>
            <p className="text-xs text-slate-500">
              Enter the employee's basic details.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="employee@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Staff Role</Label>

          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
          >
            {staffRoles.map((staffRole) => (
              <option key={staffRole.value} value={staffRole.value}>
                {staffRole.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link to="/manager/staff">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>

          <Button type="submit" disabled={loading}>
            <UserPlus size={17} />
            {loading ? "Creating..." : "Create Staff"}
          </Button>
        </div>
      </form>
    </div>
  );
}
