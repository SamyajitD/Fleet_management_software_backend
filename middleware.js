module.exports.isLoggedIn= (req, res, next)=>{
    if(!req.isAuthenticated()){
        return res.json({'error': 'You must be Signed In!'});
    }
    next();
}

module.exports.isAdmin= (req, res, next)=>{
    if(req.user.role!=='admin'){
        return res.json({'error': 'You cant access this resource!'});
    }
    next();
}