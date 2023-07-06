const config = {
  user: 'sa',
  password: '1234',
  server: 'localhost', // You can use 'localhost\\instance' to connect to named instance,
  port: 1433,
  //activate trustServerCertificate: true
  // If you're on Windows Azure, you will need this:
  trustServerCertificate: true,
};
const mssql = require('mssql');
const findTableByOneTextValue = async ({palabra, database, strictSearch = true }) => {
  const pool = new mssql.ConnectionPool({ ...config, database });
  await pool.connect();
  //imprimir todas las tablas
  const result = await pool
    .request()
    .query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' and TABLE_SCHEMA = 'dbo'"
    );
  const tableNames = result.recordset.map((r) => r.TABLE_NAME);
  const answers = [];
  for (let i = 0; i < tableNames.length; i++) {
    const columns = await pool
      .request()
      .query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableNames[i]}' and DATA_TYPE != 'image'`// and (DATA_TYPE like '%char%' or DATA_TYPE like '%text%')`
      );
    const columnNames = new Set(columns.recordset.map((r) => r.COLUMN_NAME));
    if (columnNames.size === 0) continue;
    const likeExpression = strictSearch ? `like '${palabra}'` : `like '%${palabra}%'`;
    const whereOr = [...columnNames]
      .map((c) => `cast("${c}" as varchar) ${likeExpression}`)
      .join(' OR ');
    const query = `SELECT 1 FROM ${tableNames[i]} WHERE ${whereOr}`;
    const result = await pool.request().query(query);
    if (result.recordset.length > 0) {
      const columns = await Promise.all([...columnNames].map((c) => {
        return pool
          .request()
          .query(
            `select 1 from ${tableNames[i]} where "${c}" ${likeExpression}`
          );
      }));
      const columnNamesWithResults = columns.map((c, index) => {
        if (c.recordset.length > 0) {
          return [...columnNames][index];
        }
      }
      ).filter(c => c);
      answers.push(tableNames[i].concat(' => ', `[${columnNamesWithResults.join(', ')}]`));
    }
  }
  return { [database]: answers };
};

(async () => {
  const databases = ['BACKOFFICESETUP', 'BACKOFFICE'];
  const wordFilter = '0.00';
  const results = await Promise.all(
    databases.map((database) => findTableByOneTextValue({ palabra: wordFilter, database}))
  );
  console.log(results);
})();
