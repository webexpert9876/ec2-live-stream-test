const querySchema = `

  type Query {

    users(id: ID, role: String): [User],

    channels(id: ID, urlSlug: String, userId: String): [Channel],

    chatMessages(videoId: String!, limit: Int, skip: Int): [ChatMessage],

    videos(videoId: String, userId: String, tattooCategoryId: String, tags: String): [Video],

    recentLiveStreamVideos(userId: String!): [Video],
    
    getLastLiveStreamVideo(userId: String!): [Video],

    recentUploadedVideos(userId: String!): [Video],

    comments(id: ID, videoId: String): [Comments],

    followers(id: ID, channelId: String): [Followers],

    likesAndDislikes(id: ID, videoId: String): [LikeAndDislike],

    membershipPlans(id: ID): [MembershipPlans],

    playlists(id: ID, userId: String): [Playlists],

    replies(id: ID, commentId: String): [Reply],
    
    roles(id: ID): [Role],
    
    searchHistory(userId: String!, t: String, limit: Int, skip: Int): [SearchHistory],

    streams(artistId: String!): [Stream],

    subscriptionDetails(id: ID, userId: String, channelId: String): [SubscriptionDetail],

    tattooCategories(id: ID, tagName: [String], urlSlug: String): [TattooCategory],

    videoHistories(userId: String!, limit: Int, skip: Int): [VideoHistory],

    countTattooCategoryFollower(tattooCategoryId: String!): [TattooCategoryFollowers],

    isTattooCategoryFollowing(tattooCategoryId: String!, userId: String!): [TattooCategoryFollowers]
    
    liveStreamings(tattooCategoryId: String, tagName: String, channelId: String): [LiveStreamings]

    getSliderLiveStreams: [LiveStreamings]

    getTattooCategoryAllViewers(tattooCategoryId: String!): [LiveStreamings]
    
    countChannelTotalFollowers(channelId: String!): [Followers]

    isChannelFollowing(channelId: String!, userId: String!): [Followers]

    tagForStream: [Tags]

    videoByTag(tags: String, limit: Int, skip: Int ): [Video]

    videoByTagCount(tags: String): [VideoByTagCountSchema]

    searchBar(searchString: String): [SearchResultSchema]
  }
`;

module.exports = querySchema;