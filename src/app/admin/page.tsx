"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, Dumbbell, LogOut, Trash2, RefreshCw, BarChart3, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const CARD = { background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 };

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "COACH" | "TRAINEE">("ALL");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.status === 401) { router.push("/admin-login"); return; }
    const { users } = await res.json();
    setUsers(users);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin-login");
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`למחוק את ${name}? הפעולה בלתי הפיכה.`)) return;
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, action: "delete" }) });
    fetchUsers();
  };

  const coaches = users.filter(u => u.role === "COACH");
  const trainees = users.filter(u => u.role === "TRAINEE");

  const filtered = users.filter(u => {
    const matchRole = filter === "ALL" || u.role === filter;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const BADGE: Record<string, any> = {
    COACH: { background: "rgba(245,197,24,0.12)", color: "#F5C518", border: "1px solid rgba(245,197,24,0.2)" },
    TRAINEE: { background: "rgba(59,130,246,0.12)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" },
    ADMIN: { background: "rgba(139,92,246,0.12)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.2)" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111", color: "#fff" }} dir="rtl">
      {/* Header */}
      <div style={{ background: "#1C1C1E", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#F5C518", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield style={{ width: 18, height: 18, color: "#111" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Admin Panel</div>
            <div style={{ color: "#52525B", fontSize: 11 }}>SmartFitCoach</div>
          </div>
        </div>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171", borderRadius: 999, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          <LogOut style={{ width: 14, height: 14 }} /> יציאה
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          <div style={{ ...CARD, padding: 18 }}>
            <div style={{ width: 32, height: 32, background: "rgba(245,197,24,0.12)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Users style={{ width: 16, height: 16, color: "#F5C518" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{users.length}</div>
            <div style={{ color: "#71717A", fontSize: 12 }}>סה״כ משתמשים</div>
          </div>
          <div style={{ ...CARD, padding: 18 }}>
            <div style={{ width: 32, height: 32, background: "rgba(16,185,129,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <UserCheck style={{ width: 16, height: 16, color: "#10B981" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{coaches.length}</div>
            <div style={{ color: "#71717A", fontSize: 12 }}>מאמנים</div>
          </div>
          <div style={{ ...CARD, padding: 18 }}>
            <div style={{ width: 32, height: 32, background: "rgba(59,130,246,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Dumbbell style={{ width: 16, height: 16, color: "#60A5FA" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{trainees.length}</div>
            <div style={{ color: "#71717A", fontSize: 12 }}>מתאמנים</div>
          </div>
        </div>

        {/* Filter + Search */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או אימייל..."
            style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, height: 40, padding: "0 14px", color: "#fff", fontSize: 13, flex: 1, outline: "none" }}
          />
          {(["ALL", "COACH", "TRAINEE"] as const).map(r => (
            <button key={r} onClick={() => setFilter(r)}
              style={{ background: filter === r ? "#F5C518" : "#1C1C1E", color: filter === r ? "#111" : "#71717A", border: "1px solid", borderColor: filter === r ? "#F5C518" : "rgba(255,255,255,0.07)", borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {r === "ALL" ? "הכל" : r === "COACH" ? "מאמנים" : "מתאמנים"}
            </button>
          ))}
          <button onClick={fetchUsers} style={{ width: 40, height: 40, background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#71717A" }}>
            <RefreshCw style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Users Table */}
        <div style={{ ...CARD, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "#48484A", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const }}>משתמש</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "#48484A", fontSize: 11, fontWeight: 700 }}>תפקיד</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "#48484A", fontSize: 11, fontWeight: 700 }}>הצטרף</th>
                <th style={{ padding: "12px 16px", textAlign: "right", color: "#48484A", fontSize: 11, fontWeight: 700 }}>פעילות</th>
                <th style={{ padding: "12px 16px" }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#52525B" }}>טוען...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#52525B" }}>לא נמצאו תוצאות</td></tr>
              ) : filtered.map((user, i) => (
                <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name ?? "—"}</div>
                    <div style={{ color: "#52525B", fontSize: 12 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ ...BADGE[user.role], padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      {user.role === "COACH" ? "מאמן" : user.role === "TRAINEE" ? "מתאמן" : "אדמין"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#71717A", fontSize: 12 }}>
                    {format(new Date(user.createdAt), "d/M/yy", { locale: he })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {user.role === "COACH" && <span style={{ color: "#71717A", fontSize: 12 }}>{user._count.trainees} מתאמנים</span>}
                    {user.role === "TRAINEE" && <span style={{ color: "#71717A", fontSize: 12 }}>{user._count.workoutLogs} אימונים</span>}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "left" }}>
                    <button onClick={() => deleteUser(user.id, user.name ?? user.email)}
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)", color: "#F87171", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
