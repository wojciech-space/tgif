const timer = document.querySelector('#timer'),
  wrapper = document.querySelector('#wrapper'),
  versionContainer = document.querySelector('#version'),
  language = localStorage.getItem('language') || 'GB';

const getLang = (lang) => {
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

const setLang = (lang) => {
  localStorage.setItem('language', lang);
}

const calculateDiff = (start, end) => {
  return (Date.parse(end) / 1000) - (Date.parse(start) / 1000);
}

const tgif = () => {
  const now = moment(),
    nextFriday = moment().day() < 5 ?
      moment({hour: 16}).day(5) :
      moment().day() == 5 && moment().hour() < 16 ?
        moment({hour: 16}).day(5) :
        moment({hour: 16}).day(12);

  return calculateDiff(now, nextFriday);
}

const countTime = (diff) => {
  if (diff > 374400) {
    return {days: 0, hours: 0, minutes: 0, seconds: 0, remaining: 0}
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

const setVersion = () => {
  fetch('package.json')
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    versionContainer.textContent = json.version;
  });
}

document.addEventListener("DOMContentLoaded", (event) => {
  setVersion();
  getLang(language);
  
  inter = setInterval(() => {
    const {days, hours, minutes, seconds, remaining} = countTime(tgif());
    timer.textContent = `${days}:${hours > 9 ? hours : '0' + hours}:${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;

    if (remaining <= 0) {
      timer.style.color = 'green';
      clearInterval(inter);
    }
  }, 1000);

  document.querySelector('#lang').addEventListener('click', (e) => {
    if (e.target && e.target.nodeName == "SPAN") {
      setLang(e.target.classList[0].replace('flag-', ''));
      e.target.classList[0]
      const language = localStorage.getItem('language') || 'GB';
      getLang(language);
    }
  });
});
