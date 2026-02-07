import Link from "next/link"
import { RiShieldCheckLine, RiFileTextLine, RiHome5Line } from "@remixicon/react"

export const metadata = {
  title: "Terms & Privacy | Database",
  description: "Terms of Service and Privacy Policy for Database business management platform",
}

export default function LegalPage() {
  return (
    <main className="legal-page">
      {/* Hero Section */}
      <section className="legal-hero">
        <div className="legal-hero-container">
          <h1 className="legal-hero-title">Legal Information</h1>
          <p className="legal-hero-description">
            Our commitment to transparency and your rights
          </p>
          <p className="legal-hero-updated">Last updated: February 7, 2026</p>
        </div>
      </section>

      {/* Navigation */}
      <nav className="legal-nav">
        <div className="legal-nav-container">
          <Link href="/" className="legal-nav-link">
            <RiHome5Line className="legal-nav-icon" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <a href="#terms" className="legal-nav-link">
            <RiFileTextLine className="legal-nav-icon" aria-hidden="true" />
            <span>Terms of Service</span>
          </a>
          <a href="#privacy" className="legal-nav-link">
            <RiShieldCheckLine className="legal-nav-icon" aria-hidden="true" />
            <span>Privacy Policy</span>
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="legal-content-wrapper">
        <div className="legal-content-container">
          {/* Terms of Service Section */}
          <section id="terms" className="legal-section">
            <div className="legal-section-header">
              <RiFileTextLine className="legal-section-icon" aria-hidden="true" />
              <h2 className="legal-section-title">Terms of Service</h2>
            </div>

            <div className="legal-section-content">
              <div className="legal-subsection">
                <h3 className="legal-subsection-title">1. Acceptance of Terms</h3>
                <p className="legal-text">
                  By accessing and using Database's business management platform, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">2. Service Description</h3>
                <p className="legal-text">
                  Database provides a comprehensive business management platform designed for retailers, wholesalers, and industrial 
                  businesses. Our services include transaction management, reporting, customer relationship tools, and business analytics.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">3. User Accounts</h3>
                <p className="legal-text">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur 
                  under your account. You must notify us immediately of any unauthorized access or security breach.
                </p>
                <ul className="legal-list">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Promptly update any changes to your account information</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">4. Acceptable Use</h3>
                <p className="legal-text">
                  You agree to use our services only for lawful purposes and in accordance with these Terms. You may not:
                </p>
                <ul className="legal-list">
                  <li>Use the service in any way that violates applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to our systems or networks</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Impersonate another person or entity</li>
                </ul>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">5. Data Ownership</h3>
                <p className="legal-text">
                  You retain all rights to the data you input into our platform. We claim no ownership over your business data, 
                  customer information, or transaction records. You grant us a limited license to process and store your data 
                  solely for the purpose of providing our services.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">6. Service Availability</h3>
                <p className="legal-text">
                  While we strive for 99.9% uptime, we do not guarantee uninterrupted access to our services. We may perform 
                  scheduled maintenance and updates that may temporarily affect service availability. We will provide advance 
                  notice of planned maintenance whenever possible.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">7. Payment Terms</h3>
                <p className="legal-text">
                  Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as 
                  required by law. We reserve the right to modify our pricing with 30 days' notice to existing customers.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">8. Termination</h3>
                <p className="legal-text">
                  Either party may terminate this agreement at any time. Upon termination, you will have 30 days to export your 
                  data from our platform. We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">9. Limitation of Liability</h3>
                <p className="legal-text">
                  Database shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting 
                  from your use of or inability to use the service. Our total liability shall not exceed the amount you paid us in 
                  the twelve months preceding the claim.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">10. Changes to Terms</h3>
                <p className="legal-text">
                  We may update these Terms from time to time. We will notify you of material changes via email or through the 
                  platform. Continued use of our services after changes constitutes acceptance of the updated Terms.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section id="privacy" className="legal-section">
            <div className="legal-section-header">
              <RiShieldCheckLine className="legal-section-icon" aria-hidden="true" />
              <h2 className="legal-section-title">Privacy Policy</h2>
            </div>

            <div className="legal-section-content">
              <div className="legal-subsection">
                <h3 className="legal-subsection-title">1. Information We Collect</h3>
                <p className="legal-text">
                  We collect information necessary to provide and improve our business management services:
                </p>
                <ul className="legal-list">
                  <li><strong>Account Information:</strong> Name, email address, company details, and billing information</li>
                  <li><strong>Business Data:</strong> Transaction records, customer data, inventory information, and reports you create</li>
                  <li><strong>Usage Data:</strong> Log data, device information, and how you interact with our platform</li>
                  <li><strong>Communication Data:</strong> Support requests, feedback, and correspondence with our team</li>
                </ul>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">2. How We Use Your Information</h3>
                <p className="legal-text">
                  We use collected information to:
                </p>
                <ul className="legal-list">
                  <li>Provide, maintain, and improve our business management services</li>
                  <li>Process transactions and send related information</li>
                  <li>Respond to your requests, questions, and provide customer support</li>
                  <li>Send administrative information, updates, and security alerts</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Detect, prevent, and address technical issues and security threats</li>
                </ul>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">3. Data Storage and Security</h3>
                <p className="legal-text">
                  Your data is stored securely in Switzerland with enterprise-grade encryption. We implement industry-standard 
                  security measures including:
                </p>
                <ul className="legal-list">
                  <li>End-to-end encryption for data in transit and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Multi-factor authentication options</li>
                  <li>Automated backup systems with point-in-time recovery</li>
                  <li>Access controls and monitoring systems</li>
                </ul>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">4. Data Sharing and Disclosure</h3>
                <p className="legal-text">
                  We do not sell your personal information. We may share your information only in these limited circumstances:
                </p>
                <ul className="legal-list">
                  <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform (payment processors, hosting providers)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                </ul>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">5. Your Privacy Rights</h3>
                <p className="legal-text">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="legal-list">
                  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                  <li><strong>Export:</strong> Download your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                </ul>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">6. Cookies and Tracking</h3>
                <p className="legal-text">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. 
                  You can control cookie preferences through your browser settings. Essential cookies required for platform functionality 
                  cannot be disabled.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">7. Data Retention</h3>
                <p className="legal-text">
                  We retain your information for as long as your account is active or as needed to provide services. After account 
                  termination, we retain data for 90 days to allow for account recovery, then permanently delete it unless required 
                  by law to retain longer.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">8. International Data Transfers</h3>
                <p className="legal-text">
                  Your data is primarily stored in Switzerland. If we transfer data internationally, we ensure appropriate safeguards 
                  are in place, including standard contractual clauses and compliance with applicable data protection laws.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">9. Children's Privacy</h3>
                <p className="legal-text">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information 
                  from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </div>

              <div className="legal-subsection">
                <h3 className="legal-subsection-title">10. Changes to Privacy Policy</h3>
                <p className="legal-text">
                  We may update this Privacy Policy periodically. We will notify you of significant changes via email or through a 
                  prominent notice on our platform. Your continued use after changes indicates acceptance of the updated policy.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="legal-contact">
            <div className="legal-contact-content">
              <h3 className="legal-contact-title">Questions or Concerns?</h3>
              <p className="legal-contact-text">
                If you have any questions about these Terms or our Privacy Policy, please contact us:
              </p>
              <div className="legal-contact-details">
                <p><strong>Email:</strong> legal@database.com</p>
                <p><strong>Address:</strong> Database, Inc., Zurich, Switzerland</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
