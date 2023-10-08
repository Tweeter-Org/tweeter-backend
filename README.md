# Tweeter-Backend 

*This is a Twitter clone whose backend is made in **Node.js** and **Express Framework**. Check the Website [here](https://tweeter-frontend-sooty.vercel.app/login).*

## Table of contents

- [About our project](#About-our-project)
- [Tech Stack Used💡](#Tech-Stack-Used)
- [Backend Key Features ✨](#backend-key-features-)
- [Postman API documentation](#checkout-postman-api-documentation-here)
- [Preview💻](#preview-)
- [Running the server⚙️](#running-the-server-)
- [🔖Steps to Contribute ✅](#steps-to-contribute-)
- [🔑Guidelines✨](#guidelines)
- [Thanks to all the Contributors ❤️](#thanks-to-all-the-contributors-%EF%B8%8F)

# About our project

Welcome to TWEETER, a social media website which provides users with the feature to grow their social connections, raise any issue or get updated of what's happening around. Users can join Tweeter by simply creating their account, having an updated profile, and can create any tweets. Tweeter also provides you the feature to have the experience of real-time chats with your connections.

# Tech Stack Used

<div align="left">
 <img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=for-the-badge&logo=HTML5&logoColor=white">
 <img src="https://img.shields.io/badge/CSS3-1572B6.svg?style=for-the-badge&logo=CSS3&logoColor=white">
 <img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=white">
 <img src="https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge">
  <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a><a href="https://expressjs.com" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg" alt="express" width="40" height="40"/> </a><a> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" height="40" width="52" alt="figma logo"  /></a>
</div>


## Backend Key Features ✨

- Email or Google OAuth Signup/Signin.
- JWT Authentication with complete integration of Refresh and Access tokens.
- PostgreSQL for the DB because of its open source nature and several useful features.
- Real time chat system using web-sockets (socket-io).
- PostgreSQL database implementation using SequelizeORM for its features like relations, eager and lazy loading, read replication and more.

---

## Checkout Postman API documentation [here](https://documenter.getpostman.com/view/24068251/2s9YJgTLMe).


## Preview 💻

https://github.com/alanansari/twitter_backend/assets/22475370/58907286-9f5b-459e-9d71-36dd43abf198


## RUNNING THE SERVER ⚙️

*Get started on the local machine*

1. Clone the repository: 
   ```CMD
   git clone https://github.com/alanansari/twitter_backend.git
   ```
*To run the server, you need to have NodeJS installed on your machine. If you don't have it installed, you can follow the instructions [here](https://nodejs.org/en//) to install it.*

2. Setup .env file in base directory:
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

3. Running with docker

   - Using docker ( considering you have external DB setup )
      ```
      docker build -t tweeter-backend . &&
      docker run -p 3000:3000 --network=host tweeter-backend
      ```
   - Using docker compose 
      ```
      docker-compose up
      ```

4. Running with local machine

   - Install dependencies

      ```CMD
      npm install
      ```
   - Run the server on localhost:
      ```CMD
      npm start
      ```
   ---
    
*You can access the endpoints from your web browser following this url:*
   ```url
   http://localhost:[PORT]
   ```

## 🔖Steps to Contribute ✅

- Contribution is the best way to support and get involved in the community!
- Want to contribute to `TWEETER`? Please check our [CONTRIBUTING.md](https://github.com/Tweeter-Org/tweeter-frontend/blob/master/CONTRIBUTING.md#contributing-guidelines).

We welcome contributions from the community. To contribute to Tweeter Backend, follow these steps:

1. Fork the project on GitHub.
2. Create a new branch with a descriptive name for your feature or fix.
3. Make your changes and ensure that your code follows best practices.
4. Test your changes thoroughly.
5. Create a pull request (PR) to the main repository, explaining the changes you made and why they are valuable.

### ✨🔨Note:

> - Do not edit/delete someone else's script in this repository. You can only insert new files/folders into this repository.

  > - Give a meaningful name to whatever file or folder you are adding, changing, etc. 
 
 ## 🔑Guidelines✨

1. Welcome to this repository, if you are here as an open-source program participant/contributor.
2. Participants/contributors have to **comment** on issues they would like to work on, and mentors or the PA will assign you.
3. Issues will be assigned on a **first-come, first-serve basis.**
4. Participants/contributors can also **open their issues** using issue_template,
but it needs to be verified and labeled by a mentor or PA. Please discuss this with the team once before opening your issues. We respect all your contributions, whether it is an Issue or a Pull Request.
6. When you raise an issue, make sure you get it assigned to you before you start working on that project.
7. Each participant/contributor will be **assigned 1 issue (max)** at a time to work.
8. Participants are expected to follow **project guidelines** and **coding style** . **Structured code** is one of our top priorities.
9. Try to **explain your approach** to solving any issue in the comments. This will increase the chances of you being assigned.
10. Don't create issues that are **already listed**.
11. Please don't pick up an issue already assigned to someone else. Work on the issues after it gets **assigned to you**.
12. Make sure you **discuss issues** before working on the issue.
13. Pull requests will be merged after being **reviewed** by a mentor or PA.
14. It might take **a day or two** to review your pull request. Please have patience and be nice.
15. Always create a pull request from a **branch** other than `master`.
16. Participants/contributors have to complete issues before they decided Deadline. If you fail to make a PR within the deadline, then the issue will be assigned to another person in the queue.
17. While making PRs, don't forget to **add a description** of your work.
18. Include the issue number (Fixes: issue number) in your commit message while creating a pull request.
19. Make sure your solution to any issue is better in terms of performance and other parameters in comparison to the previous work.
20. We all are here to learn. You are allowed to make mistakes. That's how you learn, right?

## Thanks to all the Contributors ❤️

We would like to thank the open-source community and the developers of the technologies used in this project for their valuable contributions.