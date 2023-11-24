from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
import datetime
import json
import time
import os

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

browser = webdriver.Chrome(options=chrome_options)

def scroll_to_end():
    body = browser.find_element(By.TAG_NAME, "body")
    body.send_keys(Keys.END)

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

FILENAME = 'knu_student_notice.json'
existing_data = load_existing_data(f'./storage/{FILENAME}')

# JSON의 기본 형태를 만들 함수.
def toDictJson(title, date, address, c='공지사항'):
    re = {"title": title, "category": c, "date": date, "link": address}
    re_json = json.dumps(re)
    return re_json

def save_event_to_file(title, date, address, existing_data):
    Json = toDictJson(title, date, address)
    if Json not in existing_data:
        save_to_json(Json, FILENAME)
    else:
        raise ValueError("Duplicated content found. Stopping the script.")

def notice_cnt():
    browser.get("https://www.knu.ac.kr/wbbs/wbbs/bbs/btin/stdList.action?bbs_cde=&page=1&pageIndex=1&popupDeco=&search_type=search_subject&search_text=&menu_idx=42")
    notice_count = 0
    for a in range(1, 25):
        num_elements = browser.find_elements(By.CSS_SELECTOR, f"#btinForm > div > table > tbody > tr:nth-child({a}) > td.num")
        num_text = ""
        for num_element in num_elements:
            num_text = num_element.text
        if len(num_text) < 3:
            notice_count += 1
        else:
            break
    return notice_count + 1

start_pin = notice_cnt()
year_stopper = 0
page_num = 1

while True:
    browser.get(f"https://www.knu.ac.kr/wbbs/wbbs/bbs/btin/stdList.action?bbs_cde=&page={page_num}&pageIndex={page_num}&popupDeco=&search_type=search_subject&search_text=&menu_idx=42")
    for _ in range(3):
        scroll_to_end()

    for a in range(start_pin, 22):
        try:
            date_element = WebDriverWait(browser, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, f"#btinForm > div > table > tbody > tr:nth-child({a}) > td.date")))
            subject_element = WebDriverWait(browser, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, f"#btinForm > div > table > tbody > tr:nth-child({a}) > td.subject > a")))
        except TimeoutException:
            print("Timeout waiting for elements. Possibly reached the end of the list.")
            break

        date_text = date_element.text
        date = date_text[5:7] + date_text[8:10]
        year = date_text[0:4]
        subject_text = subject_element.text
        subject_link = subject_element.get_attribute("href")

        subject_element.click()
        detail_page_url = browser.current_url
        try:
            save_event_to_file(subject_text, int(date), detail_page_url, existing_data)
        except ValueError as e:
            print(str(e))
            browser.quit()
            break

        browser.back()

        if int(year) != datetime.datetime.now().year:
            year_stopper = 1

    if year_stopper == 1:
        break

    page_num += 1
    time.sleep(3)

browser.quit()