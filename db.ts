import mongoose, { ConnectOptions } from "mongoose";

mongoose.connect('', {
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
