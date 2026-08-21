import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "32rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Page not found
        </h2>
        <p style={{ color: "#555", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/" style={{ color: "#111", textDecoration: "underline" }}>
          Go back home
        </Link>
      </div>
    </div>
  );
}
