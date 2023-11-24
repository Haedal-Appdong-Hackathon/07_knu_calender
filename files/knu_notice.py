from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
import datetime
import json
import time
import os

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

browser = webdriver.Chrome(options=chrome_options)
page_num = 1
year = datetime.datetime.now().year

browser.maximize_window()

this_year = datetime.datetime.now().year

def scroll_to_end():
    body = browser.find_element(By.TAG_NAME, "body")
    body.send_keys(Keys.END)

# JSON의 기본 형태를 만들 함수.
def toDictJson(title, date, address, c='공지사항'):
    re = {"title": title, "category": c, "date": date, "link": address}
    re_json = json.dumps(re)
    return re_json

def save_to_json(data, filename):
    with open(f'./storage/{filename}', 'a') as f:
        f.write(data)
        f.write('\n')

def load_existing_data(filename):
    existing_data = []
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            for line in f:
                existing_data.append(json.loads(line.strip()))
    return existing_data

def save_event_to_file(title, date, address, filename, existing_data):
    Json = toDictJson(title, date, address)
    if Json not in existing_data:
        save_to_json(Json, filename)
    else:
        raise ValueError("Duplicated content found. Stopping the script.")

year_stopper = 0


def go_back():
    browser.execute_script("window.location.href = document.referrer;")

while year_stopper == 0:
    browser.get(f"https://www.knu.ac.kr/wbbs/wbbs/bbs/btin/list.action?bbs_cde=1&pageIndex={page_num}&popupDeco=&search_type=search_subject&search_text=&menu_idx=67")
    for _ in range(3):
        scroll_to_end()

    for x in range(1, 11):
        date_elements = WebDriverWait(browser, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, f"#btinForm > div.board_list > table > tbody > tr:nth-child({x}) > td.date"))
        )
        subject_elements = WebDriverWait(browser, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, f"#btinForm > div.board_list > table > tbody > tr:nth-child({x}) > td.subject > a"))
        )
        for date_element, subject_element in zip(date_elements, subject_elements):
            date_text = date_element.text
            date = date_text[5:7] + date_text[8:10]
            year = date_text[0:4]
            subject_text = subject_element.text

            time.sleep(1)
            subject_element.click()
            time.sleep(1)
            detail_page_url = browser.current_url
            time.sleep(2)

            try:
                FILENAME = 'knu_notice.json'
                existing_data = load_existing_data(f'./storage/{FILENAME}')
                save_event_to_file(subject_text, int(date), detail_page_url, FILENAME, existing_data)
            except ValueError as e:
                print(str(e))
                browser.quit()
                break

            go_back()
            time.sleep(3)

            if int(year) != this_year:
                year_stopper = 1

            if year_stopper == 1:
                break
    page_num += 1

browser.quit()