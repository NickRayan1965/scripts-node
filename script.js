const fs = require('fs');

function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

async function main() {
  const file1Path = './archivos/demo1.txt'; // Ruta del primer archivo
  const file2Path = './archivos/demo2.txt'; // Ruta del segundo archivo

  try {
    // Leer los contenidos de los archivos
    const file1Content = await readFileAsync(file1Path);
    const file2Content = await readFileAsync(file2Path);

    const linesFile1 = file1Content.trim().split('\n');
    const linesFile2 = file2Content.trim().split('\n');

    const result = {};

    // 1. Comprobar que el segundo archivo tenga el mismo número de "columnas" en todas las líneas
    const numColumnsFile1 = linesFile1.map((line) => line.split(/\s+/).length);;
    const numColumnsFile2 = linesFile2.map((line) => line.split(/\s+/).length);
    result.mismo_n_columnas = `Respuesta: ${
      JSON.stringify(numColumnsFile1) === JSON.stringify(numColumnsFile2) ? 'si' : 'no'
    } corresponden al mismo numero de columnas por linea`;

    // 2. Comprobar que en las mismas líneas correspondientes, en las mismas columnas, tengan la misma longitud
    result.misma_longitud = {
      respuesta: 'Si corresponden las logitudes en todos los datos',
      detalles: [],
    }
    const sameLength = !linesFile1.map((line1, index) => {
      const line2 = linesFile2[index];
      const columns1 = line1.split(/\s+/);
      const columns2 = line2.split(/\s+/);

      if (columns1.length !== columns2.length) {
        result.misma_longitud.detalles.push(`La linea ${index + 1} no tiene la misma cantidad de columnas`);
        return false;
      }

      return !columns1.map((col1, colIndex) => {
        if (col1.length !== columns2[colIndex].length) {
          result.misma_longitud.detalles.push(`La columna ${colIndex + 1} de la linea ${index + 1} no tiene la misma longitud`);
          return false;
        }
        return true;
      }).includes(false);
    }).includes(false);
    if (!sameLength) result.misma_longitud.respuesta = 'No corresponden las longitudes en todos los datos';

    // 3. Comprobar si son los mismos textos
    result.mismo_texto = `Respuesta: ${file1Content === file2Content ? 'si' : 'no'} son los mismos textos.`;

    console.log(result);
  } catch (err) {
    console.error('Error al leer los archivos:', err);
  }
}

main();
