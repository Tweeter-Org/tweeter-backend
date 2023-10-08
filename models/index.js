const Bookmarks = require('./Bookmark');
const Chat = require('./Chat');
const Chatrel = require('./Chatrel');
const Follow = require('./Follow');
const Likes = require('./Likes');
const Message = require('./Message');
const Notification = require('./Notification');
const Otp = require('./otpModel');
const Tag = require('./Tag');
const Tweet = require('./tweetModel');
const User = require('./userModel');

module.exports = {
  Bookmarks: Bookmarks,
  Chat: Chat,
  Chatrel: Chatrel,
  Follow: Follow,
  Likes: Likes,
  Message: Message,
  Notification: Notification,
  Otp: Otp,
  Tag: Tag,
  Tweet: Tweet,
  User: User,
};
