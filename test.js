(async () => {
  fetch('http://localhost:3000/ubication/country', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':
        'Bearer ' +
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg4NTgzNTczLCJleHAiOjE2ODg2Njk5NzN9.fO015VRMU7vFIm6mwPR7I4tsMAacmFVlaSsmS79--q4',
    },
  }).then((res) => {
    return res.json()
  }).then((json) => {
    console.log(json)
  })

})();
