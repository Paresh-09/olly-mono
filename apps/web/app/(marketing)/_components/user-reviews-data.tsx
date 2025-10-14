interface ReviewData {
    reviewerName: string;
    reviewDate: string;
    review: string;
    reviewStar: number;
    userName?: string;
    userImage?: string;
  }

const UserReviewsData: ReviewData[] = [
    {
        reviewerName: "Geeta Belani",
        reviewDate: "Dec 18, 2024",
        review: "This extension is a social saver, have been able to engage more with people on multiple platforms in a better way and much more frequently.",
        reviewStar: 5,
        userName: "geetabelani",
        userImage: "https://pbs.twimg.com/profile_images/960896970289278976/E3hvyGa9_400x400.jpg",
    },
    {
        reviewerName: "Bienaime",
        reviewDate: "Jan 12, 2024",
        review: "Olly's understanding of my audience is uncanny. It consistently generates comments that reflect the preferences and interests of my followers. The result? A surge in engagement and a more authentic online presence. It's like having a mind-reading social media sidekick. I'm impressed!",
        reviewStar: 5,
        userName: "bienaime",
        userImage: "https://pbs.twimg.com/profile_images/960896970289278976/E3hvyGa9_400x400.jpg",
    },
    {
        reviewerName: "Walker Wyatt",
        reviewDate: "Jan 12, 2024",
        review: "This extension is not just an AI tool; it's your ally in mastering social media. The comments it creates are thoughtful, engaging, and perfectly tailored to your audience. The impact on interactions and follower engagement is undeniable. Olly has made navigating the social media landscape a breeze.",
        reviewStar: 5,
        userName: "walkerwyatt",
        userImage: "https://pbs.twimg.com/profile_images/960896970289278976/E3hvyGa9_400x400.jpg",
    },
    {
        reviewerName: "Kara Winsterton",
        reviewDate: "Jan 12, 2024",
        review: "Olly has put my social media engagement into overdrive. The comments it creates are not just words; they're a catalyst for meaningful conversations. The AI's ability to understand and resonate with my audience is impressive.",
        reviewStar: 5,
        userName: "karawinsterton",
        userImage: "https://pbs.twimg.com/profile_images/960896970289278976/E3hvyGa9_400x400.jpg",
    },
    {
        reviewerName: "Aneta Kownacka",
        reviewDate: "Jan 13, 2024",
        review: "Olly has become my go-to social media sidekick for building a genuine and engaged audience.",
        reviewStar: 5,
        userName: "anetakownacka",
        userImage: "https://pbs.twimg.com/profile_images/960896970289278976/E3hvyGa9_400x400.jpg",
    },
    {
        reviewerName: "Florian Myter",
        reviewDate: "Jan 13, 2024",
        review: "Love the pay what you use business model, as a user. Not sure how scalable that will turn out to be from a business perspective ... but that's not my problem I guess! Great work team, hope you make it to the top",
        reviewStar: 5,
        userName: "florian_myter",
        userImage: "https://ph-avatars.imgix.net/5413468/c0037336-08b0-4570-9375-0ea68c9b2563.png",
    },
    {
        reviewerName:"Roberto Perez",
        reviewDate: "Jan 14, 2024",
        review: "Congratulations on the launch! This tool could be a gamechanger for any SMM agency or any business looking to boost their engagement with users/audience online without having to allocate limited time and resources to it.",
        reviewStar: 5,
        userName: "rockyperezz",
        userImage: "https://ph-avatars.imgix.net/6212118/e65b8927-e1df-4197-a6ea-c75f1c20ee6f.gif",
    },
    {
        reviewerName: "Aman Sharma",
        reviewDate: "Jan 14, 2024",
        review:"Congratulations on the launch. Just got myself a lifetime subscription. Its helping me summarise the post better for now, whereas i am keeping my own views.",
        reviewStar: 5,
        userName: "amanintech",
        userImage: "https://ph-avatars.imgix.net/2179893/0b68c40a-0596-4222-bb92-03b99c41bb4e.png",
    }

]

  
  export default UserReviewsData;
  