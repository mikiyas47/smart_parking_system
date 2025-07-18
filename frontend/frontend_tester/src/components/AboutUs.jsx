import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

function AboutUs() {

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="logo-container">
          
        </div>
        <nav className="page-nav">
        
          <Link to="/owner-landing">Find Parking</Link>
        </nav>
      </header>
      
      <main className="about-content">
        <h1>About Our Parking Management System</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We are committed to revolutionizing parking management with our comprehensive solution that streamlines 
            car parking operations for businesses, municipalities, and property managers. Our mission is to make 
            parking management efficient, transparent, and hassle-free.
          </p>
        </section>
        
        <section className="about-section">
          <h2>System Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Slot Management</h3>
              <p>Create, track, and manage parking slots across multiple locations with real-time status updates.</p>
            </div>
            
            <div className="feature-card">
              <h3>Car Registration</h3>
              <p>Register and verify vehicles in the system with comprehensive car details and owner information.</p>
            </div>
            
            <div className="feature-card">
              <h3>Check-In/Check-Out</h3>
              <p>Streamlined process for checking cars in and out of parking slots with automated status updates.</p>
            </div>
            
            <div className="feature-card">
              <h3>Reporting</h3>
              <p>Generate detailed reports for any date range with comprehensive statistics and analytics.</p>
            </div>
            
            <div className="feature-card">
              <h3>User Management</h3>
              <p>Role-based system with dedicated interfaces for administrators and parking agents.</p>
            </div>
            
            <div className="feature-card">
              <h3>Real-time Dashboard</h3>
              <p>Live monitoring of parking space availability and usage patterns.</p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Our Team</h2>
          <p>
            Our team of dedicated developers, designers, and parking management experts work together to create 
            a solution that addresses the real-world challenges of modern parking management. With backgrounds in 
            software engineering, urban planning, and customer service, we bring a multidisciplinary approach to 
            solving parking challenges.
          </p>
        </section>
        
        <section className="about-section">
          <h2>Contact Us</h2>
          <p>
            For support or inquiries about our parking management system, please contact us at:<br />
            Email: support@parkingsystem.com<br />
            Phone: (123) 456-7890
          </p>
        </section>
      </main>
    </div>
  );
}

export default AboutUs;
