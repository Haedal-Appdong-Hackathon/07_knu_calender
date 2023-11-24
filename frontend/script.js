let date = new Date();
let currYear = date.getFullYear(),
  currMonth = date.getMonth();
const currentDate = document.querySelector('.current-date');
const daysTag = document.querySelector('.days');
const listTag = document.querySelector('.days li.smallL');
const listWindow = document.querySelector('.listL');
const listWindow2 = document.querySelector('.buttonWindow');
const prevNextIcon = document.querySelectorAll('.nav button');
const margin = document.querySelectorAll('.days li');
const list = document.getElementById('list_add_feed');
const buttonCloseList = document.getElementById('close_list');
let buttonActive = 0; //1: 행사, 2: 특강, 3: 학사일정
let colorNum = 0;
let globalliTag = '';
let globalbutTag = '';
let array1 = []; //행사 데이터
let array2 = []; //공지 데이터
let array3 = []; //학사일정 데이터
let listNum = [];

const months = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

//달력 시각화
const renderCalendar = () => {
  let weekEnd = -1;
  let weekEndList = [];
  let weekEndList2 = [];

  currentDate.innerHTML = `${months[currMonth]} ${currYear}`;
  let lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate();
  let firstDayofMonth = new Date(currYear, currMonth, 1).getDay();
  let lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay();
  let lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
  let liTag = '';

  for (let i = firstDayofMonth; i > 0; i--) {
    liTag += `<li class = "inactive">${lastDateofLastMonth - i + 1}</li>`;
    weekEnd++;
  }

  for (let i = 1; i <= lastDateofMonth; i++) {
    liTag += `<li id = "${i}" onclick="listClick(this);">${i}
        <ul>
        <li class = "smallL" id = "${i}-1"></li>
        <li class = "smallL" id = "${i}-2"></li>
        <li class = "smallL" id = "${i}-3"></li>
        </ul>
        </li>`;
    weekEnd++;

    if (weekEnd % 7 == 0) {
      weekEndList.push(i);
    } else if (weekEnd % 7 == 6) {
      weekEndList2.push(i);
    }
  }

  for (let i = lastDayofMonth; i < 6; i++) {
    liTag += `<li class = "inactive">${i - lastDayofMonth + 1}</li>`;
  }
  daysTag.innerHTML = liTag;

  for (let i = 0; i < weekEndList.length; i++) {
    let weekEndTag = document.getElementById(`${weekEndList[i]}`);
    weekEndTag.style.color = 'red';
  }

  for (let i = 0; i < weekEndList2.length; i++) {
    let weekEndTag = document.getElementById(`${weekEndList2[i]}`);
    weekEndTag.style.color = 'blue';
  }
  colorNum = 0;
  listNumInit();
};

//DataBase에서 값 불러오기
function getAllData() {
  getData('행사');
  getData('공지사항');
  getData('학사일정');
}

//버튼 클릭시
prevNextIcon.forEach((icon) => {
  icon.addEventListener('click', () => {
    currMonth = icon.id === 'prev' ? currMonth - 1 : currMonth + 1;
    if (currMonth < 0 || currMonth > 11) {
      date = new Date(currYear, currMonth);
      currYear = date.getFullYear();
      currMonth = date.getMonth();
    } else {
      date = new Date();
    }
    renderCalendar();
    if (buttonActive == 3) {
      create_pTag3();
    } else if (buttonActive == 1) {
      create_pTag();
    } else {
      create_pTag2();
    }
  });
});

//달력에서 일자 클릭
function listClick(elem) {
  list.style.display = 'flex';
  globalliTag = '';
  globalbutTag = '';
  let dayClicked = elem.id;
  let emptyCheck = 0;

  if (buttonActive == 1) {
    //행사인 경우
    for (let i = 0; i < array1.length; i++) {
      let dateTemp2 = array1[i]['date'];
      let monthTemp2 = Math.trunc(dateTemp2 / 100);
      let dayTemp2 = dateTemp2 % 100;

      if (currMonth + 1 == monthTemp2 && dayClicked == dayTemp2) {
        addList(array1[i]['title'], array1[i]['link']);
        emptyCheck = 1;
      }
    }
  } else if (buttonActive == 2) {
    //특강인 경우
    for (let i = 0; i < array2.length; i++) {
      let dateTemp2 = array2[i]['date'];
      let monthTemp2 = Math.trunc(dateTemp2 / 100);
      let dayTemp2 = dateTemp2 % 100;

      if (currMonth + 1 == monthTemp2 && dayClicked == dayTemp2) {
        addList(array2[i]['title'], array2[i]['link']);
        emptyCheck = 1;
      }
    }
  } else {
    //학사일정인 경우
    for (let i = 0; i < array3.length; i++) {
      let dateTemp2 = array3[i]['date'];
      let monthTemp2 = Math.trunc(dateTemp2 / 100);
      let dayTemp2 = dateTemp2 % 100;

      if (currMonth + 1 == monthTemp2 && dayClicked == dayTemp2) {
        addList(array3[i]['title'], array3[i]['link']);
        emptyCheck = 1;
      }
    }
  }

  if (!emptyCheck) {
    addList('예정된 이벤트가 없습니다', '');
  }
}

//리스트 창 닫을 때
buttonCloseList.addEventListener('click', (e) => {
  list.style.display = 'none';
});

function clear() {
  //모든 p태그 삭제
  var paragraphs = document.querySelectorAll('p');
  paragraphs.forEach(function (paragraph) {
    paragraph.remove();
    colorNum = 0;
  });
}

//행사 버튼 클릭시
function create_pTag() {
  clear();
  clearLI();
  listNumInit();

  for (let i = 0; i < array1.length; i++) {
    let dateTemp = array1[i]['date'];
    let monthTemp = Math.trunc(dateTemp / 100);
    let dayTemp = dateTemp % 100;

    if (monthTemp == currMonth + 1) {
      if (listNum[dayTemp - 1] < 3) {
        addText(dayTemp, dayTemp, array1[i]['title'], listNum[dayTemp - 1]);
      }
      listNum[dayTemp - 1] += 1;

      if (listNum[dayTemp - 1] > 3) {
        addText(dayTemp, dayTemp, '...', 3);
      }
    }
  }
  buttonActive = 1;
}

//공지 버튼 클릭시
function create_pTag2() {
  clear();
  clearLI();
  listNumInit();

  for (let i = 0; i < array2.length; i++) {
    let dateTemp = array2[i]['date'];
    let monthTemp = Math.trunc(dateTemp / 100);
    let dayTemp = dateTemp % 100;

    if (monthTemp == currMonth + 1) {
      if (listNum[dayTemp - 1] < 3) {
        addText(dayTemp, dayTemp, array2[i]['title'], listNum[dayTemp - 1]);
      }
      listNum[dayTemp - 1] += 1;

      if (listNum[dayTemp - 1] > 3) {
        addText(dayTemp, dayTemp, '...', 3);
      }
    }
  }
  buttonActive = 2;
}

//학사 버튼 클릭시
function create_pTag3() {
  clear();
  clearLI();
  listNumInit();

  for (let i = 0; i < array3.length; i++) {
    let dateTemp = array3[i]['date'];
    let monthTemp = Math.trunc(dateTemp / 100);
    let dayTemp = dateTemp % 100;

    if (monthTemp == currMonth + 1) {
      if (listNum[dayTemp - 1] < 3) {
        if (array3[i]['title'] == '기말고사 기간') {
          addText(
            dayTemp,
            dayTemp + 6,
            array3[i]['title'],
            listNum[dayTemp - 1]
          );
        } else if (array3[i]['title'] == '보강 기간') {
          addText(
            dayTemp,
            dayTemp + 6,
            array3[i]['title'],
            listNum[dayTemp - 1]
          );
        }else if (array3[i]['title'] == '중간고사 기간') {
            addText(
              dayTemp,
              dayTemp + 4,
              array3[i]['title'],
              listNum[dayTemp - 1]
            );
        } else {
          addText(dayTemp, dayTemp, array3[i]['title'], listNum[dayTemp - 1]);
        }
      }
      listNum[dayTemp - 1] += 1;

      if (listNum[dayTemp - 1] > 3) {
        addText(dayTemp, dayTemp, '...', 3);
      }
    }
  }
  buttonActive = 3;
}

//달력에 이벤트 추가
function addText(start, end, name, num) {
  let p = document.createElement('p');
  let li = document.getElementById(`${start}-${num}`);
  p.textContent = name;
  li.appendChild(p);
  colorLI(start, end, num);
}

//새로운 창에 리스트 추가
function addList(content, link) {
  globalliTag += `<li class = "listL2">
  <p id = "list-content">${content}</p>
  </li>`;
  globalbutTag += `<button class = linkButton onclick="window.open('${link}', '_blank')">링크</button>`;

  listWindow.innerHTML = globalliTag;
  listWindow2.innerHTML = globalbutTag;
}

//달력 리스트에 색깔 입히기
function colorLI(start, end, num) {
  let color = '';
  switch (colorNum) {
    case 0:
      color = '#F3B0C3';
      break;
    case 1:
      color = '#FFC8A2';
      break;
    case 2:
      color = '#F5DDAD';
      break;
    case 3:
      color = '#ECD5E3';
      break;
    case 4:
      color = '#ABDEE6';
      break;
    case 5:
      color = '#C9DECF';
      break;
    case 6:
      color = '#6ECEDA';
      break;
    case 7:
      color = '#CCD1FF';
      break;
  }
  for (let i = start; i <= end; i++) {
    let li = document.getElementById(`${i}-${num}`);
    li.style.backgroundColor = color;
  }
  colorNum++;
  colorNum = colorNum % 8;
}

//List 초기화
function clearLI() {
  for (let i = 1; i <= 30; i++) {
    let li = document.getElementById(`${i}-1`);
    li.style.backgroundColor = '';
    let li2 = document.getElementById(`${i}-2`);
    li2.style.backgroundColor = '';
    let li3 = document.getElementById(`${i}-3`);
    li3.style.backgroundColor = '';
  }
  if (new Date(currYear, currMonth + 1, 0).getDate() == 31) {
    let li = document.getElementById(`31-1`);
    li.style.backgroundColor = '';
    let li2 = document.getElementById(`31-2`);
    li2.style.backgroundColor = '';
    let li3 = document.getElementById(`31-3`);
    li3.style.backgroundColor = '';
  }
}

//연관 검색창
function printName(event) {
  if (event.keyCode === 13) {
    // Enter 키가 눌렸을 때 버튼 클릭 함수 호출
    handleButtonClick();
  } else {
    similar_title();
    box_clear();
    for (var i = 0; i < similar_array.length; i++) {
      let p = document.createElement('p');
      let li = document.getElementById('suggestion_box');
      const bar = document.getElementById('suggestion_box');
      bar.style.visibility = 'visible';
      p.className = 'sub';
      p.textContent = similar_array[i];
      li.appendChild(p);
      p.onmousedown = function () {
        search_title_2(p);
      };
      p.addEventListener('mouseover', function () {
        // 마우스를 올릴 때 호출되는 함수
        // 색상을 변경하는 코드
        this.style.backgroundColor = '#f2f2f2';
      });

      p.addEventListener('mouseout', function () {
        // 마우스를 뺄 때 호출되는 함수
        // 원래 색인 검은색으로 변경
        this.style.backgroundColor = 'white';
      });
    }
  }
}

//연관 검색어 찾기
function similar_title() {
  similar_array = [];
  let input = document.getElementById('search').value;
  if (input == '') {
    return;
  }
  for (var i = 0; i < array1.length; i++) {
    if (array1[i]['title'].includes(input)) {
      similar_array.push(array1[i]['title']);
    }
  }
  for (var i = 0; i < array2.length; i++) {
    if (array2[i]['title'].includes(input)) {
      similar_array.push(array2[i]['title']);
    }
  }
  for (var i = 0; i < array3.length; i++) {
    if (array3[i]['title'].includes(input)) {
      similar_array.push(array3[i]['title']);
    }
  }
}
//p태그 삭제
function box_clear() {
  // 특정 div 태그 가져오기
  var targetDiv = document.getElementById('suggestion_box');

  // p 태그 모두 가져오기
  var pTags = targetDiv.getElementsByTagName('p');

  // p 태그 모두 제거
  while (pTags.length > 0) {
    targetDiv.removeChild(pTags[0]);
  }
}

function blur_name() {
  const bar = document.getElementById('suggestion_box');
  bar.style.visibility = 'hidden';
}

//Database에서 값을 불러오는 함수
function getData(category) {
  // API 엔드포인트
  const apiUrl = 'http://3.38.190.145:8080/knu/getByCategory';
  const url = category ? `${apiUrl}?category=${category}` : apiUrl;
  // category가 주어지지 않으면 기본적으로 전체 데이터를 가져오도록 설정
  let array = [];

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(`Data from server for category '${category}':`, data);

      if (category == '행사') {
        array1.push(...data);
      } else if (category == '공지사항') {
        array2.push(...data);
      } else {
        array3.push(...data);
      }
    })
    .catch((error) => {
      console.error('Error fetching data from server:', error);
    });
}

//listNum 초기화 함수
function listNumInit() {
  listNum = [];
  for (let i = 0; i < 31; i++) {
    listNum.push(1);
  }
}

function search_title() {
  list.style.display = 'flex';
  globalliTag = '';
  globalbutTag = '';
  let input = document.getElementById('search').value;

  for (var i = 0; i < array1.length; i++) {
    if (array1[i]['title'].includes(input)) {
      addList(
        `${array1[i]['title']} - 날짜 : ${array1[i]['date']}`,
        array1[i]['link']
      );
    }
  }
  for (var i = 0; i < array2.length; i++) {
    if (array2[i]['title'].includes(input)) {
      addList(
        `${array2[i]['title']} - 날짜 : ${array2[i]['date']}`,
        array2[i]['link']
      );
    }
  }
  for (var i = 0; i < array3.length; i++) {
    if (array3[i]['title'].includes(input)) {
      addList(
        `${array3[i]['title']} - 날짜 : ${array3[i]['date']}`,
        array3[i]['link']
      );
    }
  }

  if (globalliTag == '') {
    addList('연관 이벤트를 찾을 수 없습니다', '');
  }
}

function search_title_2(input) {
  list.style.display = 'flex';
  globalliTag = '';
  globalbutTag = '';

  for (var i = 0; i < array1.length; i++) {
    if (array1[i]['title'].includes(input.textContent)) {
      addList(
        `${array1[i]['title']} - 날짜 : ${array1[i]['date']}`,
        array1[i]['link']
      );
    }
  }
  for (var i = 0; i < array2.length; i++) {
    if (array2[i]['title'].includes(input.textContent)) {
      addList(
        `${array2[i]['title']} - 날짜 : ${array2[i]['date']}`,
        array2[i]['link']
      );
    }
  }
  for (var i = 0; i < array3.length; i++) {
    if (array3[i]['title'].includes(input.textContent)) {
      addList(
        `${array3[i]['title']} - 날짜 : ${array3[i]['date']}`,
        array3[i]['link']
      );
    }
  }

  // if (globalliTag == '') {
  //   addList('연관 이벤트를 찾을 수 없습니다', '');
  // }
}

function handleButtonClick() {
  blur_name();
  search_title();
}

getAllData();
renderCalendar();
create_pTag3();
