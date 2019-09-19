Smart Fourms

http://a3-davidvollum.glitch.me

To login:

username: steve
pw: moon

You can also create your own user accounts

The goal of my project was to make a simple, fast and easy to use messageboard platform that could be used by people accross the internet to communicate and share experiences. I initally with getting passport and express working correctly together. I am using passport local auth and low db. I deamed them to be the easiest option to get the application running. I wanted to add LDAP authentication and I researched how to do it but I ultimatly ran out of time to implement it. I used colorlib for my login page. I chose it because I really liked how polished it looked. I also use a modified version of the same template for the create user page. https://colorlib.com/wp/template/login-form-v10/ I also used a little bootstrap on the main fourm page to style the buttons and the table.

Express Packages:
passport - Used for authentication
bodyparser - Used to parse the bodies of POST Requests
session - Used for tracking which user is logged in
connect-ensure-login - Used to make sure the user is logged in before GET requests are served
helmet - Uses HTTP headers to increase the security of the application


Technical Achievements

Tech Achievement 1: I used middleware to ensure that the user was signed in before a "secure" page is served
Tech Achievement 2: I also use helmet to secure the transmissions between the server and the client

Design/Evaluation Achievements

Design Achievement 1: I experimented with multiple diffrent librarys and css frameworks for the styling
Design Achievement 3: I tested my applicatoin with 10 different users at one time