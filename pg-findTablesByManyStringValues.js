import pg from 'pg';
const { Pool } = pg;
const config = {
  user: 'nick',
  password: '1234',
  host: 'localhost',
  port: 5432, // El puerto por defecto de PostgreSQL es 5432
};

const findTableByManyTextValues = async ({ palabras, database }) => {
  const pool = new Pool({ ...config, database });
  const client = await pool.connect();

  // Imprimir todas las tablas
  const result = await client.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' and TABLE_SCHEMA = 'public'"
  );
  const tableNames = result.rows.map((r) => r.table_name);
  const answers = [];
  for (let i = 0; i < tableNames.length; i++) {
    const table = tableNames[i];
    const columns = await client.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' and DATA_TYPE != 'bytea'`
    );
    if (columns.rows.length === 0) continue;
    const columnNames = new Set(columns.rows.map((r) => r.column_name));
    const wheres = [...columnNames].map((c) => {
      return `"${c}"::text in (${palabras.map((p) => `'${p}'`).join(',')})`;
    });
    const sentences = [...columnNames].map((c) => {
      return `select "${c}" from "${table}" group by "${c}" having "${c}"::text in (${palabras
        .map((p) => `'${p}'`)
        .join(',')})`;
    });
    console.log(sentences);
    const results = await Promise.all(
      // wheres.map(async (where, i) => {
      //   return await client.query(`SELECT 1 FROM "${table}" WHERE ${where}`);
      // })
      sentences.map(async (sentence, i) => {
        return await client.query(sentence);
      })
    );
    const goodResults = results.filter(
      (r) => r.rows.length === palabras.length
    );
    if (goodResults.length > 0) {
      answers.push(
        `${table} => [${results
          .map((r, i) => {
            if (r.rows.length === palabras.length) {
              return `"${[...columnNames][i]}"`;
            }
          })
          .filter((r) => r !== undefined)
          .join(', ')}]`
      );
    }
  }
  return { [database]: answers };
};

(async () => {
  const databases = ['safety-updated-bk']; // Reemplaza estos nombres por tus bases de datos
  const results = await Promise.all(
    databases.map((database) =>
      findTableByManyTextValues({
        palabras: filterA,
        database,
      })
    )
  );
  console.log('Results: ');
  console.log(results);
  //TERMINAR PROCESO
  process.exit(0);
})();
