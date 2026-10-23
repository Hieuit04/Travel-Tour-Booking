var jwt = require('jsonwebtoken')
const AccountClient = require('../../models/accounts-clients.model')

module.exports.getAccount = async (req, res, next)=>{
    try{
        const token = req.cookies.token;
        if(token){
            var decoded = jwt.verify(token, process.env.JWT_SECRET);
            const {id, email} = decoded;
            const existAccount = await AccountClient.findOne({
                _id: id,
                email: email,
                status: 'active',       
            });
            if(existAccount){
                res.locals.account = existAccount;
            }
        }
        next();
    } catch (err){
        res.locals.account = null;
        next();
    }
}