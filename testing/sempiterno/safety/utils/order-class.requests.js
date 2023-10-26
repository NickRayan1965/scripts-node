const { faker } = require("@faker-js/faker");

const createOrderClass = async ({
  host,
  jwt,
}) => {
  const body = {
    name: 'Order Class' + faker.string.nanoid(10),
    short_name: 'OrdCls ' + faker.string.nanoid(3),
  };
  const response = await fetch(`${host}/api/v1/order-class`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });
  return await response.json();
}
module.exports = {
  createOrderClass,
};
