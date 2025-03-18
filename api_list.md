# DevTinder APIs

authRouter
- POST /signup
- POST /login
- POST /logout

profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

STATUS; Ignored, Interested, Accepted, Rejected

connectionRequestRouter
- POST /request/send/:status/:userId
- POST /request/review/:status/:requestId

userRouter
- GET /user/connections
- GET /user/requests/received
- GET /user/feed - gets you the profile of other users on the platform