const { prisma } = require('../config/db')
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/generateToken');




const registration = async (req,res) => {
    try {
    const { name , email , password } = req.body;
    
    //input validation
    if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
}


    const normalizedEmail = email.toLowerCase();

    // check if User is already exists or not
    const sameUser = await prisma.user.findUnique({
        where: {email : normalizedEmail},
    });

    if(sameUser){
        return res
        .status(400)
        .json({error: "user already exists with this email"});
    }

    //hash password

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password , salt)

    //create User

    const user = await prisma.user.create({
        data: {
            name, 
            email: normalizedEmail,
            password : hashPassword ,
        },
    });

    // generate JWT token
    const token = generateToken(user.id , res)

    // successful message
    res.status(200).json({
        status: "success" ,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        },
    });
    } catch (error) {
        console.error("Error in registration:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}


    //login 
const login = async (req , res) => {
    try {
        const { email , password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "All fields are required" });
            }

        const normalizedEmail = email.toLowerCase();

        //check is user exit or not
        const user = await prisma.user.findUnique({
            where : {email : normalizedEmail},
        });

        if(!user){
            return res.status(404).json({error: "Invalid email or password"});
        };

        //verify password
        const isPasswordValid =  await bcrypt.compare(password , user.password);
        if(!isPasswordValid) return res.status(401).json({error: "Invalid email or password"});


        // generate JWT token
    const token = generateToken(user.id , res)

    res.status(201).json({
        status: "success" ,
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        },
    });
    
    } catch (error) {
            console.log("Error in login:", error)
            return res.status(500).json({ error: "Internal server error" });
        }
}

//logout
const logout = async (req , res) => {

    // clear cookie
res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
});

res.status(200).json({
    status: "successful",
    message: "logged out successfully"
})
}



module.exports = {registration , login , logout};
