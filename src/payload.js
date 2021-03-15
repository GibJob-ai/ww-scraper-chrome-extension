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
  
async function createFile(){
  let response = await fetch('https://kaelan.xyz/Kaelan_Resume_2020.pdf');
  let data = await response.blob();
  let metadata = {
    type: 'application/pdf'
  };
  let file = new File([data], "test.pdf", metadata);
  // ... do something with the file or return it
  return file;
}

const getUploadRequest = (id) => {
  let loadingImage = '<img src="https://orbisv4head.blob.core.windows.net/core/images/loading3_16x16.gif" />';
      var req = $.ajaxSettings.xhr();
      if (req.upload) {
            $("a#retryFile_" + id).hide();
            $("a#cancelFile_" + id).show();
            $("#uploadProgressIcon_" + id).html(loadingImage);
            $("#uploadProgress_" + id).addClass("progress-success").removeClass("progress-danger")
              .show().children(".bar").css("width", 0);
            $("#uploadProgress_" + id + " > .bar").animate({ width: 0 }, 100, "swing");
            req.upload.addEventListener('progress', function(e) {
                  if (e.lengthComputable) {
                     $("#uploadProgress_" + id + " > .bar").animate({ width: ((e.loaded / e.total) * 100) + "%" }, 100, "swing");
                  }
              });
        }
      
      
      chrome.runtime.sendMessage(`boutta req return ${req.responseText}`);
      return req;
    };


try {
  createFile().then(file => {
    let form = document.getElementById('fileUploadForm')
    let id = "docUpload";
    let dashboardPath = "/myAccount/dashboard.htm";
    var fileInput = $("#fileUpload_" + id);
    var xhr = null;
    var formData = new FormData();
    formData.append('action', $("#fileUploadAction_" + id).val());
    let uploadDirectory = "/content/documents/docuploads/";
    formData.append('uploadDirectory', uploadDirectory);
    formData.append('upload', file);

    fileInput.prop("disabled", true);
  
    // $("#uploadSize_" + id).html(getReadableFileSize(file.size));
    chrome.runtime.sendMessage(`boutta ajax`);
    $.ajax({
      type : "POST",
      url : dashboardPath,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      xhr: function() {
          xhr = getUploadRequest(id);
          chrome.runtime.sendMessage(`thing ${xhr.responseText}`);
          return xhr;
        }
      }).done(function(data) {
        let dashboardPath = "/myAccount/dashboard.htm";
        let DOC_NAME_TO_UPLOAD = "god heck i really hope this works";
        let DOC_TYPE_COVER_LETTER = 66;
        data = JSON.parse(data);
        chrome.runtime.sendMessage(`done ajax ${JSON.stringify(data)}`);
        var submitForm = {}
        chrome.runtime.sendMessage(`uuid -> docUploaded: ${data.uuid}`);
        $("#docName").val(DOC_NAME_TO_UPLOAD);
        let actionEle = $('*[name="action"]').get(0);
        chrome.runtime.sendMessage(`action: ${$(actionEle).val()}`);
        submitForm.action = $(actionEle).val();
        chrome.runtime.sendMessage(`form: ${JSON.stringify(submitForm)}`);
        submitForm.docModuleId = 5; // always hardcoded
        submitForm.docName = DOC_NAME_TO_UPLOAD;
        submitForm.docType = DOC_TYPE_COVER_LETTER;
        submitForm.docUploaded = data.uuid;
        chrome.runtime.sendMessage(`about to submit`);
        chrome.runtime.sendMessage(`form: ${JSON.stringify(submitForm)}`);
        $.ajax({
          type: "POST",
          url: "/myAccount/dashboard.htm",
          data: submitForm,
          cache: false,
          encode: true
        }).done(function(response){
          chrome.runtime.sendMessage(`final response ${response}`);
        }).fail(function(xhr, status, error) {
          chrome.runtime.sendMessage(`xhr ${JSON.stringify(xhr)}`);
          chrome.runtime.sendMessage(`status ${JSON.stringify(status)}`);
          chrome.runtime.sendMessage(`error ${JSON.stringify(error)}`);
        // error handling
        });
      });
  });
}
catch (err){
  chrome.runtime.sendMessage(`outer error ${err.message}`);
}


// TODO implement uploading the application package. Here is how you do stuff with ui elements, for example, clicking apply:

//let element = document.getElementsByClassName("applyButton")[0];
//element.click();
