import { useState } from "react";
import { useNavigate } from "react-router";
import { GOLD, CARD } from "../../store/constants";
import { GoldBtn } from "../../components/shared/GoldBtn";
import { authService } from "../../services/authService";
import { useAuth } from "../../store/authContext";
import { usePageTitle } from "../../shared/usePageTitle";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  usePageTitle("Administrator Login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      login();
      navigate("/administrator/dashboard");
    } catch (err: any) {
      setError(err.message || "بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-8"
        style={{ background: CARD, border: `1px solid rgba(212,175,55,0.15)` }}
      >
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="A.S Brand Store"
            style={{ height: 90, width: "auto", objectFit: "contain" }}
          />
        </div>

        <h2 className="text-xl font-black text-white text-center mb-1">لوحة التحكم</h2>
        <p className="text-xs text-gray-500 text-center mb-6">يرجى تسجيل الدخول لمتابعة العمل كمشرف</p>

        {error && (
          <div
            className="p-3 mb-4 rounded-xl text-xs text-red-500 text-center font-bold"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">البريد الإلكتروني</label>
            <input
              required
              type="email"
              placeholder="admin@asbrandstore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600"
              style={{ background: "#111", border: `1px solid rgba(212,175,55,0.18)` }}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">كلمة المرور</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600"
              style={{ background: "#111", border: `1px solid rgba(212,175,55,0.18)` }}
            />
          </div>
        </div>

        <GoldBtn type="submit" size="lg" className="w-full font-bold" disabled={loading}>
          {loading ? "جاري التحقق..." : "تسجيل الدخول"}
        </GoldBtn>
      </form>
    </div>
  );
}
