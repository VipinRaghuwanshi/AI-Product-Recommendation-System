import { useState } from "react";
import products from "./products";
import { getRecommendations } from "./services/aiService";

const suggestions = [
  "Phone under $500",
  "Best laptop",
  "Laptop under $700",
  "Cheapest phone",
];

const categoryIcon = (category) => {
  if (category === "phone") return "📱";
  if (category === "laptop") return "💻";
  return "🛍️";
};

function ProductCard({ product, recommended }) {
  return (
    <div style={{
      background: recommended ? "#eff6ff" : "#fff",
      border: recommended ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      borderRadius: 14,
      padding: "20px 16px",
      position: "relative",
      boxShadow: recommended
        ? "0 2px 12px rgba(59,130,246,0.15)"
        : "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {recommended && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "#3b82f6", color: "#fff",
          fontSize: 11, fontWeight: 700,
          padding: "3px 10px", borderRadius: 20,
          animation: "pulse 1.5s infinite",
        }}>
          ✓ Match
        </span>
      )}
      <div style={{ fontSize: 32, marginBottom: 10 }}>
        {categoryIcon(product.category)}
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#111", marginBottom: 4 }}>
        {product.name}
      </div>
      <div style={{
        display: "inline-block",
        background: product.category === "phone" ? "#fef3c7" : "#f0fdf4",
        color: product.category === "phone" ? "#92400e" : "#166534",
        fontSize: 11, fontWeight: 600,
        padding: "2px 10px", borderRadius: 20, marginBottom: 10,
        textTransform: "capitalize",
      }}>
        {product.category}
      </div>
      <div style={{ color: "#16a34a", fontWeight: 800, fontSize: 20 }}>
        ${product.price}
      </div>
    </div>
  );
}

const TABS = [
  { label: "All", value: "all" },
  { label: "📱 Phones", value: "phone" },
  { label: "💻 Laptops", value: "laptop" },
];

function App() {
  const [input, setInput] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [validationMsg, setValidationMsg] = useState("");

  const handleRecommend = async (query) => {
    const q = query || input;
    if (!q.trim()) {
      setValidationMsg("⚠️ Please enter your preference first!");
      return;
    }
    setValidationMsg("");
    setInput(q);
    setLoading(true);
    setError("");
    setSearched(false);
    setActiveTab("all");

    try {
      const names = await getRecommendations(q, products);
      const filtered = products.filter((p) => names.includes(p.name));
      setRecommended(filtered);
      setSearched(true);
    } catch {
      setError("Failed to get recommendations. Please try again.");
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  };

  const recommendedIds = new Set(recommended.map((p) => p.id));

  // Base list: recommended first, then rest
  const baseList = searched
    ? [...recommended, ...products.filter((p) => !recommendedIds.has(p.id))]
    : products;

  // Apply category tab filter
  const displayList = activeTab === "all"
    ? baseList
    : baseList.filter((p) => p.category === activeTab);

  const tabCounts = {
    all: baseList.length,
    phone: baseList.filter((p) => p.category === "phone").length,
    laptop: baseList.filter((p) => p.category === "laptop").length,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f1f5f9",
      fontFamily: "system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#1e40af",
        padding: "28px 24px 24px",
        textAlign: "center",
        color: "#fff",
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
          AI Product Finder
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.85 }}>
          Tell us what you're looking for
        </p>
      </div>

      {/* Search Box */}
      <div style={{
        background: "#fff",
        padding: "20px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setValidationMsg(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleRecommend()}
            placeholder="e.g. phone under $500"
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 10,
              border: validationMsg ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
              fontSize: 15,
              outline: "none",
              background: "#f9fafb",
            }}
          />
          <button
            onClick={() => handleRecommend()}
            disabled={loading}
            style={{
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 22px",
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳" : "Search"}
          </button>
        </div>

        {/* Validation Message */}
        {validationMsg && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#ef4444" }}>
            {validationMsg}
          </p>
        )}

        {/* Quick Suggestions */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#9ca3af", alignSelf: "center" }}>Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleRecommend(s)}
              style={{
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "5px 14px",
                fontSize: 12,
                color: "#334155",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          margin: "12px 16px 0",
          background: "#fee2e2", color: "#dc2626",
          padding: "12px 14px", borderRadius: 10, fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Category Filter Tabs */}
      <div style={{
        display: "flex",
        gap: 8,
        padding: "16px 16px 0",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === tab.value ? "#2563eb" : "#fff",
              color: activeTab === tab.value ? "#fff" : "#475569",
              boxShadow: activeTab === tab.value
                ? "0 2px 8px rgba(37,99,235,0.3)"
                : "0 1px 3px rgba(0,0,0,0.08)",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
            <span style={{
              marginLeft: 6,
              background: activeTab === tab.value ? "rgba(255,255,255,0.25)" : "#f1f5f9",
              color: activeTab === tab.value ? "#fff" : "#94a3b8",
              fontSize: 11,
              padding: "1px 7px",
              borderRadius: 20,
              fontWeight: 700,
            }}>
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div style={{ padding: "14px 16px 10px" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
          {searched
            ? `✅ Recommended for You (${recommended.length} found)`
            : `All Products (${products.length})`}
        </div>
      </div>

      {/* No Results */}
      {displayList.length === 0 && (
        <div style={{
          textAlign: "center", padding: "40px 20px",
          color: "#94a3b8", fontSize: 15,
        }}>
          😕 No products found for this filter.
        </div>
      )}

      {/* Product Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 14,
        padding: "0 16px 40px",
      }}>
        {displayList.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            recommended={recommendedIds.has(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;