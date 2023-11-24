from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import datetime
import re
import json
import os

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

browser = webdriver.Chrome(options=chrome_options)
URL = 'https://www.knu.ac.kr/wbbs/wbbs/user/yearSchedule/index.action?menu_idx=43&vo.search_year='

year = datetime.datetime.now().year
browser.get(URL + str(year))
browser.maximize_window()

def extract_numbers_from_text(text):
    numbers_only = re.findall(r'\d+', text)
    return numbers_only

def toDictJson(title, date, address, c='학사일정'):
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

FILENAME = 'knu_student_plan.json'
existing_data = load_existing_data(f'./storage/{FILENAME}')

month = 1
while month < 13:
    event_num = 1
    
    while True:
        date_elements = browser.find_elements(By.CSS_SELECTOR, f"#calendar > dl:nth-child({month}) > dd > ul > li:nth-child({event_num}) > span")
        event_elements = browser.find_elements(By.CSS_SELECTOR, f"#calendar > dl:nth-child({month}) > dd > ul > li:nth-child({event_num})")

        if not date_elements or not event_elements:
            break

        for date_element, event_element in zip(date_elements, event_elements):
            date_text = date_element.text
            event_text = event_element.text

            if (event_text.find('[') != -1):
                pass
            else:
                event_text_parts = event_text.split(")")
                if len(event_text_parts) > 1:
                    desired_value = event_text_parts[1].strip()
                    new_event_text_parts = desired_value.split("(")
                    if len(new_event_text_parts) > 0:
                        new_desired_value = new_event_text_parts[0].strip()
                        date_numbers = [x for x in extract_numbers_from_text(date_text) if len(x) == 2]
                        date_number = ''.join(date_numbers)
                        if(len(date_number) < 4):
                            date_number = '0' + date_number
                        date_number = int(date_number)
                        try:
                            save_event_to_file(new_desired_value, date_number, URL + str(year), FILENAME, existing_data)
                        except ValueError as e:
                            print(str(e))
                            browser.quit()
                            break

        event_num += 1
    month += 1

browser.quit()