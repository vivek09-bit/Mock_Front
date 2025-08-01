import React, { useState } from "react";

const ContactForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent!");
  };

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <h1 style={styles.heading}>Let's Talk</h1>
          <p style={styles.subtext}>
            We usually reply within<br />one business day.
          </p>
          <div style={styles.contactInfo}>
            <div style={styles.infoRow}>
              <span style={styles.iconEmail}></span>
              <div>
                <span style={styles.infoTitle}>Email</span>
                <div style={styles.infoDetail}>hello@teamignite.com</div>
              </div>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.iconPhone}></span>
              <div>
                <span style={styles.infoTitle}>Phone</span>
                <div style={styles.infoDetail}>+1 123 456 7890</div>
              </div>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.iconLocation}></span>
              <div>
                <span style={styles.infoTitle}>100 Innovation</span>
                <div style={styles.infoDetail}>Way, SF, CA 94107</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right/Form Panel */}
        <form style={styles.rightPanel} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <input
            style={styles.input}
            name="email"
            placeholder="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <input
            style={styles.input}
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <textarea
            style={styles.textarea}
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
          />
          <button style={styles.button} type="submit">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline styles
const styles = {
  root: {
    minHeight: "100vh",
    minWidth: "100vw",
    background: "linear-gradient(135deg, #197a8e 0%, #f7fdfa 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
  },
  container: {
    display: "flex",
    borderRadius: "32px",
    background: "rgba(255,255,255,0)",
    boxShadow: "0 12px 40px 0 rgba(30,60,180,0.10)",
    overflow: "hidden",
    minWidth: 750,
    maxWidth: 950,
  },
  leftPanel: {
    flex: "0 0 330px",
    background: "linear-gradient(120deg, #0082a0 0%, #249e97 100%)",
    color: "#fff",
    padding: "60px 38px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "36px 0",
    textAlign: "left",
    borderTopLeftRadius: "32px",
    borderBottomLeftRadius: "32px",
  },
  heading: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: 0,
  },
  subtext: {
    fontSize: "1.08rem",
    margin: "8px 0 0 0",
    lineHeight: 1.3,
    color: "#e8f3fe",
  },
  contactInfo: {
    marginTop: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "38px 0",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    fontSize: "1rem",
  },
  infoTitle: {
    fontWeight: "bold",
    fontSize: "1.06rem",
    letterSpacing: "0.01em",
  },
  infoDetail: {
    color: "#def3ff",
    fontSize: "0.99rem",
    fontWeight: 400,
  },
  iconEmail: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "linear-gradient(135deg, #e662ff 0%, #70eaff 100%)",
    display: "inline-block",
    backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M2 6V18H22V6H2ZM20 8V8.51001L12 13.01L4 8.51001V8H20ZM4 16V10.69L12 15.19L20 10.69V16H4Z" /></svg>')`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  },
  iconPhone: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "linear-gradient(135deg, #6a79fa 0%, #ff77b3 100%)",
    display: "inline-block",
    backgroundImage: `url('data:image/svg+xml;utf8,<svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.8 14.79 16.37 14.67 16.85 14.84C17.98 15.23 19.19 15.44 20.5 15.44C21.05 15.44 21.5 15.89 21.5 16.44V20.5C21.5 21.05 21.05 21.5 20.5 21.5C10.22 21.5 2.5 13.78 2.5 3.5C2.5 2.95 2.95 2.5 3.5 2.5H7.56C8.11 2.5 8.56 2.95 8.56 3.5C8.56 4.81 8.77 6.02 9.16 7.15C9.33 7.63 9.21 8.2 8.82 8.59L6.62 10.79Z" /></svg>')`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  },
  iconLocation: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "linear-gradient(135deg, #ff6976 0%, #ffc75a 100%)",
    display: "inline-block",
    backgroundImage: `url('data:image/svg+xml;utf8,<svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9C5 15.25 12 22 12 22C12 22 19 15.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" /></svg>')`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  },
  rightPanel: {
    flex: "1 1 350px",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 12px 40px 0 rgba(30,60,180,0.09)",
    borderTopRightRadius: "32px",
    borderBottomRightRadius: "32px",
    padding: "60px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: 340,
    justifyContent: "center",
  },
  input: {
    height: "48px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    padding: "0 18px",
    fontSize: "1rem",
    background: "#f6fafc",
    fontFamily: "inherit",
    boxSizing: "border-box"
  },
  textarea: {
    minHeight: "90px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    padding: "14px 18px",
    fontSize: "1rem",
    background: "#f6fafc",
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box"
  },
  button: {
    height: "48px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "bold",
    fontSize: "1.10rem",
    color: "#fff",
    background: "linear-gradient(120deg, #199489 0%, #31b6b6 100%)",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(49,182,182,.11)",
    marginTop: "10px",
    transition: "background .2s"
  }
};

export default ContactForm;
