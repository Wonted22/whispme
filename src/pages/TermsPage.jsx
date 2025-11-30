export default function TermsPage() {
  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toDateString()}</p>

      <p>
        By accessing and using WhispMe, you agree to the following Terms of Service.
      </p>

      <h2>1. Use of Service</h2>
      <p>You agree not to misuse WhispMe or harm the platform.</p>

      <h2>2. Premium Payments</h2>
      <p>All payments are handled by Paddle.</p>

      <h2>3. Contact</h2>
      <p>Email: support@whispme.online</p>
    </div>
  );
}
