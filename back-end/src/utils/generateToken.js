const jwt = require('jsonwebtoken');


exports.generateToken = (userId , res) => {
    const payload = {id : userId};
    const token = jwt.sign(payload , process.env.JWT_SECRET ,{
        expiresIn:process.env.JWT_EXPIRES_IN || "15d",
    });

    res.cookie("jwt" ,token , {
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite: "strict",
        sameSite: "lax",
        maxAge: (1000 * 60 * 60 * 24) * 15
    })
    return token;
}