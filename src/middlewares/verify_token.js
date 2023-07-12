const jwt = require("jsonwebtoken");
const handleError = require("./handle_errors");

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return handleError.notAuth("Require authorization", res);
    }
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            const isChecked = err instanceof jwt.TokenExpiredError;
            if (!isChecked) {
                return handleError.notAuth("Access token invalid", res, isChecked);
            }
            if (isChecked) {
                return handleError.notAuth("Access token expire", res, isChecked);
            }
        }
        req.user = user;
        next();
    });
};

export default verifyToken;
