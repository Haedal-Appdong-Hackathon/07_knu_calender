const express = require('express');
const app = express();

const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const fsp = require('node:fs/promises');
const path = require('path');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { spawn } = require('child_process');

const PORT = 3000;
const databaseURL = "mongodb+srv://dongsu108:dssmongoose76025509@crawling.9qzybah.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(databaseURL)
    .then(() => {
        console.log('MongoDB에 연결되었습니다');
        const dataSchema = new mongoose.Schema({
            title: String,
            category: String,
            date: Number,
            link: String
        });

        const DataModel = mongoose.model('Data', dataSchema);

        function doPython(filePath) {
            const relativePath = `./${filePath}`;
            spawn('python3', [relativePath]);
        }

        const data = ["knu_event.py", "knu_notice.py", "knu_student_notice.py", "knu_student_plan.py"];
        for (const pyfile of data) {
            cron.schedule('0 1 * * *', () => {
                try {
                    doPython(pyfile);
                    console.log(`${pyfile} is running really well`);
                } catch (error) {
                    console.error(`Error in cron job for ${pyfile}: ${error.message}`);
                }
            });
        }

        // cron 작업: 매일 새벽 2시에 실행
        // cron 작업: 매일 새벽 2시에 실행
        cron.schedule('26 4 * * *', async () => {
            console.log('Cron job이 시작되었습니다.'); // 추가된 라인

            try {
                const directoryPath = path.join(__dirname, '..', 'storage');
                const files = fs.readdirSync(directoryPath);

                console.log('파일 목록:', files); // 추가된 라인

                for (const file of files) {
                    const filePath = path.join(directoryPath, file);
                    console.log('파일 경로:', filePath); // 추가된 라인

                    const jsonData = fs.readFileSync(filePath, 'utf-8');
                    console.log('파일 내용:', jsonData); // 추가된 라인

                    const jsonObjects = jsonData.split('\n').filter(Boolean);

                    for (const jsonString of jsonObjects) {
                        console.log('JSON 문자열:', jsonString); // 추가된 라인

                        try {
                            const jsonObject = JSON.parse(jsonString);
                            console.log('파싱된 JSON 객체:', jsonObject); // 추가된 라인

                            if (await dbCheck(jsonObject, DataModel)) {
                                await DataModel.create(jsonObject);

                                const log = jsonObject.link;
                                const nameOfFile = "sendedFileList";

                                console.log(directoryPath);

                                // 파일에 ID가 있는지 확인하고, 없으면 추가
                                async function processAndWriteToFile(log, directoryPath, nameOfFile) {
                                    const filePosition = path.join(directoryPath, nameOfFile);

                                    try {
                                        // 파일이 존재하지 않으면 새로 생성
                                        await fsp.access(filePosition, fs.constants.F_OK)
                                            .then(() => console.log('파일이 이미 존재합니다.'))
                                            .catch(async () => {
                                                console.log('파일이 존재하지 않습니다. 새로 생성합니다.');
                                                await fsp.writeFile(filePosition, '');
                                            });

                                        const fileContent = await fsp.readFile(filePosition, 'utf-8');

                                        // 파일에 ID가 이미 있는 경우
                                        if (fileContent.includes(log)) {
                                            console.log(`ID(${log})가 이미 파일에 존재합니다.`);
                                        } else {
                                            // 파일에 ID가 없는 경우
                                            console.log(`ID(${log})를 파일에 추가합니다.`);
                                            await fsp.appendFile(filePosition, `${log}\n`);
                                        }
                                    } catch (error) {
                                        console.error(`파일 처리 중 오류 발생: ${error.message}`);
                                    }
                                }

                                // 서버로 데이터 전송
                                async function sendDataToServer(fe) {
                                    try {
                                        // 서버로 데이터 전송하는 코드
                                        await axios.post('http://3.38.190.145:8080/knu/receive', fe, { timeout: 5000 });
                                        console.log('데이터를 서버로 성공적으로 전송했습니다');
                                    } catch (error) {
                                        console.error('POST request error:', error);
                                    }
                                }

                                // 파일에 ID 추가
                                await processAndWriteToFile(log, directoryPath, nameOfFile); // 여기서 막혀서 더 이상 안되는 듯.

                                // 서버로 데이터 전송
                                const fe = {
                                    title: jsonObject.title,
                                    category: jsonObject.category,
                                    date: jsonObject.date,
                                    link: jsonObject.link,
                                };
                                await sendDataToServer(fe);
                            }
                        } catch (error) {
                            console.error(`Error parsing JSON: ${error.message}`);
                        }
                    }
                }
            } catch (error) {
                console.error('오류 발생:', error);
            }
            console.log('Cron job이 종료되었습니다.'); // 추가된 라인
        });


        // Express 서버 시작
        app.use(cors());

        app.listen(PORT, () => {
            console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
        });
    })
    .catch((error) => {
        console.error('MongoDB 연결 중 오류 발생:', error);
    });

// MongoDB에 데이터가 있는지 확인
async function dbCheck(data, DataModel) {
    const existingData = await DataModel.findOne({ title: data.title, date: data.date });
    return existingData == null;
}
