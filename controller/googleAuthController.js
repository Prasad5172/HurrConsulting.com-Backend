const {responseHandler} = require("../helpers")
exports.googleAuthApi =async (access_token,result) => {
    try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            method:"GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
              }
            });
        const data = await res.json()
        return result(null,responseHandler(true,200,"data",data))
    } catch (error) {
        console.log(error)
        return result(responseHandler(false,error.statusCode,error.message,null),null)
    }
}