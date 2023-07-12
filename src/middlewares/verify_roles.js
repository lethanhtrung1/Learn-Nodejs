const handleError = require("./handle_errors");

export const isAdmin = (req, res, next) => {
    const { role_code } = req.user;
    if (role_code !== "R1") {
        return handleError.notAuth("Require role admin", res);
    }
    next();
};

export const isCreatorOrAdmin = (req, res, next) => {
    const { role_code } = req.user;
    if (role_code !== "R1" && role_code !== "R2") {
        return handleError.notAuth("Require role Admin or Creator", res);
    }
    next();
};
