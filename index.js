const puppeteer = require('puppeteer');
var stringify = require('csv-stringify');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch(/*{headless: false, devtools: true}*/);
  const page = await browser.newPage();
  await page.goto('http://localhost:9001', {waitUntil: 'networkidle2'});
  const textItems = await page.evaluate(() => {
    let textItems = [];
    let labels = document.querySelectorAll('.Navigation-group:nth-child(3) .Tree-collection');
    labels.forEach(collection => {
        debugger;
        let label = collection.querySelector('.Tree-collectionLabel');
        let classList = collection.classList;
        let starConcat = '';
        let starNumber = 0;
        classList.forEach(classData => {
            if(classData.includes('Tree-depth-')) {
                starNumber = parseInt(classData.split('Tree-depth-')[1]);
                for(let i=0; i < starNumber - 2; i++) {
                    starConcat += '*';
                }
            }
        });
        let heading = label.innerText.trim();
        if(starNumber - 2 > 0) {
            heading = `${starConcat} ${label.innerText.trim()}`
        }
        textItems.push([heading]);
        let items = collection.querySelectorAll(':scope > .Tree-collectionItems > .Tree-item.Tree-entity .Tree-entityLink');
        items.forEach(item => textItems.push([starConcat + '* ' + item.innerText.trim()]))
    });
    return textItems;
  });


  stringify(textItems, function(err, output){
    fs.writeFile("./output.csv", output, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
  });

  await browser.close();
})();