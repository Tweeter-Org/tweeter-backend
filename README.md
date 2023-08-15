# twitter_backend

A Nodejs based backend system for a Social Media Platform using PostgreSQL,NodeJS,Express,Sequelize, and deployed on Render.
With a ReactJS Website as Frontend.
 

https://github.com/alanansari/twitter_backend/assets/22475370/58907286-9f5b-459e-9d71-36dd43abf198


- [Frontend Codebase](https://github.com/Sanikagoyal28/Tweeter)
## TWEETER
A social media website which provides users with the feature to grow their social connections, raise any issue or get updated of what's happening around
Users can join TWEETER by simply creating their account, having an updated profile, and can create any tweets. Tweeter provides u the feature to have an             experience of real-time chats with your connections.

          
## FEATURES
1. SignIn/ SignUp using JWT and Google OAtuh Authentication.
2. Create, Share, Reply, Retweet, Like or Bookmark any tweet.
3. Notifications section to have all new notifications.
4. Bookmarks section to see your bookmarked tweets.
5. Real time chat system using web-sockets (socket-io).
6. SQL database implementation using 

TECH-STACKS :
- Frontend: HTML, CSS, JS, ReactJS, Redux
- Backend: NodeJS, ExpressJS, PostgreSQL
- Designing: Figma

## RUNNING THE SERVER


1. Clone the repository:

```CMD
git clone https://github.com/alanansari/twitter_backend.git
```
To run the server, you need to have NodeJS installed on your machine. If you don't have it installed, you can follow the instructions [here](https://nodejs.org/en//) to install it.



2. Install the dependencies: 

```CMD
npm install
```


4. Setup .env file in base directory:

```
PORT = 3000
DATABASE_URL = ''
jwtsecretkey1 = ''
MAIL_ID = ''
MAIL_PASS = ''
GOOGLE_CLIENT_ID = ''
GOOGLE_CLIENT_SECRET = ''
GOOGLE_AUTH_URI = ''
```


5. Run the backend server on localhost:

```CMD
npm start
```


You can access the endpoints from your web browser following this url
```url
http://localhost:[PORT]
```

