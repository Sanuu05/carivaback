const jwt = require('jsonwebtoken')


const auth = (req, res, next)=>{
    try {
        const token = req.header("x-auth-token")
        console.log("ttx",token)
        if(!token){
            return res.status(401).json({
                msg:"no token"
            })
        }
        console.log('cvc',process.env.SEC_KEY)
        const verify = jwt.verify(token,process.env.SEC_KEY)
        console.log("vv",verify)
        if(!verify){
            return res.status(400).json({
                msg:"verification failed" 
            })
        }
        // console.log(verify)
        req.user = verify.id;
        next()

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            msg:error
        })
    }
}

module.exports = auth