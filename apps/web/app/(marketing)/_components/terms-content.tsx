import React from 'react';

const TermsOfService: React.FC = () => {
    const todayDate = new Date().toLocaleDateString();

    return (
        <div className="flex justify-center items-center p-4">
            <div className="max-w-6xl p-6 rounded-lg">
                <h1 className="text-xl font-semibold text-center mb-4">Terms of Service</h1>
                <p className="text-sm text-gray-600 mb-4">Last updated: June 25, 2025.</p>

                <p>Subject to these Terms of Service (this &quot;Agreement&quot;), Olly.social (&ldquo;Olly&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, and/or &ldquo;our&rdquo;) provides access to Olly&apos;s cloud platform as a service (collectively, the &ldquo;Services&rdquo;). By using or accessing the Services, you acknowledge that you have read, understand, and agree to be bound by this Agreement.</p>

                <p>If you are entering into this Agreement on behalf of a company, business, or other legal entity, you represent that you have the authority to bind such entity to this Agreement, in which case the term &ldquo;you&rdquo; shall refer to such entity. If you do not have such authority, or if you do not agree with this Agreement, you must not accept this Agreement and may not use the Services.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Acceptance of Terms</h2>
                <p>By signing up and using the services provided by Olly (referred to as the &ldquo;Service&rdquo;), you are agreeing to be bound by the following terms and conditions (&ldquo;Terms of Service&rdquo;). The Service is owned and operated by Olly (&ldquo;Us&rdquo;, &ldquo;We&rdquo;, or &ldquo;Our&rdquo;).</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Description of Service</h2>
                <p>Olly provides an AI-driven social media agent and engagement tool (&ldquo;the Product&rdquo;). The Product is accessible at olly.social and other domains and subdomains controlled by Us (collectively, &ldquo;the Website&rdquo;) and through our browser extension. Our services include features such as auto-commenter and other AI-powered social media engagement tools.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Data Usage and Storage</h2>
                <p>We store user data to provide and improve our services. All data is stored securely on servers located in the United States. We do not share customer data with anyone else, including our own team members and development team. Only relevant information about issue tickets is shared when necessary for support purposes.</p>
                <p>We do not store API keys provided by users for third-party services. For features that require your Olly API key (such as auto-commenter), we access post data solely for content generation purposes. This data is not used for model training or any other secondary purposes.</p>
                <p>Our browser extension stores settings locally to ensure a seamless user experience without requiring frequent reconfigurations. We also capture dashboard activity to improve user experience and platform functionality.</p>
                <p>All features utilizing the Olly API are governed by the same data handling principles outlined in these terms and our Privacy Policy.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">User Rights and Account Management</h2>
                <p>You have the right to access, correct, or delete your personal information. You can delete your data and account directly by visiting <a href="https://www.olly.social/dashboard/profile" className="text-blue-600 hover:text-blue-800 underline">https://www.olly.social/dashboard/profile</a>. For other data-related requests, please contact us using the information provided in this agreement.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Analytics and Third-Party Services</h2>
                <p>We use various analytics tools to improve our services, including PostHog, Google Analytics, and Search Console. We only share your user ID with PostHog for analytics purposes and do not share your email or other personal information.</p>
                <p>For payment processing, we use LemonSqueezy, which utilizes Stripe in the background. Any payment information is handled by these providers according to their respective privacy policies and is not stored on our servers.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Fair Use</h2>
                <p>You are responsible for your use of the Service and for any content that you post or transmit through the Service. You may not use the Service for any purpose that is illegal or infringes upon the rights of others.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Intellectual Property Rights</h2>
                <p>You acknowledge and agree that the Service and its entire contents, features, and functionality, including but not limited to all information, software, code, text, displays, graphics, photographs, video, audio, design, presentation, selection, and arrangement, are owned by Us, our licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Changes to these Terms</h2>
                <p>We reserve the right to revise and update these Terms of Service from time to time in our sole discretion. All changes are effective immediately when we post them, and apply to all access to and use of the Website thereafter. Your continued use of the Website following the posting of revised Terms of Service means that you accept and agree to the changes.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Contact Information</h2>
                <p>Questions or comments about the Website or these Terms of Service may be directed to our support team at <a href="mailto:support@explainx.ai" className="text-blue-600 hover:text-blue-800 underline">support@explainx.ai</a>.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Disclaimer of Warranties</h2>
                <p>THE SERVICE AND ITS CONTENT ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT ANY WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE WARRANTY OF TITLE, MERCHANTABILITY, NON-INFRINGEMENT OF THIRD PARTIES&rsquo; RIGHTS, AND FITNESS FOR PARTICULAR PURPOSE.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Limitation of Liability</h2>
                <p>IN NO EVENT WILL WE, OUR AFFILIATES OR THEIR LICENSORS,SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE WEBSITE, THE SERVICE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE WEBSITE OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. </p>

                <h2 className="text-lg font-semibold mb-2 mt-4">Governing Law and Jurisdiction</h2>
                <p>These Terms of Service and any dispute or claim arising out of or related to them, their subject matter, or their formation (in each case, including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of India, without giving effect to any choice or conflict of law provision or rule. Any legal suit, action, or proceeding arising out of, or related to, these Terms of Service or the Website shall be instituted exclusively in the competent courts of Mumbai, India.</p>

                <p className='mt-4'>By using Olly.social, you acknowledge that you have read these Terms of Service, understood them, and agree to be bound by them. If you do not agree to these Terms of Service, you are not authorized to use the Service. We reserve the right to change these Terms of Service at any time, so please review them frequently.</p>

                <p className='mt-4'>Thank you for using Olly!</p>
                </div>
        </div>
    );
};

export default TermsOfService;