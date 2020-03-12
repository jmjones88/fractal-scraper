const puppeteer = require('puppeteer');
var stringify = require('csv-stringify');
const fs = require('fs');

(async () => {
  // Uncomment to enable devtools and show browser
  const browser = await puppeteer.launch(/*{headless: false, devtools: true}*/);
  const page = await browser.newPage();
  await page.goto('http://localhost:9001', {waitUntil: 'networkidle2'});
  // JS inside Chromium context
  const textItems = await page.evaluate(() => {
    let textItems = [];
    // Get all the tree selectors and main root
    let labels = document.querySelectorAll('.Navigation-group:nth-child(3) .Tree-collection');
    labels.forEach(collection => {
        // Get the label and figure out the tree depth
        let label = collection.querySelector('.Tree-collectionLabel');
        let classList = collection.classList;
        let starConcat = '';
        let starNumber = 0;
        // Based on the tree depth, add a star pattern
        // Since the Level starts out at 2, make that level 0
        const levelNormalizer = -2;
        classList.forEach(classData => {
            if(classData.includes('Tree-depth-')) {
                starNumber = parseInt(classData.split('Tree-depth-')[1]);
                for(let i=0; i < starNumber + levelNormalizer; i++) {
                    starConcat += '*';
                }
            }
        });
        let heading = label.innerText.trim();
        if(starNumber + levelNormalizer > 0) {
            heading = `${starConcat} ${label.innerText.trim()}`
        }
        textItems.push([heading]);
        // Get all nested direct children of the collection
        let items = collection.querySelectorAll(':scope > .Tree-collectionItems > .Tree-item.Tree-entity .Tree-entityLink');
        items.forEach(item => textItems.push([starConcat + '* ' + item.innerText.trim()]))
    });
    return textItems;
  });

  // Write the file to the file system
  stringify(textItems, function(err, output){
    fs.writeFile("./output.csv", output, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
  });

  // Close the browser
  await browser.close();
})();