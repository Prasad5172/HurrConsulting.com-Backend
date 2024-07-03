const { OAuth2Client } = require("google-auth-library");



const oauth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRETE
    )

 const verify= async (req, res, next)  => {
    console.log("verify")
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next(new Error("unauthorized"));
        return;
    }
    const token = authHeader.split(" ")[1];
    console.log(token)
    try {
        const ticket = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload) {
            req.userId = payload.sub;
            next();
            return;
        }
        next(new Error("unauthorized"));
    } catch (error) {
        next(new Error("unauthorized"));
    }
}


module.exports = verify