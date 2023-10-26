const { faker } = require("@faker-js/faker");

const getRoles = async ({
  host,
  jwt,
}) => {
  const response = await fetch(`${host}/api/v1/user-role`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  return await response.json();
}
module.exports = {
  getRoles,
};
