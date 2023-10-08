# <p align = "center"> Tweeter-Backend </p>

## <p align = "center"> This is a Twitter clone whose backend is made in Node.js and Express Framework. </p>



# <p align = "center">Backend Key Features </p>
- Email or Google OAuth Signup/Signin.
- JWT Authentication with complete integration of Refresh and Access tokens.
- PostgreSQL for the DB because of its open source nature and several useful features.
- Real time chat system using web-sockets (socket-io).
- PostgreSQL database implementation using SequelizeORM for its features like relations, eager and lazy loading, read replication and more.

### [Postman API documentation](https://documenter.getpostman.com/view/24068251/2s9YJgTLMe)

# <p align = "center">Preview </p>

https://github.com/alanansari/twitter_backend/assets/22475370/58907286-9f5b-459e-9d71-36dd43abf198

## RUNNING THE SERVER


1. Clone the repository:

```CMD
git clone https://github.com/alanansari/twitter_backend.git
```
To run the server, you need to have NodeJS installed on your machine. If you don't have it installed, you can follow the instructions [here](https://nodejs.org/en//) to install it.

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

   1. Using docker ( considering you have external DB setup )
        ```
        docker build -t tweeter-backend . &&
        docker run -p 3000:3000 --network=host tweeter-backend
        ```
   2. Using docker compose 
       ```
       docker-compose up
       ```

4. Running with local machine

   1. Install dependencies

      ```CMD
      npm install
      ```
   2. Run the server on localhost:
      ```CMD
      npm start
      ```

    
You can access the endpoints from your web browser following this url
```url
http://localhost:[PORT]
```
