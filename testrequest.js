(async () => {
  for (let i = 0; i < 100; i++) {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(i);
      }, 1000);
    }
    );
    console.log(await promise);
  } 
})();
