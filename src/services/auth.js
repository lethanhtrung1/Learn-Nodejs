import { badRequest, notAuth } from "../middlewares/handle_errors";

const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const salt = bcrypt.genSaltSync(8);
const hashPassword = (password) => bcrypt.hashSync(password, salt);

export const register = ({ email, password }) =>
    new Promise(async (resolve, reject) => {
        try {
            const response = await db.User.findOrCreate({
                where: { email: email },
                defaults: {
                    email: email,
                    password: hashPassword(password),
                },
            });
            const accessToken = response[1]
                ? jwt.sign(
                      {
                          id: response[0].id,
                          email: response[0].email,
                          role_code: response[0].role_code,
                      },
                      process.env.JWT_SECRET,
                      { expiresIn: "5s" }
                  )
                : null;

            // JWT_SECRET_REFRESH_TOKEN
            const refreshToken = response[1]
                ? jwt.sign(
                      {
                          id: response[0].id,
                      },
                      process.env.JWT_SECRET_REFRESH_TOKEN,
                      { expiresIn: "15d" }
                  )
                : null;
            resolve({
                err: response[1] ? 0 : 1,
                mess: response[1] ? "Register is successfully!" : "Email was registered!",
                access_token: accessToken ? `Bearer ${accessToken}` : null,
                refresh_token: refreshToken,
            });

            if (refreshToken) {
                await db.User.update({ refresh_token: refreshToken }, { where: { id: response[0].id } });
            }
        } catch (error) {
            reject(error);
        }
    });

export const login = ({ email, password }) =>
    new Promise(async (resolve, reject) => {
        try {
            const response = await db.User.findOne({
                where: { email: email },
                raw: true,
            });

            const isChecked = response && bcrypt.compareSync(password, response.password);
            const accessToken = isChecked
                ? jwt.sign(
                      {
                          id: response.id,
                          email: response.email,
                          role_code: response.role_code,
                      },
                      process.env.JWT_SECRET,
                      { expiresIn: "5s" }
                  )
                : null;

            const refreshToken = isChecked ? jwt.sign({ id: response.id }, process.env.JWT_SECRET_REFRESH_TOKEN, { expiresIn: "15d" }) : null;

            resolve({
                err: accessToken ? 0 : 1,
                mess: accessToken ? "Login is successfully!" : response ? "Password is wrong!" : "Email is not registered!",
                access_token: accessToken ? `Bearer ${accessToken}` : null,
                refresh_token: refreshToken,
            });

            if (refreshToken) {
                await db.User.update({ refresh_token: refreshToken }, { where: { id: response.id } });
            }
        } catch (error) {
            reject(error);
        }
    });

export const refreshToken = (refresh_token) =>
    new Promise(async (resolve, reject) => {
        try {
            const response = await db.User.findOne({
                where: {
                    refresh_token: refresh_token,
                },
            });

            if (response) {
                jwt.verify(refresh_token, process.env.JWT_SECRET_REFRESH_TOKEN, (err, decode) => {
                    if (err) {
                        resolve({
                            err: 1,
                            mess: "Refresh token expired. Require login",
                        });
                    } else {
                        const accessToken = jwt.sign(
                            {
                                id: response.id,
                                email: response.email,
                                role_code: response.role_code,
                            },
                            process.env.JWT_SECRET,
                            { expiresIn: "5s" }
                        );
                        resolve({
                            err: accessToken ? 0 : 1,
                            mess: accessToken ? "OK" : "Fail to generate new access token",
                            access_token: accessToken ? `Bearer ${accessToken}` : null,
                            refresh_token: refresh_token,
                        });
                    }
                });
            }
        } catch (error) {
            reject(error);
        }
    });
