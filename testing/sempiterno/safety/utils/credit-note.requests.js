const { faker } = require('@faker-js/faker');
const fs = require('fs');
const createCreditNote = async ({
  host,
  jwt,
  billingHeaderId,
  details = [],
}) => {
  const body = {
    billingHeaderId,
    credit_note_number: faker.string.nanoid(25),
    credit_note_date: faker.date.past().toISOString().split('T')[0],
    details,
  };
  const formData = new FormData();
  for (const key in body) {
    if (!body[key]) continue;
    if (typeof body[key] === 'object') {
      formData.append(key, JSON.stringify(body[key]));
      continue;
    }
    formData.append(key, body[key].toString());
  }
  const file = fs.readFileSync('./billing.xlsx');
  //excel
  const blob = new Blob([file], {
    //type xlsx
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  formData.append('file', blob, 'billing.xlsx');
  const response = await fetch(
    `${host}/api/v1/order-report-billing-credit-note-header`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    }
  );
  return await response.json();
};
module.exports = {
  createCreditNote,
};