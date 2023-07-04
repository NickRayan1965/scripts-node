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
const findTableByOneTextValue = async (palabra, database) => {
  const pool =  new mssql.ConnectionPool({...config, database});
  await pool.connect();
  //imprimir todas las tablas
  const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' and TABLE_SCHEMA = 'dbo'");
  const tableNames = result.recordset.map((r) => r.TABLE_NAME);
  const answers = [];
    for(let i = 0; i<tableNames.length; i++){
      const columns = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableNames[i]}' and (DATA_TYPE like '%char%' or DATA_TYPE like '%text%')`);
      const columnNames = new Set(columns.recordset.map((r) => r.COLUMN_NAME));
      if (columnNames.size === 0) continue;
      const whereOr = [...columnNames].map((c) => `"${c}" like '%${palabra}%'`).join(' OR ');
      const query = `SELECT * FROM ${tableNames[i]} WHERE ${whereOr}`;
      const result = await pool.request().query(query);
      if (result.recordset.length > 0) answers.push(tableNames[i]);
    }
  return {[database]: answers};
}

(async () => {
  const databases = ['BACKOFFICESETUP', 'BACKOFFICE'];
  const wordFilter = 'ALEXANDER';
  const results = await Promise.all(databases.map((database) => findTableByOneTextValue(wordFilter, database)));
  console.log(results);
})();
