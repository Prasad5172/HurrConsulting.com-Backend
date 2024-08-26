const {responseHandler} = require("../helpers/handler.js")
const googleAuthApi =async (access_token,result) => {
    try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            method:"GET",
            headers: {
                "Authorization": `Bearer ${access_token}`
              }
            });
        if(res.ok){
            const data = await res.json()
            return result(null,data)
        }else{
            return result(data,null);
        }
    } catch (error) {
        console.log(error)
        return result(error,null)
    }
}

module.exports = {googleAuthApi}
