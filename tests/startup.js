const mongoose = require('mongoose');


const dropDatabase = async () => {
  await mongoose.connection.db.dropDatabase();
};

(() => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_CONNECTION_URI, { useNewUrlParser: true });

    console.info('Connected to test db');
  });

  afterAll(async (done) => {
    await dropDatabase();
    await mongoose.disconnect();

    done()
  });

  beforeEach( async () => {
    await dropDatabase()
  });

})();


