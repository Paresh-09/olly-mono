import { sendSherlockCompleteEmail } from "./mail-service";


sendSherlockCompleteEmail({
    email: 'rahul@explainx.ai', // ✅ use a test email you can access
    username: 'test_user',
    totalFound: 25,
    validFound: 12,
    resultUrl: 'https://example.com/results/test_user',
});