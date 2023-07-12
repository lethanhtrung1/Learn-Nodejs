import { Op } from "sequelize";
import db from "../models";
import { v4 as generateId } from "uuid";
const cloudinary = require("cloudinary").v2;

// READ: GET
export const getBooks = ({ page, limit, order, name, available, ...query }) =>
    new Promise(async (resolve, reject) => {
        try {
            const queries = { raw: true, nest: true };
            const offset = !page || Number(page) <= 1 ? 0 : Number(page) - 1;
            const finalLimit = Number(limit) || Number(process.env.LIMIT_BOOK);
            queries.offset = offset * finalLimit;
            queries.limit = finalLimit;
            if (order) queries.order = [order];
            if (name) query.title = { [Op.substring]: name };
            if (available) query.available = { [Op.between]: available };

            const response = await db.Book.findAndCountAll({
                where: query,
                ...queries,
                attributes: {
                    exclude: ["category_code"],
                },
                include: [{ model: db.Category, as: "categoryData", attributes: { exclude: ["createdAt", "updatedAt"] } }],
            });

            resolve({
                err: response ? 0 : 1,
                mess: response ? "Got" : "Cannot found books",
                bookData: response,
            });
        } catch (error) {
            reject(error);
        }
    });

// CREATE: POST
export const createNewBook = (body, fileData) =>
    new Promise(async (resolve, reject) => {
        try {
            const response = await db.Book.findOrCreate({
                where: { title: body.title },
                defaults: {
                    ...body,
                    id: generateId(),
                    image: fileData?.path,
                    filename: fileData?.filename,
                },
            });
            resolve({
                err: response[1] ? 0 : 1,
                mess: response[1] ? "Created" : "Cannot create new book",
            });
            if (fileData && !response[1]) {
                cloudinary.uploader.destroy(fileData.filename);
            }
        } catch (error) {
            reject(error);
            cloudinary.uploader.destroy(fileData.filename);
        }
    });

// UPDATE: PUT
export const updateBook = ({ bookId, ...body }, fileData) =>
    new Promise(async (resolve, reject) => {
        try {
            if (fileData) {
                body.image = fileData?.path;
                body.filename = fileData?.filename;
            }
            const response = await db.Book.update(body, {
                where: { id: bookId },
            });
            resolve({
                err: response[0] > 0 ? 0 : 1,
                mess: response[0] > 0 ? `${response[0]} book updated` : "Cannot update new book",
            });
            if (fileData && response[0] === 0) {
                cloudinary.uploader.destroy(fileData.filename);
            }
        } catch (error) {
            reject(error);
            if (fileData) cloudinary.uploader.destroy(fileData.filename);
        }
    });

// DELETE: DELETE
export const deleteBook = (bookIds, filename) =>
    new Promise(async (resolve, reject) => {
        try {
            const response = await db.Book.destroy({
                where: { id: bookIds },
            });
            resolve({
                err: response > 0 ? 0 : 1,
                mess: `${response} book(s) deleted`,
            });
            cloudinary.api.delete_resources(filename);
        } catch (error) {
            reject(error);
        }
    });
