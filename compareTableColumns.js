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

const compareTableColumns = async ({
  tables = [],
  databases,
}) => {
  const connections = await Promise.all(
    databases.map((database) => {
      return new mssql.ConnectionPool({ ...config, database }).connect();
    })
  );
  const results = await Promise.all(
    connections.map(async (connection, i) => {
      const columns = await connection.request().query(
        `SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'dbo' and TABLE_NAME in (${tables.map(
          (t) => `'${t}'`
        )})`
      );
      const tableColumns = columns.recordset.reduce((acc, curr) => {
        const key = databases[i] + ' / ' + curr.TABLE_NAME;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(curr.COLUMN_NAME);
        return acc;
      }
      , {});
      return tableColumns;
    })
  );
  const formatedResults = Object.assign({}, ...results);
  const columns = Object.values(formatedResults).reduce((acc, curr) => acc.concat(curr), []);
  const uniqueColumns = [...new Set(columns)]; 
  const repeatedColumns = [];
  uniqueColumns.forEach((column) => {
    if (Object.entries(formatedResults).every(([, value]) => value.includes(column))) {
      repeatedColumns.push(column);
    }
  });
  const result = Object.entries(formatedResults).reduce((acc, [key, value]) => {
    acc[key] = value.filter((column) => !repeatedColumns.includes(column));
    return acc;
  }, {});

  return { repeatedColumns, ...result };
  
};

(async () => {
  const databases = ['BACKOFFICESETUP', 'BACKOFFICE'];
  const tables = [
    "Ingreso201810",
    "Ingreso202210",
  ];
  const results = await compareTableColumns({
    tables,
    databases,
  });
  console.log(results);
  //terminar proceso
  process.exit();
})();
