import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import dbConnect from './dbConnect';

async function main() {
  await dbConnect();
  process.exit(0);
}

main();