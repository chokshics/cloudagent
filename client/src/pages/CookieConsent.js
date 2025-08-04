import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Cookie, Settings, Info, Shield, Eye } from 'lucide-react';

const CookieConsent = () => {
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
              <Cookie className="h-12 w-12 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-lg text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="h-6 w-6 mr-2 text-indigo-600" />
                What Are Cookies?
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Cookies are small text files that are placed on your device when you visit our 
                  website. They help us provide you with a better experience by remembering your 
                  preferences and analyzing how you use our site.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-indigo-600" />
                Types of Cookies We Use
              </h2>
              <div className="space-y-6 text-gray-700">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Essential Cookies</h3>
                  <p className="text-blue-800 text-sm">
                    These cookies are necessary for the website to function properly. They enable 
                    basic functions like page navigation and access to secure areas. The website 
                    cannot function properly without these cookies.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Functional Cookies</h3>
                  <p className="text-green-800 text-sm">
                    These cookies allow the website to remember choices you make and provide 
                    enhanced, more personal features. They may be set by us or by third-party 
                    providers whose services we have added to our pages.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Analytics Cookies</h3>
                  <p className="text-yellow-800 text-sm">
                    These cookies help us understand how visitors interact with our website by 
                    collecting and reporting information anonymously. This helps us improve our 
                    website and services.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Marketing Cookies</h3>
                  <p className="text-purple-800 text-sm">
                    These cookies are used to track visitors across websites. The intention is 
                    to display ads that are relevant and engaging for individual users.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-indigo-600" />
                How We Use Cookies
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To remember your login status and preferences</li>
                  <li>To analyze how our website is used and improve its functionality</li>
                  <li>To provide personalized content and advertisements</li>
                  <li>To ensure the security of your account</li>
                  <li>To provide customer support and technical assistance</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-indigo-600" />
                Third-Party Cookies
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Some cookies are placed by third-party services that appear on our pages. 
                  These third parties may include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Google Analytics for website analytics</li>
                  <li>Payment processors for secure transactions</li>
                  <li>Social media platforms for sharing features</li>
                  <li>Customer support tools for assistance</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> We do not control these third-party cookies and they 
                    are subject to the privacy policies of the respective third parties.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>You can control and manage cookies in several ways:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Browser Settings:</strong> Most browsers allow you to refuse cookies 
                    or to delete existing cookies. Check your browser's help menu for instructions.
                  </li>
                  <li>
                    <strong>Cookie Consent:</strong> When you first visit our site, you can choose 
                    which types of cookies to accept.
                  </li>
                  <li>
                    <strong>Opt-Out Links:</strong> Some third-party services provide opt-out 
                    mechanisms for their cookies.
                  </li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Disabling certain cookies may affect the 
                    functionality of our website and your user experience.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Duration</h2>
              <div className="space-y-4 text-gray-700">
                <p>Cookies on our website may be:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Session Cookies:</strong> Temporary cookies that are deleted when you 
                    close your browser
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Cookies that remain on your device for a 
                    set period or until you delete them
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our 
                  practices or for other operational, legal, or regulatory reasons. We will notify 
                  you of any material changes by posting the new policy on this page.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Email:</p>
                  <p>privacy@goaiz.com</p>
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

export default CookieConsent; 