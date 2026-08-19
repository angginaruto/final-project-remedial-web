import { useEffect, useState } from "react";
import "./DailyProductSalesPage.css";

type DailyProductSales = {
  date: string;
  productId: number;
  productName: string;
  quantitySold: number;
  totalSales: number;
};

export default function DailyProductSalesPage() {
  const [reports, setReports] = useState<DailyProductSales[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDailyProductSales = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      const response = await fetch(
        `${API_URL}/api/reports/products?${params.toString()}`,
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

      setReports(result.data);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil daily product sales report",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyProductSales();
  }, []);

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      fetchDailyProductSales();
    }, 0);
  };

  const totalQuantity = reports.reduce((sum, r) => sum + r.quantitySold, 0);
  const totalSales = reports.reduce((sum, r) => sum + r.totalSales, 0);

  return (
    <div className="dps">
      <header className="dps-header">
        <h1 className="dps-title">Daily Product Sales</h1>
      </header>

      <div className="dps-filter">
        <div className="dps-filter-field">
          <label>Mulai tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="dps-filter-field">
          <label>Sampai tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="dps-filter-actions">
          <button className="dps-btn dps-btn--primary" onClick={fetchDailyProductSales}>
            Filter
          </button>
          <button className="dps-btn dps-btn--ghost" onClick={resetFilter}>
            Reset
          </button>
        </div>
      </div>

      {!loading && reports.length > 0 && (
        <div className="dps-summary">
          <div className="dps-summary-item">
            <span className="dps-summary-label">Total Terjual</span>
            <span className="dps-summary-value">
              {totalQuantity.toLocaleString("id-ID")} unit
            </span>
          </div>
          <div className="dps-summary-divider" />
          <div className="dps-summary-item">
            <span className="dps-summary-label">Total Penjualan</span>
            <span className="dps-summary-value dps-summary-value--accent">
              Rp {totalSales.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="dps-state">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="dps-state">Belum ada data penjualan produk.</div>
      ) : (
        <div className="dps-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Jumlah Terjual</th>
                <th>Total Penjualan</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr key={`${report.date}-${report.productId}`}>
                  <td className="dps-cell--mono dps-cell--date">
                    {new Date(`${report.date}T00:00:00`).toLocaleDateString("id-ID")}
                  </td>

                  <td className="dps-cell--name">{report.productName}</td>

                  <td className="dps-cell--mono">{report.quantitySold}</td>

                  <td className="dps-cell--mono dps-cell--sales">
                    Rp {report.totalSales.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}