var jwt = require('jsonwebtoken')
const AccountClient = require('../../models/accounts-clients.model')

module.exports.verifyToken = async (req, res, next)=>{
    try{
        const token = req.cookies.token;
        if(!token){
            res.redirect('/account/login');
            return;
        }
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {id, email} = decoded;
        const existAccount = await AccountClient.findOne({
            _id: id,
            email: email,
            status: 'active',       
        });
        if(!existAccount){
            res.clearCookie('token');
            res.redirect('/account/login');
            return;
        }
        res.locals.account = existAccount;
        next();
    } catch (err){
        console.log(err);
        res.clearCookie('token');
        res.redirect('/account/login');
    }
}
