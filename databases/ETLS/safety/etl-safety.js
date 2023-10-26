import pg from 'pg';
const { Pool } = pg;
import { Encrypter } from './encrypter.js';
const config = {
  user: 'nick',
  password: '1234',
  host: 'localhost',
  port: 5432,
};
const oldDB = {
  user: {
    name: 'semusua',
    //forma corta
    short: 'U',
    asSelect: 'semusua AS U',
  },
};
const newDB = {
  user: {
    name: 'user',
    short: 'NEW_U',
    asSelect: 'user AS NEW_U',
  },
};
(async () => {
  console.log('connected');
  await main();
})();
async function main() {
  const poolOld = new Pool({ ...config, database: 'safety-updated-bk' });
  const clientOld = await poolOld.connect();
  const result = await clientOld.query('select * from semusua');
  const poolNew = new Pool({ ...config, database: 'safety-etl-result' });
  const clientNewDb = await poolNew.connect();
  await userConversion(clientOld, clientNewDb);
}
//conversion y traspaso de los datos de usaurio
async function userConversion(oldDBClient, newDBClient) {
  const oldUsers = await oldDBClient.query(`SELECT * FROM semusua`);
  const columnNamesRelations = {
    user_name: 'c_codusu',
    names: 'c_nombre',
    mother_s_name: 'c_apmate',
    last_name: 'c_appate',
    password: 'c_passwo',
  };
  const defaultValues = {
    id: 'default',
    isActive: 'true',
  };
  const newUsers = oldUsers.rows.map((oldUser) => {
    return Object.keys(columnNamesRelations).reduce(
      (newUser, newColumnName) => {
        const value = {
          password: Encrypter.encrypt(
            oldUser[columnNamesRelations[newColumnName]]
          ),
        };
        newUser[newColumnName] =
          value[newColumnName] ?? oldUser[columnNamesRelations[newColumnName]];
        return newUser;
      },
      defaultValues
    );
  });
  const keys = Object.keys(defaultValues).concat(
    Object.keys(columnNamesRelations)
  );
  const insert =
    `INSERT INTO ${oldDB.user.name} (${keys.map(k => `"${k}"`).join(',')}) ` +
    newUsers.map((newUser) => {
      return `VALUES ${keys
        .map((key) => {
          return `'${newUser[key]}'`;
        })
        .join(',')})`;
    }).join(', ');
  console.log(insert);
  console.log({ result: await newDBClient.query(insert)} );
}
