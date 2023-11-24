const express = require('express');
const app = express();

const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { spawn } = require('child_process');

const PORT = 3000;
const databaseURL = "mongodb+srv://dongsu108:dssmongoose76025509@crawling.9qzybah.mongodb.net/?retryWrites=true&w=majority";

// function writeFile(name, msg){
//     if(name == "") return false;	
//     var defaultpath = "C:"; // 기록하고자 하는 경로. ex) C:\\Program Files\\logs	
//     var fileObject = new ActiveXObject("Scripting.FileSystemObject");	
//     var fullpath = defaultpath+"\\"+name; 
//     // 파일이 생성되어있지 않으면 새로 만들고 기록	
//     if(!fileObject.FileExists(fullpath)){
//         var fWrite = fileObject.CreateTextFile(fullpath,false);		
//         fWrite.write(msg);		
//         fWrite.close();
//     }else
//     {		
//         var fWrite = fileObject.OpenTextFile(fullpath, 8);		
//         fWrite.write(msg);		
//         fWrite.close();	
//     }
// }

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
// ...

        cron.schedule('21 0 * * *', async () => {
            try {
                const directoryPath = path.join(__dirname, '..', 'storage');
                const files = fs.readdirSync(directoryPath);

                for (const file of files) {
                    const filePath = path.join(directoryPath, file);
                    const jsonData = fs.readFileSync(filePath, 'utf-8');
                    const jsonObjects = jsonData.split('\n').filter(Boolean);

                    for (const jsonString of jsonObjects) {
                        try {
                            const jsonObject = JSON.parse(jsonString);
                            //
                            if (await dbCheck(jsonObject, DataModel)) {
                                await DataModel.create(jsonObject);
                            }
                        } catch (error) {
                            console.error(`Error parsing JSON: ${error.message}`);
                        }
                    }
                }

                const dataFromDB = await DataModel.find();
                const dataToSend = dataFromDB.map(({ _id, __v, ...rest }) => rest);
                console.log(dataToSend);

                try {
                    for (const se of dataToSend) {
                        const fe = {
                            title: se._doc.title,
                            category: se._doc.category,
                            date: se._doc.date,
                            link: se._doc.link,
                        };
                        // writeFile(upload.js, fe);
                        console.log(fe);
                        const response = await axios.post('http://3.38.250.63:8080/knu/receive', fe);
                        console.log(response.data);
                        console.log('데이터를 서버로 성공적으로 전송했습니다');
                    }
                } catch (error) {
                    console.error('POST request error:', error);
                }

            } catch (error) {
                console.error('오류 발생:', error);
            }
        });

        // ...


        // Express 서버 시작
        app.use(cors());

        app.listen(PORT, () => {
            console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
        });
    })
    .catch((error) => {
        console.error('MongoDB 연결 중 오류 발생:', error);
    });

async function dbCheck(data, DataModel) {
    const existingData = await DataModel.findOne({ title: data.title, date:data.date});
    return existingData == null;
}
