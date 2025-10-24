const crypto = require('crypto');
const appSecret = '9c7a846ea0ed31be89807338cbe5fcd5';
const payload = JSON.stringify({
  "entry": [
    {
      "time": 1520383571,
      "changes": [
        {
          "field": "comments",
          "value": {
            "media_id": "17895695084132273",
            "comment_id": "17895695084132273",
            "text": "Test comment"
          }
        }
      ],
      "id": "123456789",
      "uid": "123456789"
    }
  ],
  "object": "instagram"
});

const signature = crypto
  .createHmac('sha256', appSecret)
  .update(payload)
  .digest('hex');

console.log(`sha256=${signature}`);