const query = require('./query/query');
const mutation = require('./mutation/mutation');

// Define GraphQl All Schema Here
const typeDefs = `#graphql

  type User {
    _id: ID
    firstName: String
    lastName: String
    username: String
    email: String
    password: String
    profilePicture: String
    role: String
    roleDetails: [Role]
    createdAt: String
    updatedAt: String
    blocked: String
    isActive: String
    jwtToken: String
    urlSlug: String
    interestStyles: [String]
    interestedStyleDetail: [TattooCategory]
    resetPasswordToken: String
    resetPasswordExpire: String
    channelId: String
    channelDetails: [Channel]
  }

  type Channel {
    _id: ID
    channelName: String
    channelPicture: String
    channelCoverImage: String
    description: String
    socialLinks: [SocialLinks]
    subscribers: Int
    userId: String
    urlSlug: String
    location: String
    isApproved: String
    blocked: String
    reason: String
    createdAt: String
    updatedAt: String
  }

  type SocialLinks {
    _id: ID
    platform: String
    url: String
  }

  type ChatMessage {
    _id: ID
    userId: String
    liveStreamId: String
    isPinned: String
    userDetail: [User]
    message: String
    videoId: String
    hours: String
    mins: String
    createdAt: String
    updatedAt: String
  }

  type Comments {
    _id: ID
    text: String
    userId: String
    userDetail: [User]
    videoId: String
    createdAt: String
    updatedAt: String
  }

  type Followers {
    _id: ID
    userId: String
    channelId: String
    userDetails: [User]
    channelDetails: [Channel]
    isFollowing: Boolean
    countFollower: Int
    createdAt: String
    updatedAt: String
  }
  
  type TotalLikeAndDislike {
    totalLikes: Int
    totalDislikes: Int 
  }

  type LikeAndDislike {
    _id: ID
    userId: String
    videoId: String
    isLike: Boolean
    isDislike: Boolean
    totalLikeAndDislike: [TotalLikeAndDislike]
    createdAt: String
    updatedAt: String
  }

  type MembershipPlans {
    _id: ID
    name: String
    description: String
    price: Int
    planDuration: Int
    planDurationUnit: String
    createdAt: String
    updatedAt: String
  }

  type Playlists {
    _id: ID
    title: String
    description: String
    userId: String
    channelId: String
    videos: [String]
    createdAt: String
    updatedAt: String
  }

  type Reply {
    _id: ID
    text: String
    userId: String
    commentId: String
    createdAt: String
    updatedAt: String
  }

  type Role {
    _id: ID
    role: String
    createdAt: String
    updatedAt: String
  }

  type SearchHistory {
    _id: ID
    searchText: String
    userId: String
    createdAt: String
    updatedAt: String
  }

  type Stream {
    _id: ID
    title: String
    description: String
    streamCategory: String
    tags: [String]
    streamKey: String
    streamStartDate: String
    streamEndDate: String
    artistId: String
    channelId: String
    streamPreviewImage: String
    createdAt: String
    updatedAt: String
  }

  type SubscriptionDetail {
    _id: ID
    userId: String
    channelId: String
    planDuration: Int
    planDurationUnit: String
    startDate: String
    endDate: String
    isActive: String
    userDetail: [User]
    channelDetails: [Channel]
    createdAt: String
    updatedAt: String
  }

  type Tags {
    _id: ID
    id: String
    text: String
    name: String,
    createdAt: String
    updatedAt: String
  }

  type TattooCategory {
    _id: ID
    title: String
    description: String
    profilePicture: String
    urlSlug: String
    tags: [String]
    createdAt: String
    updatedAt: String
  }

  type VideoHistory {
    _id: ID
    userId: String
    videoId: String
    videoHistoryCount: Int
    videoDetails: [Video]
    createdAt: String
    updatedAt: String
  }

  type VideoQualityUrl {
    quality: String
    url: String
  }

  type Video {
    _id: ID
    title: String
    description: String
    videoPreviewImage: String
    userId: String
    channelId: String
    tattooCategoryId: String
    tags: [String]
    views: Int
    url: String
    videoQualityUrl: [VideoQualityUrl]
    tattooCategoryDetails: [TattooCategory]
    channelDetails: [Channel]
    streamId: String
    isUploaded: Boolean
    isStreamed: Boolean
    isPublished: Boolean
    videoPreviewStatus: String
    videoServiceType: String
    blocked: Boolean
    createdAt: String
    updatedAt: String
    uploadedVideo: Int
    streamedVideo: Int
  }

  type LiveStreamings {
    _id: ID
    title: String,
    description: String
    streamUrl: String
    tags: [String]
    tattooCategory: String
    userId: String,
    videoPoster: String
    channelId: String
    videoId: String
    streamKey: String
    viewers: Int
    channelDetails: [Channel]
    tattooCategoryDetails: [TattooCategory]
    singleCategoryAllViewers: Int
    createdAt: String
    updatedAt: String
  }

  type TattooCategoryFollowers {
    _id: ID
    userId: String
    tattooCategoryId: String
    user: [User]
    tattooCategory: [TattooCategory]
    countFollower: Int
    isFollowing: Boolean
  }

  type VideoByTagCountSchema {
    count: Int
  }

  type SearchResultSchema {
    channel: [Channel]
    videos: [Video]
  }

  type Notification {
    _id: ID
    senderUserId: String
    userDetails: [User]
    message: String
    receiverUserIds: [String]
    isRead: Boolean
    notificationType: String
    createdAt: String
    updatedAt: String
  }

  type ChannelAnalytics {
    _id: ID
    userId: String
    channelId: String
    userDetails: [User]
    channelDetails: [Channel]
    createdAt: String
    updatedAt: String
    numberofvisit: String
  }

  type AllLivestream {
    liveStream: [LiveStreamings]
    totalLiveStream: Int
  }

  type SubscriptionPlans {
    _id: ID
    price: Int
    planDuration: Int
    planDurationUnit: String
    channelId: String
    channelDetails: [Channel]
    planUpdateCount: Int
    createdAt: String
    updatedAt: String
  }

  type ChannelActivePlan {
    _id: ID
    channelId: String
    isPaid: Boolean
  }
  
  type ConnectAccounts {
    _id: ID
    connectAccountId: String,
    userId: String
    channelId: String
    userDetails: [User]
    channelDetails: [Channel]
    isAccountCreated: String
    AccountPaymentStatus: String
    isTransfer: String
    isPayoutEnabled: Boolean
    isRequirementPending: Boolean
    isAccountActive: Boolean
    payoutType: String
    createdAt: String
    updatedAt: String
  }

  type Transactions {
    _id: ID
    checkoutSessionId: String,
    userId: String
    channelId: String
    channelDetails: [Channel]
    usersDetail: [User]
    status: String
    amount: Int
    reason: String
    paymentIntentId: String
    paymentId: String
    platformFees: Int
    stripeFees: Int
    artistAmount: Int
    isTransferToArtist: Boolean
    artistAccountId: String
    transactionDate: String
    paymentMethod: String
    userEmail: String
    planDuration: Int
    planDurationUnit: String
    createdAt: String
    updatedAt: String
  }
  
  ${query}
  ${mutation}
  
  `;
  
  // comments: [Comments],
  // followers: [Followers],
  // likeAndDislikes: [LikeAndDislike],
  // membershipPlans: [MembershipPlans],
  // playlists: [Playlists],
  // replies: [Reply],
  // roles: [Role],
  // searchHistories: [SearchHistory],
  // streams: [Stream],
  // subscriptionDetails: [SubscriptionDetail],
  // tattooCategories: [TattooCategory],
  // videoHistories: [VideoHistory],

module.exports = typeDefs