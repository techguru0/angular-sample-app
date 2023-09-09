const fs = require('fs');
const fsPromises = require('fs').promises;

const db = require("../../db/connection");
const config = require('../../config/config.json')[process.env.NODE_ENV || 'dev'];
const routing = require('./routing');

const dataConfig = config.dataConfig;
const dataExport = config.dataExport;

const writeFile = async (file, content) => {
  return fsPromises.writeFile(await file, await JSON.stringify(content, null, 4))
}

async function writeItems(param, data) {
  try {
    await writeFile(dataExport + param.file, data)
  } catch (err) {
    console.log('Error on writeItems -> { ' + err + ' }')
  }
  return true;
}

async function exportItems(param) {
  try {
    const results = await routing.exportItems(db, param);
    if (results != null) {
      await writeItems(param, results);
    }
    return true;
  }
  catch (err) {
    console.log('- Error on Execute routing.createItem ' + ' -> ' + err);
    return null;
  }
};

async function executeExport() {
  return new Promise(function (resolve, reject) {
    const args = process.argv.slice(2);
    const arg = args[0];
    const endpoint = arg.substring(11, arg.length);
    const file = dataConfig + endpoint + '.json';
    console.log('- Reading JSON Config File -> ' + '{ ' + file + ' }');
    fs.readFile(file, 'utf8', function (err, record) {
      if (err) {
        console.log('- Error on executeExport -> ');
        console.log('- Error Message { ' + err + ' }');
        return false;
      } else {
        const param = JSON.parse(record);
        exportItems(param)
          .then((res) => {
            console.log('- Export finished -> { ' + param.caption + ' }');
            process.exit();
          }).catch((err) => {
            console.log('err' + err);
            console.log('- Export failed -> { ' + param.caption + ' }');
            process.exit();
          });
      }
    });
  })
};

executeExport();