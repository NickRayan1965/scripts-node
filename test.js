import { faker } from '@faker-js/faker';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
const server = 'http://localhost:3000/api/v1';
const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjk0MDk0MTA0LCJleHAiOjE2OTQ5NTgxMDR9.cOu2qy7KYF1V3IsAYbhTN3xI8-Sxp_mUAx7URcMEFmA"
async function getClientReferences() {
  const language = await createLanguage();
  const country = await createCountry(language.id);
  const documentType = await createDocumentType();
  const currency = await createCurrency();
  const adminCompany = await createAdminCompany(jwt);
  const reportTemplate = await createReportTemplate();
  const taxRegistration = await createTaxRegistration([language.id]);
  return {
    countryId: country.id,
    documentTypeId: documentType.id,
    currencyId: currency.id,
    adminCompanyId: adminCompany.id,
    reportTemplateId: reportTemplate.id,
    taxRegistrationId: taxRegistration.id,
  };
}
async function getPersonReferences() {
  const language = await createLanguage();
  const profession = await createProfession([language.id]);
  const identificationDocumentType = await createIdentificationDocumentType(
    language.id
  );
  const taxRegistration = await createTaxRegistration([language.id]);
  const currency = await createCurrency();
  const country = await createCountry(language.id);
  return {
    professionId: profession.id,
    identificationDocumentTypeId: identificationDocumentType.id,
    taxRegistrationId: taxRegistration.id,
    currencyId: currency.id,
    countryId: country.id,
  };
}
async function getOrderReportReferences() {
  const clientReferences = await getClientReferences();
  const personReferences = await getPersonReferences();
  const [
    client,
    person,
    product,
    country,
    procedureType,
    language,
    orderClass,
    documentType,
  ] = await Promise.all([
    createClient(clientReferences, jwt),
    createPerson(personReferences, jwt),
    createProduct(),
    createCountry(await createLanguage().id),
    createProcedureType(),
    createLanguage(),
    createOrderClass(),
    createDocumentType(),
  ]);
  return {
    client: client.id,
    person: person.id,
    product: product.id,
    country: country.id,
    procedureType: procedureType.id,
    language: language.id,
    orderClass: orderClass.id,
    deliveryDocumentType: documentType.id,
  };
}


async function testClient() {
  const clientReferences = await getClientReferences();
  const client = await createClient(clientReferences, jwt);
  if (client.statusCode) {
    console.log({ client });
    throw new Error();
  }
  console.log('CREATE CLIENT OK');
  const clientUpdated = await updateClient(
    client.id,
    clientStub(clientReferences),
    jwt
  );
  if (clientUpdated.statusCode) {
    console.log({ clientUpdated });
    throw new Error();
  }
  console.log('UPDATE CLIENT OK');
  const deleteClientResponse = await deleteClient(client.id, jwt);
  const clientDeleted = await getClientById(client.id, jwt);
  if (deleteClientResponse.status !== 200 || clientDeleted.isActive) {
    console.log({ clientDeleted: deleteClientResponse });
    throw new Error();
  }
  console.log('DELETE CLIENT OK');
  const clients = await getClients(jwt);
  if (clients.statusCode) {
    console.log({ clients });
    throw new Error();
  }
  console.log('GET CLIENTS OK');
}
async function testClientReportPrice() {
  const clientReferences = await getClientReferences();
  const client = await createClient(clientReferences, jwt);
  const product = await createProduct();
  const procedureType = await createProcedureType();
  const clientReportPrice = await createClientReportPrice({
    country: clientReferences.countryId,
    currency: clientReferences.currencyId,
    product: product.id,
    procedureType: procedureType.id,
  }, jwt, client.id);
  if (clientReportPrice.statusCode) {
    throw new Error();
  }
  console.log('CREATE CLIENT REPORT PRICE OK');
  const clientReportPricesOfOneClient = await getClientReportPrices(jwt, {
    clientId: client.id,
    relations: 'true',
  });
  const clientReportPrices = await getClientReportPrices(jwt, {
    relations: 'true',
  });
  if (clientReportPricesOfOneClient.statusCode) {
    throw new Error();
  }
  if(clientReportPrices.statusCode) {
    throw new Error();
  }
}
async function testCountry() {
  const language = await createLanguage();
  const country = await createCountry(language.id);
  if (country.statusCode) {
    console.log({ country });
    throw new Error();
  }
  console.log('CREATE COUNTRY OK');

  const countryUpdated = await updateCountry(country.id, countryStub());
  if (countryUpdated.statusCode) {
    console.log({ countryUpdated });
    throw new Error();
  }
  console.log('UPDATE COUNTRY OK');

  const deleteCountryResponse = await deleteCountry(country.id);
  const countryDeleted = await getCountryById(country.id);
  if (deleteCountryResponse.status !== 200 || countryDeleted.isActive) {
    console.log({ countryDeleted: deleteCountryResponse });
    throw new Error();
  }
  console.log('DELETE COUNTRY OK');
  const countries = await getCountries();
  if (countries.statusCode) {
    console.log({ countries });
    throw new Error();
  }
  console.log('GET COUNTRIES OK');
}
async function testPerson() {
  console.log('\n')
  console.log('--------TEST PERSON-------');
  const personReferences = await getPersonReferences();
  const person = await createPerson(personReferences, jwt);
  if (person.statusCode) {
    console.log({ person });
    throw new Error();
  }
  console.log('CREATE PERSON OK');

  const personUpdated = await updatePerson(
    person.id,
    personStub(personReferences),
    jwt
  );
  if (personUpdated.statusCode) {
    throw new Error();
  }
  console.log('UPDATE PERSON OK');

  const deletePersonResponse = await deletePerson(person.id, jwt);
  const personDeleted = await getPersonById(person.id, jwt);
  if (deletePersonResponse.status !== 200 || personDeleted.isActive) {
    console.log({ deletePersonResponse });
    throw new Error();
  }
  console.log('DELETE PERSON OK');
  const persons = await getPersons(jwt);
  if (persons.statusCode) {
    throw new Error();
  }
  console.log('GET PERSONS OK');
  console.log('------END TEST PERSON-----');
}

async function testOrderReport() {
  console.log('\n')
  console.log('-------TEST ORDER REPORT------');
  const [orderReportReferences, orderReportReferences1] = await Promise.all([await getOrderReportReferences(), await getOrderReportReferences()]);
  const orderReport = await createOrderReport(orderReportReferences, jwt);
  if (orderReport.statusCode) {
    throw new Error();
  }
  const orderReport1 = await createOrderReport(orderReportReferences1, jwt);
  console.log('CREATE ORDER REPORT OK');

  const orderReportUpdated = await updateOrderReport(
    orderReport.id,
    orderReportStub(orderReportReferences),
    jwt
  );
  if (orderReportUpdated.statusCode) {
    throw new Error();
  }
  console.log('UPDATE ORDER REPPORT OK');
  // const deleteOrderReportResponse = await deleteOrderReport(orderReportUpdated.id, jwt);
  // const orderReportDeleted = await getOrderReportById(orderReportUpdated.id, jwt);
  // if (deleteOrderReportResponse.status !== 200 || orderReportDeleted.isActive) {
  //   throw new Error();
  // }
  // console.log('DELETE ORDER REPORT OK');

  const orderReportsActives = await getOrderReports(jwt, { all: true, isActive: true });
  if (orderReportsActives.statusCode) {
    throw new Error();
  }
  if(orderReportsActives.some(or => !or.isActive)) throw new Error('Filtro de activos no funciona');
  console.log('GET ACTIVES ORDER REPORTS  OK');

  const orderReportsInactives = await getOrderReports(jwt, { all: true, isActive: false });
  if (orderReportsInactives.statusCode) {
    throw new Error();
  }
  if(orderReportsInactives.some(or => or.isActive)) throw new Error('Filtro de inactivos no funciona');
  console.log('GET INACTIVES ORDER REPORTS OK');

  const orderReports = await getOrderReports(jwt, { all: true, clientId: orderReportReferences.client, relations: true });
  if (orderReports.statusCode) {
    throw new Error();
  }
  if(orderReports.some(or => or.client.id !== orderReportReferences.client)) throw new Error('Filtro de cliente no funciona');
  console.log('GET ORDER REPORTS BY CLIENT OK');


  console.log('GET ORDER REPORTS OK');
  console.log('-----END TEST ORDER REPORT----');
  
}
async function testReportAssignment() {
  const orderReport = await createOrderReport(await getOrderReportReferences(), jwt);
  const roles = await getRoles(jwt);
  console.log({roles});
  const user = await createUser(userStub({
    mainRoleId: roles.find(r => r.name === 'TRADUCTOR').id,
    account_state: 'U',
  }), jwt);
  console.log({user});
  const reportAssignment = await createReportAssignment({
    assignedUser: user.id,
    orderReport: orderReport.id,
  }, jwt);
  console.log({reportAssignment});
}
async function testUser() {
  console.log('\n')
  console.log('--------TEST USER-------');
  const roles = await getRoles(jwt);
  const language = await createLanguage();
  const country = await createCountry(language.id);
  const district = await createDistrict({ jwt, countryId: country.id });
  const userDataWithFiles = userStub({
    account_state: 'U',
    extraRolesIds: [],
    mainRoleId: roles[0].id,
    //personal_email: 'nickcerron1111@gmail.com',
    districtResidencyId: district.id,
    nationalityCountryId: country.id,
    file_labels: ['photo', 'criminalRecord']
  });
  //delete userDataWithoutFiles.file_labels;
  //delete userDataWithoutFiles.extraRolesIds;
  const userFormData = new FormData();
  for (const key in userDataWithFiles) {
    if (!userDataWithFiles[key]) continue;
    userFormData.append(key, userDataWithFiles[key].toString());
  }
  userFormData.append('files', fs.createReadStream('./archivos/FOUNDATIONS 6 web.pdf'));
  userFormData.append('files', fs.createReadStream('./archivos/demo2.txt'));
  const user = await createUser(userFormData, jwt);
  console.log({user});
  if (user.statusCode) {
    throw new Error();
  }
  console.log('CREATE USER with FILES OK');
  const postulantWithoutFiles = userStub({
    account_state: 'P',
    mainRoleId: roles[1].id,
    file_labels: [],
    //personal_email: 'nickcerron1111@gmail.com',
    districtResidencyId: district.id,
    nationalityCountryId: country.id,
  });
  const postulantFormData = new FormData();
  for (const key in postulantWithoutFiles) {
    if (!postulantWithoutFiles[key]) continue;
    postulantFormData.append(key, postulantWithoutFiles[key].toString());
  }
  const postulant = await createUser(postulantFormData, jwt);
  if (postulant.statusCode) {
    throw new Error();
  }
  console.log({postulant});
  console.log('CREATE USER Postulant without FILES OK');
}
(async () => {
  try {
    //await testCountry();
    //await testClient();
    //await testClientReportPrice();
    //await testPerson();
    //await testOrderReport();
    await testReportAssignment();
  } catch (e) {
    console.log(e);
  }
})();

async function post(body, path, jwt) {
  const response = await fetch(`${server}${path}`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : undefined,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const json = await response.json();
  if (json.statusCode) console.log({ path, json});
  return json;
}
async function postFormData(body, path, jwt) {
  const response = await fetch(`${server}${path}`, {
    body,
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : undefined,
      ContentType: 'multipart/form-data',
    },
    method: 'POST',
  });
  const json = await response.json();
  if (json.statusCode) console.log(json);
  return json;
}
async function patch(body, path, jwt) {
  const response = await fetch(`${server}${path}`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwt ? `Bearer ${jwt}` : undefined,
    },
    method: 'PATCH',
  });
  const json = await response.json();
  if (json.statusCode) console.log(json);
  return json;
}
async function _delete(path, jwt) {
  const response = await fetch(`${server}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwt ? `Bearer ${jwt}` : undefined,
    },
    method: 'DELETE',
  });
  return response;
}
async function get(path, jwt) {
  const response = await fetch(`${server}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: jwt ? `Bearer ${jwt}` : undefined,
    },
    method: 'GET',
  });
  const json = await response.json();
  if (json.statusCode) console.log(json);
  return json;
}

function productStub(){
  return {
    name: faker.string.nanoid(50),
  }
}
function districtStub() {
  return {
    name: faker.string.nanoid(50),
  }
}
function orderClassStub() {
  return {
    name: faker.string.nanoid(50),
  };
}
function countryStub(languageId) {
  return {
    iso_cod: faker.string.nanoid(3),
    web_image: faker.image.url(),
    descriptions: languageId
      ? [
          {
            languageId,
            short_description: faker.string.nanoid(30),
            long_description: faker.string.nanoid(100),
            demonym: faker.string.nanoid(35),
          },
        ]
      : undefined,
  };
}
function orderReportStub({
  client,
  person,
  product,
  procedureType,
  orderClass,
  deliveryDocumentType,
  language,
  country,
}) {
  return {
    client,
    person,
    product,
    procedureType,
    orderClass,
    deliveryDocumentType,
    language,
    country,
    person_type: faker.datatype.boolean() ? 'P' : 'E',
    price: faker.number.float({ min: 1 }),
    reference_number: faker.string.nanoid(30),
    credit_term: faker.string.nanoid(10),
    credit_amount: faker.number.float({ min: 1 }).toString(),
    scheduled_start_date: faker.date.past().toISOString().split('T')[0],
    scheduled_end_date: faker.date.past().toISOString().split('T')[0],
    note: faker.string.sample(),
    is_invoiced: faker.datatype.boolean(),
    priority: faker.datatype.boolean() ? 'NORMAL' : 'URGENTE',
    advanced_billing: faker.datatype.boolean(),
    send_email: faker.datatype.boolean(),
  };
}
function userStub({
  mainRoleId,
  extraRolesIds,
  nationalityCountryId,
  districtResidencyId,
  account_state,
  personal_email,
  file_labels,
}) {
  return {
    user_name: faker.string.nanoid(20),
    names: faker.string.nanoid(40),
    last_name: faker.string.nanoid(40),
    mother_s_name: faker.string.nanoid(40),
    business_email: faker.internet.email(),
    mainRoleId,
    extraRolesIds,
    account_state,
    identity_document_type: faker.datatype.boolean() ? 'FC' : 'D',
    nationalityCountryId,
    districtResidencyId,
    file_labels,
    personal_email: personal_email || faker.internet.email(),
    birth_date: faker.date.past().toISOString().split('T')[0],
    phone: faker.phone.number(),
    sex: faker.datatype.boolean() ? 'M' : 'F',
  }
}
function languageStub() {
  return {
    short_description: faker.string.nanoid(12),
    long_description: faker.string.nanoid(30),
    cFlglnd: faker.string.numeric(),
  };
}
function documentTypeStub() {
  return {
    name: faker.string.nanoid(50),
    short_name: faker.string.nanoid(30),
  };
}
function currencyStub() {
  return {
    name: faker.string.nanoid(50),
    symbol: faker.string.nanoid(15),
    iso_code: faker.string.nanoid(3),
    show_as_billing_currency: faker.datatype.boolean(),
  };
}
function adminCompanyStub() {
  return {
    description: faker.string.nanoid(100),
    abbreviation: faker.string.nanoid(20),
    report_title: faker.string.nanoid(100),
    phone: faker.phone.number(),
    fax: faker.string.nanoid(50),
    server_email: faker.internet.email(),
    web_site: faker.internet.url(),
    email: faker.internet.email(),
    address: faker.string.nanoid(150),
    logo_path: faker.internet.url(),
    logo_url: faker.internet.url(),
    email_server_configuration: faker.string.nanoid(150),
    work_team_description: faker.string.nanoid(50),
  };
}
function reportTemplateStub() {
  return {
    name: faker.string.nanoid(50),
  };
}
function taxRegistrationStub(languageIds) {
  const descriptions = [];
  for (let i = 0; i < languageIds.length; i++) {
    descriptions.push(taxRegistrationDescriptionStub(languageIds[i]));
  }
  return {
    descriptions,
  };
}
function taxRegistrationDescriptionStub(languageId) {
  return {
    name: faker.string.nanoid(50),
    languageId,
  };
}
function clientStub({
  countryId,
  billingLanguageId,
  reportLanguageId,
  defaultDocumentTypeId,
  billingCurrencyId,
  adminCompanyId,
  reportTemplateId,
  taxRegistrationId,
}) {
  return {
    name: faker.string.nanoid(100),
    short_name: faker.string.nanoid(30),
    person_type: faker.datatype.boolean() ? 'P' : 'E',
    country: countryId,
    address: faker.string.nanoid(200),
    phones: [faker.phone.number(), faker.phone.number()],
    fax: faker.string.nanoid(60),
    email: faker.internet.email(),
    web_site: faker.internet.url(),
    representative: faker.string.nanoid(100),
    billingLanguage: billingLanguageId,
    reportLanguage: reportLanguageId,
    defaultDocumentType: defaultDocumentTypeId,
    observations: faker.string.nanoid(500),
    logo: faker.internet.url(),
    billingCurrency: billingCurrencyId,
    adminCompany: adminCompanyId,
    tax_registration_number: faker.string.nanoid(30),
    print_logo: faker.datatype.boolean(),
    reportTemplate: reportTemplateId,
    apply_penalty_for_late_delivery: faker.datatype.boolean(),
    taxRegistration: taxRegistrationId,
  };
}
function clientReportPriceStub({
  product,
  country,
  currency,
  procedureType,
}) {
  return {
    product,
    country,
    currency,
    procedureType,
    price: faker.number.float({ min: 1 }),
    min_days: faker.number.int({ min: 1, max: 100 }),
    max_days: faker.number.int({ min: 101, max: 200 }),
    penalty: faker.number.int({ min: 1, max: 100 }),
  };
}
function professionStub(languageIds) {
  const descriptions = [];
  for (let i = 0; i < languageIds.length; i++) {
    descriptions.push(professionDescriptionStub(languageIds[i]));
  }
  return {
    descriptions,
  };
}
function professionDescriptionStub(languageId) {
  return {
    languageId,
    name: faker.string.nanoid(50),
  };
}
function identificationDocumentTypeStub(languageId) {
  return {
    short_name: faker.string.nanoid(30),
    name: faker.string.nanoid(50),
    languageId,
  };
}
function personStub({
  countryId,
  professionId,
  originCountryId,
  identificationDocumentTypeId,
  taxRegistrationId,
  currencyId,
}) {
  return {
    person_type: faker.datatype.boolean() ? 'P' : 'E',
    sex: faker.datatype.boolean() ? 'M' : 'F',
    name: faker.string.nanoid(100),
    lastname: faker.string.nanoid(50),
    mother_s_name: faker.string.nanoid(50),
    acronym: faker.string.nanoid(50),
    sector_code: faker.string.nanoid(4),
    identity_document_number: faker.string.nanoid(50),
    tax_document_number: faker.string.nanoid(50),
    countryId,
    phones: [faker.phone.number(), faker.phone.number()],
    birth_date: faker.date.past().toISOString().split('T')[0],
    fax: faker.string.nanoid(60),
    email: faker.internet.email(),
    web_site: faker.internet.url(),
    city: faker.string.nanoid(100),
    address: faker.string.nanoid(200),
    // S C D V
    civil_status: faker.datatype.boolean()
      ? 'S'
      : faker.datatype.boolean()
      ? 'C'
      : faker.datatype.boolean()
      ? 'D'
      : 'V',
    representative: faker.string.nanoid(50),
    professionId,
    originCountryId,
    contact: faker.string.nanoid(25),
    contact_phone: faker.phone.number(),
    identificationDocumentTypeId,
    taxRegistrationId,
    currencyId,
  };
}
function procedureTypeStub() {
  return {
    short_name: faker.string.nanoid(10),
    name: faker.string.nanoid(30),
  };
}
function reportAssignmentStub({
  assignedUser,
  orderReport,
}) {
  return {
    assignedUser,
    orderReport,
    state: faker.datatype.boolean() ? 'WK' : 'PE',
    is_on_time: faker.datatype.boolean(),
    programed_start_date: faker.date.past().toISOString().split('T')[0],
    programed_end_date: faker.date.past().toISOString().split('T')[0],
    note: faker.string.nanoid(500),
    include_indicators: faker.datatype.boolean(),
  };
}





//*//*//*//*//*//*//*/*//*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/*/
async function createProduct(){
  const body = productStub();
  return post(body, '/product');
}
async function createOrderClass(){
  const body = orderClassStub();
  return post(body, '/order-class');
}
async function createProcedureType(){
  const body = procedureTypeStub();
  return post(body, '/procedure-type');
}
async function createIdentificationDocumentType(languageId) {
  const body = identificationDocumentTypeStub(languageId);
  return post(body, '/identification-document-type');
}
async function createLanguage() {
  const body = languageStub();
  return post(body, '/language');
}
async function createDocumentType() {
  const body = documentTypeStub();
  return post(body, '/document-type');
}
async function createCurrency() {
  const body = currencyStub();
  return post(body, '/currency');
}
async function createAdminCompany(jwt) {
  const body = adminCompanyStub();
  return post(body, '/admin-company', jwt);
}
async function createReportTemplate() {
  const body = reportTemplateStub();
  return post(body, '/report-template');
}
async function createTaxRegistration(languageIds) {
  const body = taxRegistrationStub(languageIds);
  return post(body, '/tax-registration');
}
async function createProfession(languageIds) {
  const body = professionStub(languageIds);
  return post(body, '/profession');
}

//* Country
async function createCountry(languageId) {
  const body = countryStub(languageId);
  return post(body, '/country');
}
async function updateCountry(id, body, jwt) {
  return patch(body, `/country/${id}`, jwt);
}
async function deleteCountry(id, jwt) {
  return _delete(`/country/${id}`, jwt);
}
async function getCountryById(id, jwt) {
  return get(`/country/${id}`, jwt);
}
async function getCountries(jwt) {
  return get('/country', jwt);
}
//*

//* Person
async function createPerson(
  {
    countryId,
    professionId,
    originCountryId,
    identificationDocumentTypeId,
    taxRegistrationId,
    currencyId,
  },
  jwt
) {
  const body = personStub({
    countryId,
    professionId,
    originCountryId,
    identificationDocumentTypeId,
    taxRegistrationId,
    currencyId,
  });
  return post(body, '/person', jwt);
}
async function updatePerson(id, body, jwt) {
  return patch(body, `/person/${id}`, jwt);
}
async function deletePerson(id, jwt) {
  return _delete(`/person/${id}`, jwt);
}
async function getPersonById(id, jwt) {
  return get(`/person/${id}`, jwt);
}
async function getPersons(jwt) {
  return get('/person', jwt);
}

//*

//* Client
async function createClient(
  {
    countryId,
    billingLanguageId,
    reportLanguageId,
    defaultDocumentTypeId,
    billingCurrencyId,
    adminCompanyId,
    reportTemplateId,
    taxRegistrationId,
  },
  jwt
) {
  const body = clientStub({
    countryId,
    billingLanguageId,
    reportLanguageId,
    defaultDocumentTypeId,
    billingCurrencyId,
    adminCompanyId,
    reportTemplateId,
    taxRegistrationId,
  });
  return post(body, '/client', jwt);
}

async function updateClient(id, body, jwt) {
  return patch(body, `/client/${id}`, jwt);
}
async function deleteClient(id, jwt) {
  return _delete(`/client/${id}`, jwt);
}
async function getClientById(id, jwt) {
  return get(`/client/${id}`, jwt);
}
async function getClients(jwt) {
  return get('/client', jwt);
}
async function createClientReportPrice(
  {
    product,
    country,
    currency,
    procedureType,
  }, jwt, clientId) {
    const body = clientReportPriceStub({
      country,
      currency,
      procedureType,
      product,
    });
    return post(body, `/client-report-price?clientId=${clientId}`, jwt);
  }
async function getClientReportPrices(jwt, query) {
  const queryParams = new URLSearchParams(query);
  return get(`/client-report-price?${queryParams.toString()}`, jwt);
}
//*


//* Order Report
async function createOrderReport(
  {
    client,
    person,
    product,
    procedureType,
    orderClass,
    deliveryDocumentType,
    language,
    country,
  },
  jwt
) {
  const body = orderReportStub({
    client,
    person,
    product,
    procedureType,
    orderClass,
    deliveryDocumentType,
    language,
    country,
  });
  return post(body, '/order-report', jwt);
}
async function updateOrderReport(id, body, jwt) {
  return patch(body, `/order-report/${id}`, jwt);
}
async function deleteOrderReport(id, jwt) {
  return _delete(`/order-report/${id}`, jwt);
}
async function getOrderReportById(id, jwt) {
  return get(`/order-report/${id}`, jwt);
}
async function getOrderReports(jwt, params) {
  const query = new URLSearchParams(params);
  return get(`/order-report?${query.toString()}`, jwt);
}

//*Roles
async function getRoles(jwt) {
  return get('/user-role', jwt);
}
//*User
async function createUser(body, jwt) {
  const userFormData = new FormData();
  for (const key in body) {
    if (!body[key]) continue;
    userFormData.append(key, body[key].toString());
  }
  return postFormData(userFormData, '/user', jwt);
}
async function getUsers(jwt, queryParams) {
  const query = new URLSearchParams(queryParams);
  return get(`/user?${query}`, jwt);
}

//*Ubication
async function createDistrict({jwt, countryId }) {
  const body = districtStub();
  return post(body, `/district?countryId=${countryId}`, jwt);
}

async function createReportAssignment({
  assignedUser,
  orderReport,
}, jwt) {
  const body = reportAssignmentStub({
    assignedUser,
    orderReport,
  });
  return post(body, '/report-assignment', jwt);
}