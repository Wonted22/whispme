export default function RefundPage() {
  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>Refund Policy</h1>
      <p>Last updated: {new Date().toDateString()}</p>

      <p>Refunds are processed by Paddle according to their policy.</p>

      <h2>Request a refund</h2>
      <p>Email Paddle: help@paddle.com</p>

      <h2>Contact</h2>
      <p>support@whispme.online</p>
    </div>
  );
}
