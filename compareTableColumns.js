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

const compaereTableColumns = async ({
  column,
  database,
  strictSearch = true,
  notLikeExclutions = [],
}) => {
  const pool = new mssql.ConnectionPool({ ...config, database });
  await pool.connect();
  //imprimir todas las tablas
  const likeExpression = strictSearch
    ? `like '${column}'`
    : `like '%${column}%'`;
  const notLikeExclutionExpresions = notLikeExclutions
    .map((e) => `and TABLE_NAME not like '%${e}%'`)
    .join(' ');
  console.log(notLikeExclutionExpresions);
  const result = await pool
    .request()
    .query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' and COLUMN_NAME ${likeExpression} ${
        notLikeExclutions.length > 0 ? notLikeExclutionExpresions : ''
      } GROUP BY TABLE_NAME `
    );
  const tableNames = result.recordset.map((r) => r.TABLE_NAME);
  return { [database]: tableNames };
};

(async () => {
  const databases = ['BACKOFFICESETUP', 'BACKOFFICE'];
  const column = 'cdtpingreso';
  const results = await Promise.all(
    databases.map((database) =>
      compaereTableColumns({
        column,
        database,
        strictSearch: true,
        notLikeExclutions: ['Afilia', 'Anoma', 'cajar', 'DiaContom', 'Cierre_M', 'NCredito', 'NDebito',],
      })
    )
  );
  console.log(results);
})();
