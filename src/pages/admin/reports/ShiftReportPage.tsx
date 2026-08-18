import { useEffect, useState } from "react";
import "./ShiftReportPage.css";

type ShiftReport = {
  id: number;
  cashierId: number;
  cashier: {
    id: number;
    name: string;
    email: string;
  };

  startedAt: string;
  endedAt: string | null;

  initialCash: number;
  finalCash: number | null;
  expectedCash: number | null;
  cashDifference: number | null;

  status: string;

  totalTransactions?: number;
  totalDebit?: number;
};

export default function ShiftReportPage() {
  const [shifts, setShifts] = useState<ShiftReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  const fetchShiftReport = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (date) {
        params.append("date", date);
      }

      const response = await fetch(
        `http://localhost:5000/api/reports/shifts?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setShifts(result.data);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "Gagal mengambil shift report",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDifferenceLabel = (cashDifference: number | null) => {
    const difference = Number(cashDifference ?? 0);

    if (difference === 0) {
      return "MATCH";
    }

    return difference > 0 ? "OVER" : "SHORT";
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetFilter = () => {
    setDate("");

    setTimeout(() => {
      fetchShiftReport();
    }, 0);
  };

  useEffect(() => {
    fetchShiftReport();
  }, []);

  const openCount = shifts.filter((s) => s.status.toUpperCase() === "OPEN").length;
  const shortCount = shifts.filter((s) => getDifferenceLabel(s.cashDifference) === "SHORT").length;
  const totalTransactions = shifts.reduce((sum, s) => sum + (s.totalTransactions ?? 0), 0);

  return (
    <div className="srp">
      <header className="srp-header">
        <h1 className="srp-title">Shift Report</h1>
      </header>

      <div className="srp-filter">
        <div className="srp-filter-field">
          <label>Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="srp-filter-actions">
          <button className="srp-btn srp-btn--primary" onClick={fetchShiftReport}>
            Filter
          </button>
          <button className="srp-btn srp-btn--ghost" onClick={resetFilter}>
            Reset
          </button>
        </div>
      </div>

      {!loading && shifts.length > 0 && (
        <div className="srp-summary">
          <div className="srp-summary-item">
            <span className="srp-summary-label">Total Shift</span>
            <span className="srp-summary-value">{shifts.length}</span>
          </div>
          <div className="srp-summary-divider" />
          <div className="srp-summary-item">
            <span className="srp-summary-label">Sedang Berjalan</span>
            <span className="srp-summary-value">{openCount}</span>
          </div>
          <div className="srp-summary-divider" />
          <div className="srp-summary-item">
            <span className="srp-summary-label">Total Transaksi</span>
            <span className="srp-summary-value">{totalTransactions}</span>
          </div>
          <div className="srp-summary-divider" />
          <div className="srp-summary-item">
            <span className="srp-summary-label">Selisih Short</span>
            <span
              className={`srp-summary-value ${shortCount > 0 ? "srp-summary-value--warn" : "srp-summary-value--accent"}`}
            >
              {shortCount} shift
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="srp-state">Loading...</div>
      ) : shifts.length === 0 ? (
        <div className="srp-state">Belum ada data shift.</div>
      ) : (
        <div className="srp-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kasir</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Uang Awal</th>
                <th>Total Transaksi</th>
                <th>Debit</th>
                <th>Expected Cash</th>
                <th>Uang Akhir</th>
                <th>Selisih</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {shifts.map((shift) => {
                const diffLabel = getDifferenceLabel(shift.cashDifference);
                const diffValue = Number(shift.cashDifference ?? 0);

                return (
                  <tr key={shift.id}>
                    <td className="srp-cell--name">{shift.cashier.name}</td>

                    <td className="srp-cell--mono srp-cell--muted">
                      {formatDateTime(shift.startedAt)}
                    </td>

                    <td className="srp-cell--mono srp-cell--muted">
                      {formatDateTime(shift.endedAt)}
                    </td>

                    <td className="srp-cell--mono">
                      Rp {Number(shift.initialCash).toLocaleString("id-ID")}
                    </td>

                    <td className="srp-cell--mono">{shift.totalTransactions ?? 0}</td>

                    <td className="srp-cell--mono">
                      Rp {Number(shift.totalDebit ?? 0).toLocaleString("id-ID")}
                    </td>

                    <td className="srp-cell--mono">
                      Rp {Number(shift.expectedCash ?? 0).toLocaleString("id-ID")}
                    </td>

                    <td className="srp-cell--mono">
                      Rp {Number(shift.finalCash ?? 0).toLocaleString("id-ID")}
                    </td>

                    <td>
                      <div className="srp-diff">
                        <span className="srp-cell--mono">
                          Rp {diffValue.toLocaleString("id-ID")}
                        </span>
                        <span className={`srp-badge srp-badge--${diffLabel.toLowerCase()}`}>
                          {diffLabel}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`srp-status srp-status--${shift.status.toLowerCase()}`}>
                        {shift.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}