import * as services from "../services";
import { internalServerError, badRequest } from "../middlewares/handle_errors";
import { bookId, title, price, image, category_code, available, description, bookIds, filename } from "../helpers/joi_schema";
import joi from "joi";
const cloudinary = require("cloudinary").v2;

// READ
export const getBooks = async (req, res) => {
    try {
        const response = await services.getBooks(req.query);
        return res.status(200).json(response);
    } catch (error) {
        return internalServerError(res);
    }
};

// CREATE
export const createNewBook = async (req, res) => {
    try {
        const fileData = req.file;
        const { error } = joi.object({ title, price, image, category_code, available, description }).validate({ ...req.body, image: fileData?.path });
        if (error) {
            if (fileData) {
                cloudinary.uploader.destroy(fileData.filename);
            }
            return badRequest(error.details[0].message, res);
        }
        const response = await services.createNewBook(req.body, fileData);
        return res.status(200).json(response);
    } catch (error) {
        return internalServerError(res);
    }
};

// UPDATE
export const updateBook = async (req, res) => {
    try {
        const fileData = req.file;
        const { error } = joi.object({ bookId }).validate({ bookId: req.body.bookId });
        if (error) {
            if (fileData) {
                cloudinary.uploader.destroy(fileData.filename);
            }
            return badRequest(error.details[0].message, res);
        }
        const response = await services.updateBook(req.body, fileData);
        return res.status(200).json(response);
    } catch (error) {
        return internalServerError(res);
    }
};

// DELETE
export const deleteBook = async (req, res) => {
    try {
        const { error } = joi.object({ bookIds, filename }).validate(req.query);
        if (error) {
            return badRequest(error.details[0].message, res);
        }
        const response = await services.deleteBook(req.query.bookIds, req.query.filename);
        return res.status(200).json(response);
    } catch (error) {
        return internalServerError(res);
    }
};
