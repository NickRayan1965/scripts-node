const { faker } = require('@faker-js/faker');
const fs = require('fs');
const createOrderReport = async ({
  host,
  jwt,
  clientId,
  personId,
  languageId,
  clientReportPriceId,
  orderClassId,
  scheduled_start_date,
  scheduled_end_date,
  is_invoiced = true,
}) => {
  const body = {
    client: clientId,
    person: personId,
    person_type: faker.datatype.boolean() ? 'E' : 'P',
    language: languageId,
    orderClass: orderClassId,
    scheduled_start_date,
    clientReportPriceId,
    scheduled_end_date,
    note: faker.lorem.sentence(),
    is_invoiced,
    priority: faker.datatype.boolean() ? 'NORMAL' : 'URGENTE',
    advanced_billing: faker.datatype.boolean(),
    send_email: faker.datatype.boolean(),
  };
  const response = await fetch(`${host}/api/v1/order-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });
  return await response.json();
};
const getOneOrderReportById = async ({ host, jwt, id }) => {
  const response = await fetch(`${host}/api/v1/order-report/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });
  return await response.json();
};
const createOrderReportBilling = async ({
  host,
  jwt,
  clientId,
  currencyId,
  details = [],
}) => {
  const body = {
    clientId,
    serial_number: faker.string.nanoid(4),
    invoice_number: faker.string.nanoid(20),
    billing_date: faker.date.past().toISOString().split('T')[0],
    currencyId,
    igv_porcentage: 18,
    other_charges: 1000,
    details,
  };
  const formData = new FormData();
  for (const key in body) {
    const value = body[key];
    if (!value) continue;
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      continue;
    }
    formData.append(key, body[key].toString());
  }
  const file = fs.readFileSync('./billing.xlsx');
  const blob = new Blob([file], {
    type: 'application/pdf',
  });
  formData.append('file', blob, 'billing.xlsx');
  const response = await fetch(`${host}/api/v1/order-report-billing-header`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });
  return await response.json();
};
const getBillingFile = async ({ host, jwt, id }) => {
  const response = await fetch(`${host}/api/v1/order-report-billing-header/get-billing-file/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  return await response.arrayBuffer();
};
module.exports = {
  createOrderReport,
  getOneOrderReportById,
  createOrderReportBilling,
  getBillingFile,
};
