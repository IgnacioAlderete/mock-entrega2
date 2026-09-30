import User from "../models/user.model.js";
import { generateMockUsers } from "../mocks/user.mocks.js";


const mocksControllers = {

    getUsers: async (req, res) => {

        try {

            const qty = Number(req.query.qty) || 10;

            const users = generateMockUsers(qty);

            res.status(200).json(users);

        } catch (error) {

            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },


    seedUsers: async (req, res) => {

        try {

            const qty = Number(req.query.qty) || 10;

            const users = generateMockUsers(qty);

            const insertedUsers = await User.insertMany(users);

            res.status(201).json({
                insertados: insertedUsers.length,
                coleccion: "usuarios"
            });

        } catch (error) {

            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }

};


export default mocksControllers;

