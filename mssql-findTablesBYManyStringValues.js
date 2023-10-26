import { ConnectionPool } from 'mssql';
const config = {
  user: 'nick',
  password: '1234',
  server: 'localhost',
  database: '',  // Database se especificará más adelante.
  options: {
    encrypt: true // Usa esto si estás conectando a una instancia de Azure.
  }
};

const findTableByManyTextValues = async ({ palabras, database }) => {
  config.database = database;
  const pool = new ConnectionPool(config);
  await pool.connect();

  const result = await pool.request().query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
  );
  const tableNames = result.recordset.map((r) => r.TABLE_NAME);
  const answers = [];
  for (let i = 0; i < tableNames.length; i++) {
    const table = tableNames[i];
    const columns = await pool.request().query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' and DATA_TYPE != 'binary'`
    );
    if (columns.recordset.length === 0) continue;
    const columnNames = new Set(columns.recordset.map((r) => r.COLUMN_NAME));
    const sentences = [...columnNames].map((c) => {
      return `select ${c} from ${table} group by ${c} having CAST(${c} AS NVARCHAR(MAX)) in (${palabras.map((p) => `'${p}'`).join(',')})`;
    });    
    const results = await Promise.all(
      sentences.map(async (sentence) => {
        return await pool.request().query(sentence);
      })
    );
    const goodResults = results.filter(
      (r) => r.recordset.length === palabras.length
    );
    if (goodResults.length > 0) {
      answers.push(
        `${table} => [${results
          .map((r, i) => {
            if (r.recordset.length === palabras.length) {
              return `${[...columnNames][i]}`;
            }
          })
          .filter((r) => r !== undefined)
          .join(', ')}]`
      );
    }
  }
  await pool.close();
  return { [database]: answers };
};

(async () => {
  const databases = ['safety-updated-bk'];
  const results = await Promise.all(
    databases.map((database) =>
      findTableByManyTextValues({
        palabras: filterA,   // Asegúrate de que `filterA` esté definido en alguna parte del código.
        database,
      })
    )
  );
  console.log('Results: ');
  console.log(results);
  process.exit(0);
})();
