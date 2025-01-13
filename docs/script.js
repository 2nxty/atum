var url = "https://hentai.host";
const id = document.getElementById('ide');
const bw = document.getElementById('bro');

function ageVerificationHide() {
  var ageVerificationModel = document.getElementById('age-verification');
  ageVerificationModel.style.display = 'none';
}
function ageVerificationShow() {
  var ageVerificationModel = document.getElementById('age-verification');
  ageVerificationModel.style.display = 'block';
}

function ageVerificationLoad() {
    try {
      var agePass = ageGetCookie(ageCookieName);
      if (agePass != "") {
        ageVerificationHide();
        return;
      }
      else {
        ageVerificationShow();
      }
    }
    catch(err) {
      ageVerificationShow();
    }
}

function ageVerificationConfirm() {
  ageVerificationHide(); play();
}

function ageVerificationFailed() {
    window.open(url, '_blank').focus();
}

/** Run the verification after DOM has been loaded **/
document.addEventListener("DOMContentLoaded", function(event) {
  ageVerificationLoad();
  getbro(); getiden();
});

function getbro() {
  if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
    bw.innerHTML = "Browser: Opera";
  } else if (navigator.userAgent.indexOf("Edg") != -1) {
    bw.innerHTML = "Browser: Edge";
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    bw.innerHTML = "Browser: Chrome";
  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    bw.innerHTML = "Browser: Safari";
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    bw.innerHTML = "Browser: Firefox";
  } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
  {
    bw.innerHTML = "Browser: IE";
  } else {
    bw.innerHTML = "";
  }
}

function getiden(){
    fetch("https://api.ipify.org?format=json")
                .then(response => response.json())
                .then(data => {
                    id.innerHTML = "IP: " + data.ip;
                })
                .catch(error => {
                    console.error("Error fetching IP address:", error);
                });
}

function play() {
        var audio = document.getElementById("audio");
        audio.play();
      }
