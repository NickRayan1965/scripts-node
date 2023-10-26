import pg from 'pg';
const { Pool } = pg;

const config = {
  user: 'nick',
  password: '1234',
  host: 'localhost',
  port: 5432, // El puerto por defecto de PostgreSQL es 5432
};

const findTableByOneTextValue = async ({ palabra, database, strictSearch = true }) => {
  const pool = new Pool({ ...config, database });
  const client = await pool.connect();

  // Imprimir todas las tablas
  const result = await client.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' and TABLE_SCHEMA = 'public'"
  );

  const tableNames = result.rows.map((r) => r.table_name);
  const answers = [];

  for (let i = 0; i < tableNames.length; i++) {
    const columns = await client.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableNames[i]}' and DATA_TYPE != 'bytea'`
    );

    const columnNames = new Set(columns.rows.map((r) => r.column_name));
    if (columnNames.size === 0) continue;
    const likeExpression = strictSearch ? `= '${palabra}'` : `LIKE '%${palabra}%'`;
    const whereOr = [...columnNames]
      .map((c) => `"${c}"::text ${likeExpression}`)
      .join(' OR ');

    const query = `SELECT 1 FROM "${tableNames[i]}" WHERE ${whereOr}`;
    const result = await client.query(query);

    if (result.rows.length > 0) {
      const columns = await Promise.all([...columnNames].map((c) => {
        return client.query(
          `SELECT 1 FROM "${tableNames[i]}" WHERE "${c}"::text ${likeExpression}`
        );
      }));

      const columnNamesWithResults = columns.map((c, index) => {
        if (c.rows.length > 0) {
          return [...columnNames][index];
        }
      }).filter(c => c);

      answers.push(tableNames[i].concat(' => ', `[${columnNamesWithResults.join(', ')}]`));
    }
  }
  console.log(answers);
  client.release();
  return { [database]: answers };
};

(async () => {
  const databases = ['safety_old']; // Reemplaza estos nombres por tus bases de datos
  const wordFilter = '000';
  const results = await Promise.all(
    databases.map((database) => findTableByOneTextValue({ palabra: wordFilter, database, strictSearch: true }))
  );
  console.log(results);
})();
