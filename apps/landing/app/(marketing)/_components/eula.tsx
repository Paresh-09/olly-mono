import React from 'react';

const EULA: React.FC = () => {
    return (
        <div className="flex justify-center items-center p-4">
            <div className="max-w-6xl p-6 rounded-lg">
                <h1 className="text-xl font-semibold text-center mb-4">End User License Agreement (EULA)</h1>
                <p className="text-sm text-gray-600 mb-4">Last updated: June 25, 2025.</p>

                <p className="mb-4">This End User License Agreement ("EULA") is a legal agreement between you and Olly.social ("Olly", "we", "us", or "our") for the use of the Olly software application, browser extension, and related services (collectively, the "Software").</p>

                <p className="mb-4">By installing, accessing, or using the Software, you agree to be bound by the terms of this EULA. If you do not agree to the terms of this EULA, do not install, access, or use the Software.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">1. License Grant</h2>
                <p className="mb-2">Subject to the terms of this EULA, Olly grants you a limited, non-exclusive, non-transferable, revocable license to:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Install and use the Software on your devices for personal or business purposes</li>
                    <li>Access and use the Software's features and functionality as provided</li>
                    <li>Use the Software in accordance with the documentation and instructions provided</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">2. License Restrictions</h2>
                <p className="mb-2">You may not:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Copy, modify, distribute, sell, or lease any part of the Software</li>
                    <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Software</li>
                    <li>Remove, alter, or obscure any proprietary notices on the Software</li>
                    <li>Use the Software for any unlawful purpose or in violation of any applicable laws</li>
                    <li>Use the Software to infringe upon the intellectual property rights of others</li>
                    <li>Attempt to gain unauthorized access to our systems or networks</li>
                    <li>Use the Software to transmit malware, viruses, or other harmful code</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">3. Ownership and Intellectual Property</h2>
                <p className="mb-4">The Software and all worldwide copyrights, trade secrets, and other intellectual property rights therein are the exclusive property of Olly and its licensors. Olly reserves all rights in and to the Software not expressly granted to you under this EULA.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">4. User Data and Privacy</h2>
                <p className="mb-2">The Software processes and stores data in accordance with our Privacy Policy. Key points include:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>User data is stored securely on servers located in the United States</li>
                    <li>We do not share customer data with third parties, including our own team members, except for relevant support ticket information</li>
                    <li>Features requiring your Olly API key (such as auto-commenter) access post data solely for content generation, not for model training</li>
                    <li>Dashboard activity is captured to improve user experience</li>
                    <li>You can delete your data and account at <a href="https://www.olly.social/dashboard/profile" className="text-blue-600 hover:text-blue-800 underline">https://www.olly.social/dashboard/profile</a></li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">5. Software Updates</h2>
                <p className="mb-4">Olly may provide updates, upgrades, or new versions of the Software. You agree that Olly has no obligation to provide any updates, but if provided, updates will be governed by this EULA unless accompanied by a separate license agreement.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">6. Browser Extension Permissions</h2>
                <p className="mb-4">The Olly browser extension requires certain permissions to function as a social media agent. These permissions are used strictly for operational purposes and to provide the intended functionality. By installing the extension, you consent to these permissions as outlined in the extension's permission requests.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">7. Third-Party Services</h2>
                <p className="mb-2">The Software may integrate with third-party services including:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>PostHog for analytics (only user ID shared)</li>
                    <li>Google Analytics and Search Console for website analytics</li>
                    <li>LemonSqueezy and Stripe for payment processing</li>
                </ul>
                <p className="mb-4">Your use of these third-party services is subject to their respective terms and privacy policies.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">8. Termination</h2>
                <p className="mb-4">This EULA is effective until terminated. You may terminate this EULA at any time by uninstalling the Software and ceasing all use. Olly may terminate this EULA immediately if you fail to comply with any term of this EULA. Upon termination, you must cease all use of the Software and delete all copies.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">9. Disclaimer of Warranties</h2>
                <p className="mb-4">THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. OLLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">10. Limitation of Liability</h2>
                <p className="mb-4">IN NO EVENT SHALL OLLY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SOFTWARE.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">11. Export Restrictions</h2>
                <p className="mb-4">The Software may be subject to export laws and regulations. You agree to comply with all applicable export and re-export restrictions and regulations.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">12. Governing Law</h2>
                <p className="mb-4">This EULA shall be governed by and construed in accordance with the laws of India, without regard to its conflict of laws principles. Any disputes arising under this EULA shall be resolved in the competent courts of Mumbai, India.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">13. Changes to this EULA</h2>
                <p className="mb-4">Olly reserves the right to modify this EULA at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of the Software after any modifications constitutes acceptance of the revised EULA.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">14. Contact Information</h2>
                <p className="mb-4">If you have any questions about this EULA, please contact us at <a href="mailto:support@explainx.ai" className="text-blue-600 hover:text-blue-800 underline">support@explainx.ai</a>.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">15. Entire Agreement</h2>
                <p className="mb-4">This EULA constitutes the entire agreement between you and Olly regarding the Software and supersedes all prior agreements and understandings, whether written or oral, relating to the subject matter hereof.</p>

                <p className="mt-6 text-sm text-gray-600">By installing or using the Olly Software, you acknowledge that you have read this EULA, understand it, and agree to be bound by its terms and conditions.</p>
            </div>
        </div>
    );
};

export default EULA;