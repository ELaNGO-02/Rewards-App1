import React from "react";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3>Rewards App</h3>
          <p>Track your customer transactions and reward points easily.</p>
        </div>

        <div className="footer-center">
          <p>© {currentYear} Rewards App. All rights reserved.</p>
        </div>

        <div className="footer-right">
          <a href="https://github.com/arulolirajaram/rewards-app" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.atmaaisolutions.com/" target="_blank">Contact US</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
