import pg from 'pg';
const { Client, Pool } = pg;
import {
	GetAllFunction,
	DeleteFunction,
	InsertFunction,
	UpdateFunction,
} from 'src/types';

type connectionObj = {
	user?: string;
	host?: string;
	database?: string;
	password?: string;
	port?: string;
};

export const databaseFunctions = async (connectionObj: connectionObj) => {
	const { user, host, database, password, port } = connectionObj;
	const numericPort = parseInt(port!, 10);
	const client = new Client({
		user,
		host,
		database,
		password,
		port: numericPort,
	});

	const insertIntoTable: InsertFunction = async (
		table,
		columns,
		values,
		res
	) => {
		try {
			const placeholders = values.map((_, index) => `$${index + 1}`).join(',');
			const queryCommand = `INSERT INTO ${table} (${columns.join(
				','
			)}) VALUES (${placeholders})`;
			await client.query(queryCommand, values);
			res.send('User created');
		} catch (error: any) {
			console.log(`${error} on create a register`);

			if (
				error.message.includes('duplicate key value violates unique constraint')
			) {
				res.statusCode = 409;
				res.send(`duplicate value`);
			} else {
				res.statusCode = 500;
				res.send('Server error');
			}
		}
	};
	const getAllRegistersFromTable: GetAllFunction = async (table) => {
		const queryCommand = `SELECT * FROM ${table}`;
		const result = await client.query(queryCommand);
		return result.rows;
	};
	const alterRegisterFromTable: UpdateFunction = async (
		table,
		value,
		columnValue
	) => {
		const queryCommand = `ALTER TABLE ${table} 
			DROP COLUMN IF EXISTS ${columnValue}
		`;
	};
	return {
		connectDb: async () => {
			try {
				await client.connect();
				console.log('connected to db');
			} catch (error) {
				console.error('Failed to connect to the database:', error);
			}
		},
		insertIntoTable,
		getAllRegistersFromTable,
	};
};
