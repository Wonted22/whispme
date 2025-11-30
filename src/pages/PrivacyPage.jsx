export default function PrivacyPage() {
  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toDateString()}</p>

      <p>We collect minimal data to operate the service.</p>

      <h2>Payments</h2>
      <p>Paddle handles all billing & card information.</p>

      <h2>Contact</h2>
      <p>Email: support@whispme.online</p>
    </div>
  );
}
