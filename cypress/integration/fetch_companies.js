let data = {};
const URL = "https://www.medicines.org.uk";

async function visitCompanyPage(pageURL) {
  cy.visit(pageURL);

  const companyName = await new Cypress.Promise((resolve) => {
    cy.get("h1")
      .invoke("text")
      .then((txt) => resolve(txt.toString()));
  });

  const logoSrc = await new Cypress.Promise((resolve) => {
    cy.get(".companyLogoWrapper>img")
      .invoke("attr", "src")
      .then((txt) => resolve(txt.toString()));
  });

  // console.log(URL + logoSrc);
  let name = logoSrc.split("/");
  cy.downloadFile(URL + logoSrc, "images", name[name.length - 1] + ".jpg"); // Downloads logos, commented for testing

  
  // console.log(addr);

  let contact = [];

  let titles = await new Cypress.Promise((resolve) => {
    cy.get(".gfdCompanyDetailsTitle").then(($el) => resolve($el));
  });

  for (let i = 0; i < titles.length; i++) {
    const title = titles.eq(i).text();
    const val = titles.eq(i).next().children('p').text();
    contact.push({ [title]: val.trim() });
  }

  
  return { name: companyName,  img: name[name.length - 1] + ".jpg", contact: contact };
}

describe("Cypress Test Fetch", () => {
  it("Visits site pages", async () => {
    cy.visit("https://www.medicines.org.uk/emc/browse-companies");

    let compainesData = [];

    let browse = await new Cypress.Promise((resolve) => {
      cy.get(".browse").then(($el) => resolve($el));
    });

    let pagesList = [];
    for (let i = 0; i < browse.children().length; i++){
      let child = browse.children().eq(i);
      if (child.children('a').length > 0) {
      pagesList.push( child.children('a').eq(0).attr('href') );
      }
    }

    for (let pageIndex = 0; pageIndex < pagesList.length; pageIndex++){

    cy.visit(URL + pagesList[pageIndex]);

    let leftPanel = cy.get(".ieleft");

    let companies = await new Cypress.Promise((resolve) => {
      cy.get(".ieleft > ul").then(($el) => resolve($el));
    });

    let companiesList = companies.children();
    // console.log(companiesList.eq(0));

    let fetchCompanies = [];
    for (let i = 0; i < companiesList.length; i++) {
      if (i == 0 || i == 2 || (i > 2 && i == companiesList.length - 1)) {
        fetchCompanies.push(companiesList.eq(i).children().eq(0).attr("href"));
      }
    }

    for (let c of fetchCompanies) {
      compainesData.push( await visitCompanyPage(URL + c));
    }

    cy.writeFile('companies.json',compainesData);

    
    // let companyURLs = [];
    // for (let company of companies) {
    //   console.log(company);
    //   let href = company.children('a').attr('href');
    //   companyURLs.push(href);
    // }
    // console.log(companyURLs);
    }

  });
});
