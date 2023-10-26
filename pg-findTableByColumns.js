import pg from 'pg';
const { Pool } = pg;

const config = {
  user: 'nick',
  password: '1234',
  host: 'localhost',
  port: 5432, // El puerto por defecto de PostgreSQL es 5432
};

const findTableByColumn = async ({
  column,
  database,
  strictSearch = true,
  notLikeExclusions = [],
}) => {
  const pool = new Pool({ ...config, database });
  const client = await pool.connect();

  // Imprimir todas las tablas
  const likeExpression = strictSearch ? `= '${column}'` : `LIKE '%${column}%'`;
  const notLikeExclusionExpressions = notLikeExclusions
    .map((e) => `AND table_name NOT LIKE '%${e}%'`)
    .join(' ');

  const query = `
    SELECT table_name
    FROM information_schema.columns
    WHERE table_catalog = '${database}' AND column_name ${likeExpression}
    ${notLikeExclusions.length > 0 ? notLikeExclusionExpressions : ''}
    GROUP BY table_name;
  `;

  const result = await client.query(query);
  const tableNames = result.rows.map((r) => r.table_name);
  
  client.release();
  return { [database]: tableNames };
};

(async () => {
  const databases = ['safety-updated-bk']; // Reemplaza estos nombres por tus bases de datos
  const column = 'c_tipiem';
  const results = await Promise.all(
    databases.map((database) =>
      findTableByColumn({
        column,
        database,
        strictSearch: false,
        notLikeExclusions: [],
      })
    )
  );
  console.log(results);
})();
