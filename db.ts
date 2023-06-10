import mongoose, { ConnectOptions } from "mongoose";

mongoose.connect('', {            // Replace with your MongoDB Atlas URL
  useNewUrlParser: true,
  useUnifiedTopology: true
} as ConnectOptions);

const conn = mongoose.connection;

conn.on('error', (error) => {
  console.error(error);
});

conn.once('open', () => {
  console.log('Connected to database');
});

export default conn;
