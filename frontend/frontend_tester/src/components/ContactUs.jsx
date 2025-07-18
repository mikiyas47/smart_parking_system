import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css'; // We'll reuse the same styling
import Header from './Header';

function ContactUs() {
  return (
    <>
   
    <div className="page-container">
      <header className="page-header">
        <div className="logo-container">
          
        </div>
        <nav className="page-nav ">
          
          <Link to="/owner-landing">Find Parking</Link>
        </nav>
      </header>
      
      <div className="content-container">
        <h1>Contact Us</h1>
        <div className="content-section">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you. Please feel free to reach out with any questions, feedback, or inquiries.</p>
          
          <div className="contact-info">
            <div className="contact-item">
              <h3>Customer Support</h3>
              <p>Email: support@smartparking.com</p>
              <p>Phone: (123) 456-7890</p>
              <p>Hours: Monday-Friday, 9am-5pm</p>
            </div>
            
            <div className="contact-item">
              <h3>Business Inquiries</h3>
              <p>Email: business@smartparking.com</p>
              <p>Phone: (123) 456-7891</p>
            </div>
          </div>
          
          <div className="contact-form">
            <h3>Send us a Message</h3>
            <form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Your name" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Your email" />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" placeholder="Subject" />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" placeholder="Your message" rows="5"></textarea>
              </div>
              
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>
      
      <footer className="page-footer">
        <p>&copy; {new Date().getFullYear()} Smart Parking. All rights reserved.</p>
      </footer>
    </div>
    </>
  );
}

export default ContactUs;
