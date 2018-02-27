/* global XMLHttpRequest, expect */
var globalVar = (typeof self !== "undefined" && self || typeof global !== "undefined" && global || typeof window !== "undefined" && window || (Function ("return this"))());
function loadBinaryResource (url, unicodeCleanUp) {
  const req = new XMLHttpRequest()
  req.open('GET', url, false)
   // XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
  req.overrideMimeType('text\/plain; charset=x-user-defined');
  req.send(null)
  if (req.status !== 200) {
    throw new Error('Unable to load file');
  }

  var responseText = req.responseText;
  var responseTextLen = req.responseText.length;
  var StringFromCharCode = String.fromCharCode;
  if (unicodeCleanUp === true) {    
    var i = 0;
    var byteArray = [];
    for (i = 0; i < responseText.length; i += 1) {
      byteArray.push(StringFromCharCode(responseText.charCodeAt(i) & 0xff))
    }
    responseText = byteArray.join("");
  }
  return responseText;
}

function sendReference (filename, data) {
  var req = new XMLHttpRequest()
  req.open('POST', 'http://localhost:9090/'+filename, true)
  req.send(data)
}

function resetFile(pdfFile) {
  pdfFile.replace(/\/CreationDate \(D:(.*?)\)/, '/CreationDate (D:19871210000000+00\'00\'\)');
  pdfFile.replace(/(\/ID \[ (<0[0-9a-fA-F]+> ){2}\])/, '/ID [ <00000000000000000000000000000000> <00000000000000000000000000000000> ]');
  pdfFile.replace(/(\/Producer \(jsPDF [1-9].[0-9].[0-9]\))/, '/Producer (jsPDF 1.0.0)');
  return pdfFile;
}
/**
 * Find a better way to set this
 * @type {Boolean}
 */
globalVar.comparePdf = function (actual, expectedFile, suite, unicodeCleanUp) {
  var  unicodeCleanUp = unicodeCleanUp || true;
  var pdf;
  var actual = 'File not loaded.';
  
  try {
    pdf = loadBinaryResource('/base/tests/' + suite + '/reference/' + expectedFile, unicodeCleanUp);
  } catch (error) {
	console.log("Error loading '/base/tests/" + suite + "/reference/" + expectedFile + "'");
    sendReference('/tests/${suite}/reference/' + expectedFile, resetFile(actual))
    pdf = actual;
  }
  var expected = resetFile(pdf).trim();
	
  actual = resetFile(actual.trim())

  console.log("expected file contains: " + expected.slice(0,20));
  console.log("actual file contains: " + actual.slice(0,20));
	
  expect(actual).toEqual(expected)
}
