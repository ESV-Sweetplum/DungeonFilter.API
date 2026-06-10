import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString as string);

export default sql;
