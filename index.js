var tesseract = require('node-tesseract');
const fs = require('fs-extra')
const _ = require('lodash')
// Recognize text of any language in any format



let read = async (url, lang = 'vie') => {
    return new Promise((resolve, reject) => {
        tesseract.process(url, { l: lang, psm: 6 }, function (err, text) {

            if (err) {
                console.error(err);
                reject(err)
            } else {
                resolve(text)
            }
        });
    })

}
let changeName = (url) => {
    let data = fs.readFileSync((url))
    let newUrl = url.replace(/\s+|\(|\)/g, '_')
    fs.writeFileSync(newUrl, data)
    if (url !== newUrl) {
        fs.removeSync(url)
    }

    return newUrl
}
const pathName = '/Users/actiontwo/Downloads'
const driveName = 'drive'
let run = async () => {
    let datafull = []
    let datanotmath = []
    let fulltext = []
    let data = fs.readdirSync(pathName + '/' + driveName)
    for (let i = 0; i < data.length; i++) {
        let item = data[i]

        if (item !== '.DS_Store' && item != '.sa.icloud') {
            if (item) {
                let pathroot = pathName + '/' + driveName + '/' + decodeURIComponent(item)
                let folder = fs.readdirSync(pathroot)
                for (let j = 0; j < folder.length; j++) {
                    let file = changeName(pathroot + '/' + decodeURIComponent(folder[j]))
                    datafull.push(file)
                    fulltext.push(file)
                    let text = await read(file, 'eng')

                    let textsplit = text.split("\n")
                    console.log(textsplit)
                    fulltext.push(textsplit)
                    _.map(textsplit, (tx) => {
                        if (tx.match("Monster Hunt") || tx.match("Chasse au monstre") || tx.match("San Quai vat") || tx.match("Sn Quai vat")) {
                            let time = tx.match(/[01]\d\/[0-3]\d\/\d{2} [0-2]\d:[0-5]\d:[0-5]\d|[01]\d\/[0-3]\d\/\d{2} \d{0,10}.\d{0,10}|[01]\d\/[0-3]\d\/\d{2}\d{0,10}.\d{0,10}|[01]\d\/[0-3]\d\/\d{2} \d{0,10}:\d{0,10}|[01]\d\/[0-3]\d\/\d{2} \d{0,10}|[01]\d\/\d{4} \d{0,10}/gm)
                            if (time && time[0]) {
                                datafull.push(time[0])
                            }
                            else {
                                datanotmath.push(tx)
                                console.log('not match', tx)
                            }
                        }
                        if (tx.match("Defeated") || tx.match("Niv. vaincu") || tx.match("danh bai") || tx.match("anh bai") || tx.match(" bai")) {
                            let level = tx.match(/ép \d{1}|Cap \d{1}|Niv. vaincu \d{1}|Lv \d{1}|.ap \d{1}|ip\d{1}/gm)
                            if (level && level[0]) {
                                let number = level[0].match(/\d{1}/gi)
                                let filename = file.split(/\//gi)
                                let time = datafull[datafull.length - 1].split(' ');
                                let finalTime = time[0]
                                if (time.length > 1) {
                                    finalTime = time[0] + ',' + time[1]
                                }
                                datafull.push(item + "," + finalTime + ',Q' + number[0] + ',' + filename[filename.length - 1])
                            }
                            else {
                                datanotmath.push(file)
                                datanotmath.push(tx)
                                console.log('not match level ', tx)
                                datanotmath.push('end')
                            }
                        }
                    })
                    datafull.push("end")
                }
            }
        }
    }
    console.log(datafull)
    let datafullF1 = []
    _.map(datafull, (item) => {
        let data = item.match(/Q\d{1}/gm)
        if (data) {
            datafullF1.push(item)
        }
    })
    fs.writeJSONSync(__dirname + '/export/output_final.json', datafullF1)
    fs.writeJSONSync(__dirname + '/export/output.json', datafull)
    fs.writeJSONSync(__dirname + '/export/output_notmatch.json', datanotmath)
    fs.writeJSONSync(__dirname + '/export/fulltext.json', fulltext)
}


run()