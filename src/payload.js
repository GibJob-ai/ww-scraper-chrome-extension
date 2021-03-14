import axios from "axios";

function getXpath (headerText, lowerTable){
  return `//strong[contains(text(), '${headerText}')]/parent::td/parent::tr/td[2]${lowerTable?"":"/span"}`;
}

function getElementByXpath(xpath) {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function sendMessage(message) {
    chrome.runtime.sendMessage(message)
}

async function scrapeContent(){
  const JOB_CATEGORY = "Job Category (NOC):";
  const JOB_SUMMARY = "Job Summary:";
  const JOB_RESPONSIBILITIES = "Job Responsibilities:";
  const REQUIRED_SKILLS = "Required Skills:";
  const DOCUMENTS_REQUIRED = "Documents Required:";
  const JOB_TITLE = "Job Title:";
  const ORGANIZATION = "Organization:";
  const DIVISION = "Division:";

  const TITLES_MAIN_TABLE = [JOB_TITLE,
    JOB_CATEGORY,
    JOB_SUMMARY,
    JOB_RESPONSIBILITIES,
    REQUIRED_SKILLS,
    DOCUMENTS_REQUIRED,
    JOB_TITLE];

  const TITLES_LOWER_TABLE = [ORGANIZATION,
                        DIVISION];
  let payload = {}
  TITLES_MAIN_TABLE.forEach(function (i) {
    let element = getElementByXpath(getXpath(i, false));
    payload[i] = element.innerText;
  });
  TITLES_LOWER_TABLE.forEach(function (i) {
    let element = getElementByXpath(getXpath(i, true));
    payload[i] = element.innerText;
  });
  try {


    // TODO replace this random API I found with our backend when it gets made
    // this random api call is just to prove that we have external connectivity thanks to the payload injection
    const response = await axios.get("https://covid19.mathdro.id/api/countries/canada");
    

    // Also here is an example of loading sensitive data from the .env file in the root:
    let password = process.env.PASSWORD; // assuming you set PASSWORD="something" in .env in the root dir of the app

    payload['res'] = response.data;
    return JSON.stringify(payload);
  } catch (error) {
    let error_str = `${error.message}`;
    payload['res_err'] = error_str;
    return JSON.stringify(payload);
  }
}

try {
  scrapeContent().then(content => {
    chrome.runtime.sendMessage(`content ${content}`);
  })
}
catch (err){
  chrome.runtime.sendMessage(`outer error ${err.message}`);
}
