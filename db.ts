import mongoose, { ConnectOptions } from "mongoose";

mongoose.connect('mongodb+srv://group1940:19401940@cluster0.txsa0qr.mongodb.net/racingf1?retryWrites=true&w=majority', {
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
