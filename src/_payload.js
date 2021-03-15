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


const getReadableFileSize = (bytes) => {
    var units = ['B','kB','MB','GB'];
    var u = 0;
    while (Math.abs(bytes) >= 1000 && u < units.length - 1) {
        bytes /= 1000;
        u++;
    }
    return bytes.toFixed(2) + ' ' + units[u];
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

const saveChanges = (id, name, autoSubmit) => {
      chrome.runtime.sendMessage(`start savechanges`);
      var fileUpload = $("#fileUpload_" + id);
      chrome.runtime.sendMessage(`fileUpload ${JSON.stringify(fileUpload.val())} ${JSON.stringify(fileUpload)}`);

      $("#currentFileInfo_" + id).show();
      if (fileUpload.val() && fileUpload.data("uuid")) {
        chrome.runtime.sendMessage(`saveChanges ${$fileUpload.val()} ${fileUpload.data("uuid")}`);

        var fileName = fileUpload.data("name");
        let temp = $("input[name='" + name + "']").val();
        chrome.runtime.sendMessage(`autosub ${autoSubmit}, btnSubmit len ${$("#btnSubmit_"+id).length}`);
        if (!autoSubmit && !$("#btnSubmit_" + id).length) {
          $("#currentFileInfo_" + id).show();
            chrome.runtime.sendMessage(`showing the file`);

          $("#fileLink_" + id).html(fileName).attr("onclick", null).on("click", function() {
            buildForm({action:$("#fileDownloadAction_" + id).val(), uuid:fileUpload.data("uuid")}).submit();
          });
        }
        $("input[name='" + name + "']").val($fileUpload.data("uuid"));
      }
      if (!$("#btnSubmit_" + id).length) {
        window.setTimeout(function() {
          if (autoSubmit) {
            window.setTimeout(function() {
              $("#currentFileInfo_" + id).closest("form").submit();
            }, 4000);
          }
          }, 1250);
      } else {
        $("#btnSubmit_" + id).on("click", function() {
          if (autoSubmit) {
            window.setTimeout(function() {
              $("#currentFileInfo_" + id).closest("form").submit();
            }, 500);
          }
        });
      }
    };

const buildForm = (parameters, action, target) => {
    
    var theForm = $(document.createElement("form")).attr("method", "post").attr("action", action).attr("enctype","multipart/form-data");
    
    if (target && typeof target === "string")
    {
      theForm.attr("target", target);
    }
    else if(target && typeof target === "boolean")
    {
      theForm.attr("target", '_BLANK' + Math.random()*100000);
    }
    
    $(theForm).insertObject(parameters);
    
    theForm.append($(document.createElement("input")).attr({
      type : "hidden",
      name : "rand",
      value : Math.floor(Math.random() * 100000)
    }));
    
    $(theForm).appendTo("body");
    return theForm;
  }

try {
  createFile().then(file => {
    let form = document.getElementById('fileUploadForm')
    let id = "docUpload";
    let controllerPath = "/myAccount/dashboard.htm";
    var fileInput = $("#fileUpload_" + id);
    let dT = new DataTransfer(); // specs compliant (as of March 2018 only Chrome)
    dT.items.add(file);
    fileInput.prop("files", dT.files);
    chrome.runtime.sendMessage(`files len: ${fileInput.prop("files").length}`);
    chrome.runtime.sendMessage(`file size: ${getReadableFileSize(file.size)}`);
    // chrome.runtime.sendMessage(`file size from attr: ${null}`);
    chrome.runtime.sendMessage(`files len: ${fileInput.prop("files").length}`);
    
    // $('#fileUploadForm').submit();
    // form.append('fuck.pdf', file);
    // form.submit();
    var xhr = null;
    var format = file.name.slice(file.name.lastIndexOf(".") + 1);
    var isImage = $("#fileUploadImage_" + id).length > 0;
    var formData = new FormData();
    formData.append('action', $("#fileUploadAction_" + id).val());
    let uploadDirectory = "/content/documents/docuploads/";
    formData.append('uploadDirectory', uploadDirectory);
    formData.append('upload', file);
  
    $("#uploadSize_" + id).html(getReadableFileSize(file.size));
    chrome.runtime.sendMessage(`boutta ajax`);
    $.ajax({
      type : "POST",
      url : controllerPath,
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
        data = JSON.parse(data);
        chrome.runtime.sendMessage(`done ajax ${JSON.stringify(data)}`);
        if (data.uuid) {
          chrome.runtime.sendMessage(`fileInput: ${JSON.stringify(fileInput)} ${JSON.stringify(fileInput.prop('files'))}`);
          fileInput.data({ "uuid": data.uuid, "name": data.name });
          chrome.runtime.sendMessage(`about to save changes`);
          let autoSubmit = true;
          saveChanges(id, name, autoSubmit);
          chrome.runtime.sendMessage(`boutta delete the form handler`);
          try{
            chrome.runtime.sendMessage(`finding the form: ${JSON.stringify($._data($($("form")[0])))}`);
            chrome.runtime.sendMessage(`finding the form better: ${JSON.stringify($("form")[0])}`);
            chrome.runtime.sendMessage(`finding the current file input ${JSON.stringify($("form#fileUploadForm").find("input[type=file]"))}`);
            $("form#fileUploadForm").find("input[type=file]").formNoValidate = true;
            $("form#fileUploadForm > input").each((i) => {
              let ele = $("form#fileUploadForm > input")[i];
              chrome.runtime.sendMessage(`ele.type ${ele.type}`);
              // $(ele).attr('disabled', 'disabled');
              chrome.runtime.sendMessage(`ele. ${ele.type}`);
              chrome.runtime.sendMessage(`$(ele).prop(type) ${$(ele).prop("type")}`);
              chrome.runtime.sendMessage(`$(ele).prop(name) ${$(ele).prop("name")}`);

              // chrome.runtime.sendMessage(`${i}: validity ${JSON.stringify(ele.validity)} required ${$("form#fileUploadForm > input")[i].required} formNoValidate ${$("form#fileUploadForm > input")[i].formNoValidate}`);
              // if 
              // $("form#fileUploadForm > input")[i].required = false;
              // $("form#fileUploadForm > input")[i].formNoValidate = true;
              // chrome.runtime.sendMessage(`${i}: validity ${JSON.stringify($("form#fileUploadForm > input")[i].validity)} required ${$("form#fileUploadForm > input")[i].required} formNoValidate ${$("form#fileUploadForm > input")[i].formNoValidate}`);
              // chrome.runtime.sendMessage(`${i}: validity ${JSON.stringify($("form#fileUploadForm > input")[i].prop("validity)} required ${$("form#fileUploadForm > input")[i].required} formNoValidate ${$("form#fileUploadForm > input")[i].formNoValidate}`);
            });
            chrome.runtime.sendMessage(`finding the current file input after delete ${JSON.stringify($("form#fileUploadForm").find("input[type=file]"))}`);
            // formData.submit();
            
            // $._data($($("form")[0]).get(0), "events").submit[1].handler = (e) => {console.log(e); return true;};
            // chrome.runtime.sendMessage(`deleted: ${JSON.stringify($._data($($("form")[0]).get(0), "events").submit[1].handler)}`);
          }
          catch(err){
            chrome.runtime.sendMessage(`failed 2 delete: ${err.message}`);
          }
        } else if (data.message) {
          chrome.runtime.sendMessage(`no uuid?? message: ${data.message}`);
          chrome.runtime.sendMessage(`uuid: ${data.uuid}`);
          console.log('hahaha nobody can see this anyway');
        }
      }).fail(function(jqXHR, textStatus, errorThrown ) {
              chrome.runtime.sendMessage(`heck ${textStatus} ${errorThrown.message}`);
      }).then(() => {
        try{
          chrome.runtime.sendMessage(`trying to submit`);
          // $('form#fileUploadForm').submit();
            window.setTimeout(function() {
              $('form#fileUploadForm').submit();
            }, 4000);
        }
        catch (err){
          chrome.runtime.sendMessage(`sub fail ${err.message}`);
        }
      });

      // $fileInput.remove();
      // $("#fileUpload_" + id).remove();
        // $('#fileUploadForm').submit();
  });
  
    // scrapeContent().then(content => {
      // chrome.runtime.sendMessage(`content ${content}`);
    // });
  // });
}
catch (err){
  chrome.runtime.sendMessage(`outer error ${err.message}`);
}


// TODO implement uploading the application package. Here is how you do stuff with ui elements, for example, clicking apply:

//let element = document.getElementsByClassName("applyButton")[0];
//element.click();
