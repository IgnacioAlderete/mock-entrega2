import mocksService from "../services/mocks.service.js";

const mocksControllers = {
  getUsers: async (req, res, next) => {
    try {
      const users = mocksService.getUsers(req.query.qty);
      res.status(200).json({ status: "success", payload: users });
    } catch (error) {
      next(error);
    }
  },

  seedUsers: async (req, res, next) => {
    try {
      const { inserted, collection } = await mocksService.seedUsers(req.query.qty);
      res.status(201).json({ status: "success", payload: { inserted, collection } });
    } catch (error) {
      next(error);
    }
  }
};

export default mocksControllers;
