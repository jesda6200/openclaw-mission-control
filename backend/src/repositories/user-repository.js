class UserRepository {
  constructor(db) { this.db = db; }

  create(data) { return this.db.createUser(data); }
  findByEmail(email) { return this.db.findUserByEmail(email); }
  findById(id) { return this.db.findUserById(id); }
  list() { return this.db.listUsers(); }
}

module.exports = { UserRepository };
