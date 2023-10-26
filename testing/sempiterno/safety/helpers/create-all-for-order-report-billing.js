const { faker } = require('@faker-js/faker');
const {
  createAssignmentResponse,
} = require('../utils/assignment-response.requests');
const {
  createClientReportPrice,
} = require('../utils/client-report-price.requests');
const { createClient } = require('../utils/client.requests');
const { createCountry } = require('../utils/country.requests');
const { createCurrency } = require('../utils/currency.requests');
const { createDistrict } = require('../utils/district.requests');
const { createLanguage } = require('../utils/language.requests');
const { login } = require('../utils/login.requests');
const { createOrderClass } = require('../utils/order-class.requests');
const {
  createOrderReport,
  getOneOrderReportById,
  createOrderReportBilling,
  getBillingFile,
} = require('../utils/order-report.requests');
const { createPerson } = require('../utils/person.requests');
const { createProcedureType } = require('../utils/procedure-type.requests');
const { createProduct } = require('../utils/product.requests.');
const {
  createReportAssignment,
  changeReportAssignmentAprovedState,
} = require('../utils/report-assignment.requests');
const { createUser } = require('../utils/user.requests');
const {
  createCompletedOrderReport,
} = require('./create-completed-order-report');

const createAllForOrderReportBilling = async ({ host, jwt }) => {
  const country = await createCountry({
    host,
    jwt,
  });
  const district = await createDistrict({
    host,
    jwt,
    countryId: country.id,
  });
  const language = await createLanguage({
    host,
    jwt,
    is_default: false,
  });
  const person = await createPerson({
    host,
    jwt,
    countryId: country.id,
  });
  const client = await createClient({
    host,
    jwt,
    billingLanguageId: language.id,
    countryId: country.id,
    reportLanguageId: language.id,
    apply_penalty_for_late_delivery: true,
  });
  const product = await createProduct({
    host,
    jwt,
  });
  const procedureType = await createProcedureType({
    host,
    jwt,
  });
  const orderClass = await createOrderClass({
    host,
    jwt,
  });
  const currency = await createCurrency({
    host,
    jwt,
    show_as_billing_currency: true,
  });
  const clientReportPrice = await createClientReportPrice({
    host,
    jwt,
    clientId: client.id,
    countryId: country.id,
    currencyId: currency.id,
    procedureTypeId: procedureType.id,
    productId: product.id,
  });
  const completedOrderReports = await Promise.all(
    [...Array(10)].map(async () => {
      return createCompletedOrderReport({
        host,
        jwt,
        clientId: client.id,
        clientReportPriceId: clientReportPrice.id,
        districtResidencyId: district.id,
        languageId: language.id,
        nationalityCountryId: country.id,
        orderClassId: orderClass.id,
        personId: person.id,
      });
    })
  );
  
  const billing = await createOrderReportBilling({
    host,
    jwt,
    clientId: client.id,
    currencyId: currency.id,
    details: completedOrderReports.map((orderReportId) => ({
      orderReportId: orderReportId,
      apply_penalty: faker.datatype.boolean(),
    })),
  });
  const billingFile = await getBillingFile({
    host,
    jwt,
    id: billing.id,
  });
  return {
    billing,
    billingFile,
    clientId: client.id,
    districtResidencyId: district.id,
    languageId: language.id,
    nationalityCountryId: country.id,
    orderClassId: orderClass.id,
    personId: person.id,
    clientReportPriceId: clientReportPrice.id,
  };
};

module.exports = {
  createAllForOrderReportBilling,
};
