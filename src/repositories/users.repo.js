import User from '../models/user.model.js';
class UsersRepository {
  async addDocument(userId, document) {
  return User.findByIdAndUpdate(
    userId,
    { $push: { documents: document } },
    { returnDocument: 'after', runValidators: true }
  );
}
  // users.repository.js
async findDocuments(userId) {
  return UserModel.findById(userId).select('documents').lean()
}
  async findAll() {
    return User.find();
  }

  async findById(id) {
    return User.findById(id);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, userData) {
    return User.findByIdAndUpdate(id, userData, { returnDocument: 'after', runValidators: true });
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  async insertMany(usersData){
    return User.insertMany(usersData)
  }
}

export default new UsersRepository();