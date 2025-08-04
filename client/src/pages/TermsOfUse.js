import React from 'react';
import { Link } from 'react-router-dom';
import { Store, FileText, AlertTriangle, CheckCircle, XCircle, Scale } from 'lucide-react';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Merchants Pro</h1>
            </div>
            <Link
              to="/merchantspro"
              className="px-4 py-2 rounded-md font-medium text-gray-600 hover:text-indigo-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Use</h1>
            <p className="text-lg text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-indigo-600" />
                Acceptance of Terms
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using Merchants Pro, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please 
                  do not use this service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="h-6 w-6 mr-2 text-indigo-600" />
                Use License
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Permission is granted to temporarily use Merchants Pro for personal or commercial use, provided that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You use the service in compliance with all applicable laws and regulations</li>
                  <li>You do not use the service for any illegal or unauthorized purpose</li>
                  <li>You do not attempt to gain unauthorized access to our systems</li>
                  <li>You do not interfere with or disrupt the service</li>
                  <li>You respect the privacy and rights of others</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-indigo-600" />
                Prohibited Uses
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>You may not use our service to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send spam, unsolicited messages, or engage in mass messaging without consent</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Attempt to reverse engineer or hack our systems</li>
                  <li>Use the service for any fraudulent or deceptive practices</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Subscription fees are billed in advance on a monthly basis. All payments are 
                  non-refundable except as required by law. We reserve the right to modify our 
                  pricing with 30 days notice.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> You are responsible for ensuring that your payment 
                    information is accurate and up-to-date. Failed payments may result in service suspension.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We strive to maintain high service availability, but we do not guarantee uninterrupted 
                  access. We may temporarily suspend the service for maintenance, updates, or other 
                  operational reasons.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data and Privacy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your data is important to us. We handle your information in accordance with our 
                  Privacy Policy. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ensuring you have permission to contact the numbers in your lists</li>
                  <li>Complying with applicable data protection laws</li>
                  <li>Maintaining the security of your account credentials</li>
                  <li>Notifying us of any unauthorized use of your account</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="h-6 w-6 mr-2 text-red-600" />
                Termination
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your account immediately, without prior notice, for 
                  conduct that we believe violates these Terms of Use or is harmful to other users, 
                  us, or third parties.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  In no event shall Go AIz Technologies be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including without limitation, loss of 
                  profits, data, use, goodwill, or other intangible losses.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of 
                  any material changes via email or through the service. Your continued use of the 
                  service after such changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about these Terms of Use, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Email:</p>
                  <p>legal@goaiz.com</p>
                  <p className="font-medium mt-2">Address:</p>
                  <p>Go AIz Technologies<br />
                  [Your Business Address]<br />
                  [City, State, ZIP]</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse; 