'use strict';
const levelCode = { CE: 0, B: 0.1, BA: 0.25, A: 0.5, AE: 0.75, E: 0.9 };

function getHardSkills(allFields, person) {
    return allFields.reduce(
        (newArray, singleLine) => {
            const { type, skill } = singleLine;
            if (type.toLowerCase() === 'hard') {
                let value = 0;
                if (person) {
                    value = levelCode[singleLine[person]
                        .trim()
                        .split('/')[0]] ||
                        0;
                }
                console.log(skill, singleLine);
                return newArray.concat({ axis: skill, value });
            }
            return newArray;
        },
        []
    );
}

function getSoftSkills(allFields, person) {
    return allFields.reduce(
        (newArray, singleLine) => {
            const { type, skill } = singleLine;
            if (type.toLowerCase() === 'soft') {
                let value = 0;
                if (person) {
                    value = Number(singleLine[person].split('/')[0] / 5);
                }
                return newArray.concat({ axis: skill, value });
            }
            return newArray;
        },
        []
    );
}

function initSelect(surnames, wholeData, keysObject) {
    console.log(keysObject);
    document.querySelector('.select-holder').innerHTML = `
    <select name="user">
      <option value="-">-</option>
      ${surnames.map(singleSurname => {
        return `<option value="${singleSurname}">${keysObject[singleSurname]}</option>`;
    })}
    </select>
  `;

    document
        .querySelector('select[name="user"]')
        .addEventListener('change', function(event) {
            const value = event.target.value;
            if (value) {
                if (value === 'all') {
                    loadAll();
                } else {
                    drawSpider('#chart', '#body', [ 'hard skills' ], [
                        getHardSkills(wholeData, value)
                    ]);
                    drawSpider('#chart2', '#body2', [ 'soft skills' ], [
                        getSoftSkills(wholeData, value)
                    ]);
                }
            }
        });
}

function loadAll(surnames, wholeData) {
    drawSpider(
        '#chart',
        '#body',
        surnames,
        surnames.map(singleSurname => getHardSkills(wholeData, singleSurname))
    );
    drawSpider(
        '#chart2',
        '#body2',
        surnames,
        surnames.map(singleSurname => getSoftSkills(wholeData, singleSurname))
    );
}

function getProp(prop, value) {
    return obj => {
        return obj[prop] === value;
    };
}

var request = new XMLHttpRequest();
request.open(
    'GET',
    'http://192.241.145.243:4444/gettable' + location.search,
    true
);

request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        const wholeData = JSON.parse(request.responseText);
        const infoObject = wholeData.find(getProp('type', 'info'));
        const keysObject = wholeData.find(getProp('type', 'keys'));
        const surnames = [];
        for (let key in infoObject) {
            if (infoObject[key] === 'name') {
                surnames.push(key);
            }
        }
        initSelect(surnames, wholeData, keysObject);
        loadAll(surnames, wholeData, keysObject);
    }
};
request.send();
