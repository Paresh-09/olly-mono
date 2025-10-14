import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="flex justify-center items-center  p-4">
            <div className="max-w-6xl p-6 rounded-lg">
                <h1 className="text-xl font-semibold text-center mb-4">Privacy Policy</h1>
                <p className="text-sm text-gray-600 mb-4">Last updated: June 25, 2025.</p>

                <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
                <p>Olly, your personal AI social media assistant, is committed to protecting your privacy. This Privacy Policy outlines our practices regarding the handling of information in relation to the Olly platform and extension, including what information we collect, how we use data, and your rights concerning privacy.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">2. Information We Collect</h2>
                <p>Olly collects certain information to provide our services effectively:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Account information: We collect information when you create an account, such as your username and email address.</li>
                    <li>User ID: We use a unique identifier to track your activity within our services.</li>
                    <li>Extension data: We store settings and preferences locally to ensure you have a seamless experience without having to reconfigure settings repeatedly.</li>
                    <li>Usage data: We collect information about how you use our platform to improve our services.</li>
                    <li>Dashboard activity: We capture activity within the dashboard to improve user experience and platform functionality.</li>
                    <li>API key data: For features like auto-commenter that require your Olly API key, we access post data solely for content generation purposes. This data is not used for model training or any other purposes.</li>
                </ul>
                <p className="mt-2">We do not collect or store API keys used for different vendors by our customers.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">3. Data Storage and Security</h2>
                <p>All user data is stored securely on servers located in the United States. We implement appropriate technical and organizational measures to protect your data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
                <p className="mt-2">We do not share customer data with anyone else, including our own team members and development team. Access to user data is strictly controlled, and only relevant information about issue tickets is shared when necessary for support purposes.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">4. Data Usage and Processing</h2>
                <p>All features utilizing the Olly API are governed by the same privacy principles outlined in this policy. When you use features that require your Olly API key:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Post data accessed through your API key is used exclusively for content generation to provide the requested service</li>
                    <li>This data is not used for model training, algorithm improvement, or any other secondary purposes</li>
                    <li>Data processing is limited to fulfilling the specific functionality you have requested</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">5. Analytics and Third-Party Services</h2>
                <p>We use the following external services for analytics and operations:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>PostHog:</strong> We use PostHog for analytics. Only your user ID is shared with PostHog, not your email or other personal details.</li>
                    <li><strong>Google Analytics and Search Console:</strong> We use these services to analyze website traffic and performance, but we do not share your personal data with these services.</li>
                    <li><strong>LemonSqueezy:</strong> We use LemonSqueezy for payment processing, which uses Stripe in the background. Payment information is handled by these providers and not stored on our servers.</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">6. Permissions and Functionality</h2>
                <p>Olly requires certain browser permissions to function effectively as a social media agent. These permissions are used strictly for operational purposes and to provide the intended functionality of our services.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">7. Your Data Rights</h2>
                <p>You have the right to access, correct, or delete your personal information. You may also request a copy of the personal data we hold about you. To delete your data and account, you can do so directly by visiting <a href="https://www.olly.social/dashboard/profile" className="text-blue-600 hover:text-blue-800 underline">https://www.olly.social/dashboard/profile</a>. For other data-related requests, please contact us using the information provided at the end of this policy.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">8. Adherence to Privacy Laws</h2>
                <p>Olly is dedicated to complying with relevant privacy laws and regulations including GDPR, CCPA, and other applicable data protection laws. Our practices are designed to uphold legal standards and respect your privacy rights.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">9. Policy Updates</h2>
                <p>Our Privacy Policy may be updated to reflect changes in our practices or legal obligations. We will inform users of any significant changes by updating the &#8220;Last Updated Date&#8221; at the top of this policy. Regular review of this policy is recommended.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">10. Contact Us</h2>
                <p>For any questions or concerns about our Privacy Policy or practices, please reach out to us at support@explainx.ai.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;