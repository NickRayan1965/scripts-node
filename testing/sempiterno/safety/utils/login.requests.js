const login = async ({
  host,
  credentials,
}) => { 
  const response = await fetch(`${host}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return await response.json();
}
module.exports = {
  login,
};