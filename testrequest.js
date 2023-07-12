(async () => {
  const peticiones = [];
  const n_requests = 100;
  for (let i = 0; i < n_requests; i++) {
    peticiones.push(
      fetch('http://localhost:3000/seed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer ' +
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg4NTgzNTczLCJleHAiOjE2ODg2Njk5NzN9.fO015VRMU7vFIm6mwPR7I4tsMAacmFVlaSsmS79--q4',
        },
      })
    );
  }
  console.time('Tiempo de respuesta');
  const responses = await Promise.all(peticiones);
  console.timeEnd('Tiempo de respuesta');
  const jsons = await Promise.all(responses.map((r) => r.json()));
  console.table(jsons);
})();
