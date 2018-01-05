const timerContainer = document.querySelector('#timing-zone'),
  questionContainer = document.querySelector('#question-zone'),
  timer = document.querySelector('#timer'),
  wrapper = document.querySelector('#wrapper'),
  versionContainer = document.querySelector('#version'),
  errorContainer = document.querySelector('#error'),
  initLanguage = localStorage.getItem('language') || 'GB';

function fInterval (fn, t) {
  let TGIFinterval = setInterval(fn, t);

  this.stop = () => {
    if (TGIFinterval) {
      clearInterval(TGIFinterval);
      TGIFinterval = null;
    }

    return this;
  }

  this.start = () => {
    if (!TGIFinterval) {
      this.stop();
      TGIFinterval = setInterval(fn, t);
    }

    return this;
  }
}

function fLanguage () {
  this.set = (lang) => {
    localStorage.setItem('language', lang);
  }

  this.get = (lang) => {
    fetch(`lang-${lang}.json`)
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      for (key in json) {
        if (key == 'title') {
          document.title = json[key];
          continue;
        }
        document.querySelector(`#${key}`).textContent = json[key];
      }
    });
  }
}

function fTGIF () {
  this.askTGIF = () => {
    timerContainer.setAttribute('class', 'hide');
    errorContainer.setAttribute('class', '');
    questionContainer.setAttribute('class', 'show');
    document.querySelector('#when-time').value = `${this.getTGIFtime().hour < 10 ? '0' + this.getTGIFtime().hour : this.getTGIFtime().hour}:${this.getTGIFtime().minute < 10 ? '0' + this.getTGIFtime().minute : this.getTGIFtime().minute}` || '';

    document.querySelector('#accept-time').addEventListener('click', this.setTGIFtime);
  }

  this.countdown = (diff, friday) => {
    if (diff > (432800 - ((24 - friday.hour) * 3600))) {
      return {days: 0, hours: 0, minutes: 0, seconds: 0, diff: 0}
    }

    let remaining = diff;
    const days = remaining / 86400 | 0;
    remaining = remaining % 86400;
    const hours = remaining / 3600 | 0;
    remaining = remaining % 3600;
    const minutes = remaining / 60 | 0;
    const seconds = remaining % 60;

    return {days, hours, minutes, seconds, diff};
  }

  this.getCurrDiff = (friday) => {
    const now = moment(),
      nextFriday = moment().day() < 5 ?
        moment(friday).day(5) :
        moment().day() == 5 && moment() < moment(friday) ?
        moment(friday).day(5) :
        moment(friday).day(12);

      return this.getDiff(now, nextFriday);
  }

  this.getDiff = (start, end) => {
    return (Date.parse(end) / 1000) - (Date.parse(start) / 1000);
  }

  this.getTGIFtime = () => {
    return JSON.parse(localStorage.getItem('time')) || {hour: 16, minute: 00};
  }

  this.setTGIFtime = () => {
    const time = document.querySelector('#when-time').value;
    this.validateInput(time)
    .then((time) => {
      localStorage.setItem('time', JSON.stringify(time));
      timerContainer.setAttribute('class', '');
      questionContainer.setAttribute('class', '');
      timer.style.color = 'red';
    })
    .catch((error) => {
      errorContainer.setAttribute('class', 'show');
    })
  }

  this.validateInput = (input) => {
    return new Promise((resolve, reject) => {
      if (input.length <= 3) {
        reject({error: true});
      } else {
        input = input.split(':');
        const hours = parseInt(input[0]),
          minutes = parseInt(input[1]);
        if (hours > 23 || hours < 0 || isNaN(hours) || minutes > 59 || minutes < 0 || isNaN(minutes)) {
          reject({error: true});
        }

        resolve({
          hour: hours,
          minute: minutes
        });
      }
    });
  }
}

function fVersion () {
  this.set = () => {
    fetch('package.json')
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      versionContainer.textContent = json.version;
    });
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  const TGIF = new fTGIF();
  const LANGUAGE = new fLanguage();
  const VERSION = new fVersion();
  VERSION.set();
  LANGUAGE.get(initLanguage);

  if (!JSON.parse(localStorage.getItem('time'))) {
    TGIF.askTGIF();
  }

  const intFunction = () => {
    const {days, hours, minutes, seconds, diff} = TGIF.countdown(TGIF.getCurrDiff(TGIF.getTGIFtime()), TGIF.getTGIFtime());
    timer.textContent = `${days}:${hours > 9 ? hours : '0' + hours}:${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;

    if (diff <= 0) {
      timer.style.color = 'green';
    }
  }

  let INTERVAL = new fInterval(intFunction, 1000);

  document.querySelector('#set-time').addEventListener('click', TGIF.askTGIF);
});

document.querySelector('#lang').addEventListener('click', (e) => {
  if (e.target) {
    const LANGUAGE = new fLanguage();

    if (e.target.nodeName === "BUTTON") {
      LANGUAGE.set(e.target.id);
    } else if (e.target.nodeName === "SPAN") {
      LANGUAGE.set(e.target.classList[0].replace('flag-', ''));
    }

    const lang = localStorage.getItem('language') || 'GB';
    LANGUAGE.get(lang);
  }
});
