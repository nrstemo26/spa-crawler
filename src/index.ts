import { create } from "domain";

const puppeteer = require('puppeteer')
let fs = require('fs');
let fsPromise = require('fs').promises;

//https://liftoracle.com/sitemap.xml 
// let sitemaps = [
//     {
//         path: './sitemap_data/athlete/',
//         url:'https://liftoracle.com/sitemap-athletes-1.xml',
//     },
//     {
//         path: './sitemap_data/athlete/',
//         url:'https://liftoracle.com/sitemap-athletes-2.xml',
//     },
//     {
//         path: './sitemap_data/static/',
//         url:'https://liftoracle.com/sitemap-static.xml',
//     },
//     {
//         path: './sitemap_data/meet/',
//         url:'https://liftoracle.com/sitemap-meets-1.xml',
//     },
//  ]




//utilities

function writeHtml(htmlData:string, fileName:string){
    const stream = fs.createWriteStream(fileName);
    stream.once('open', ()=>{
        stream.end(htmlData);
    })
}

async function createFileStructure(folderName:string ){
    let path = './sitemap_data/' + folderName;
    
    await fsPromise.mkdir(path, {recursive:true});
    await fsPromise.mkdir(path +'/log', {recursive: true});
    await fsPromise.writeFile(path + '/log/success.csv', 'path| url\n');
    await fsPromise.writeFile(path + '/log/error.csv', 'path| url\n');
}





async function scrapeMeets(){
    // let path = './sitemap_data/meet/';
    let url ='https://liftoracle.com/sitemap-meets-1.xml';

    console.log('scraping meets')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width:1500, height:1000})
    await page.goto(url, {
    waitUntil: 'networkidle0'
    })

    
    let siteMapMeets = await page.evaluate(()=>{
    let selector = "url loc"
    let elArr: any = Array.from(document.querySelectorAll(`${selector}`))
    elArr = elArr.map((x:any)=>{
        let el = x.textContent
        return el;
    })
    return elArr
    })
    
    console.log(`found ${siteMapMeets.length} meets in the sitemap`)
    await browser.close()

    await createFileStructure('meet')

    for(let i = 0; i < 4; i++){
    // for(let i = 0; i < siteMapMeets.length; i++){
        await crawlMeetPage(siteMapMeets[i])
    }
    console.log('crawled all meet pages');

}

async function crawlMeetPage(url:string){
    let name = url.split('meet/')[1].replace(/['"]/g, '')
    let formattedName = name.replace(/\s+/g, '_')
    let fileName = './sitemap_data/meet/' + formattedName + '.html';

    try{

        // console.log('crawling meet page: ' + url)
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({width:1500, height:1000})
        await page.goto(url, {
            waitUntil: 'networkidle0'
        })
               
        const htmlContent = await page.evaluate(()=>{
            return document.documentElement.outerHTML;
        })
    
        writeHtml(htmlContent, fileName)
        await browser.close();
        
        fs.appendFileSync('./sitemap_data/meet/log/success.csv', fileName + '|' + url + '\n');
    }catch(e){
        fs.appendFileSync('./sitemap_data/meet/log/error.csv', fileName + '|' + url + '\n');
    }
}


async function scrapeAthletes(){
    let urls = [
            'https://liftoracle.com/sitemap-athletes-1.xml',
            'https://liftoracle.com/sitemap-athletes-2.xml'
        ];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width:1500, height:1000})
    await page.goto(urls[0], {
        waitUntil: 'networkidle0'
    })
    const page2 = await browser.newPage()
    await page2.setViewport({width:1500, height:1000})
    await page2.goto(urls[1], {
        waitUntil: 'networkidle0'
    })
    
    
    let siteMapAthletes1 = await page.evaluate(()=>{
        let selector = "url loc"
        let elArr: any = Array.from(document.querySelectorAll(`${selector}`))
        elArr = elArr.map((x:any)=>{
            let el = x.textContent
            return el;
        })
        return elArr
    })
    let siteMapAthletes2 = await page2.evaluate(()=>{
        let selector = "url loc"
        let elArr: any = Array.from(document.querySelectorAll(`${selector}`))
        elArr = elArr.map((x:any)=>{
            let el = x.textContent
            return el;
        })
        return elArr
    })

    const allSitemapAthletes = [...siteMapAthletes1,...siteMapAthletes2];
    
    console.log(`found ${allSitemapAthletes.length} athletes in the sitemap`)
    await browser.close()


    await createFileStructure('athlete')

    for(let i = 0; i < 4; i++){
    // for(let i = 0; i < siteMapAthletes.length; i++){
        await crawlAthletePage(allSitemapAthletes[i])
    }
    console.log('crawled all athlete pages');

}


async function scrapeStatic(){
    const url = 'https://liftoracle.com/sitemap-static.xml';
    console.log('scraping static page')

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width:1500, height:1000})
    await page.goto(url, {
        waitUntil: 'networkidle0'
    })


    let staticPages = await page.evaluate(()=>{
        let selector = "url loc"
        let elArr: any = Array.from(document.querySelectorAll(`${selector}`))
        elArr = elArr.map((x:any)=>{
            let el = x.textContent
            return el;
        })
        return elArr
    })

    await browser.close();

    //make file structure
    await createFileStructure('static')

    //loop thru static pages and crawl each page
    for(let i = 0; i< staticPages.length; i++){
        await crawlStaticPage(staticPages[i]);
    }

    console.log('crawled all static pages')
}

async function crawlStaticPage(url:string){
    let name = url.split('.com/')[1].replace(/['"]/g, '')
    if(name.length == 0) name = 'home';

    let fileName = './sitemap_data/static/' + name + '.html';

    function writeHtml(htmlData:string, fileName:string){
        const stream = fs.createWriteStream(fileName);
        stream.once('open', ()=>{
            stream.end(htmlData);
        })
    }

    try{
        // console.log('crawling static page: ' + url)
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({width:1500, height:1000})
        await page.goto(url, {
            waitUntil: 'networkidle0'
        })
    
      
        const htmlContent = await page.evaluate(()=>{
            return document.documentElement.outerHTML;
        })
    
        writeHtml(htmlContent, fileName)
        await browser.close();
        
        //if log file exists
        fs.appendFileSync('./sitemap_data/static/log/success.csv', fileName + '|' + url + '\n');
        //else make the log file

    }catch(e){
        fs.appendFileSync('./sitemap_data/static/log/error.csv', fileName + '|' + url + '\n');
    }
}


async function crawlAthletePage(url:string){
    let name = url.split('athlete/')[1].replace(/['"]/g, '')
    let formattedName = name.replace(/\s+/g, '_')
    let fileName = './sitemap_data/athlete/' + formattedName + '.html';


    try{
        // console.log('crawling athlete: ' + url)
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({width:1500, height:1000})
        await page.goto(url, {
            waitUntil: 'networkidle0'
        })
           
        const htmlContent = await page.evaluate(()=>{
            return document.documentElement.outerHTML;
        })
    
        writeHtml(htmlContent, fileName)
        await browser.close();
        
        fs.appendFileSync('./sitemap_data/athlete/log/success.csv', fileName + '|' + url + '\n');
        
    }catch(e){
        fs.appendFileSync('./sitemap_data/athlete/log/error.csv', fileName + '|' + url + '\n');
    }
}

//utility function from earlier in the scrape
async function getSitemapPages():Promise<string[]>{
    console.log('running sitmap crawler');
    let url:string = 'https://liftoracle.com/sitemap.xml';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width:1500, height:1000})
    await page.goto(url, {
        waitUntil: 'networkidle0'
    })

    let siteMapPages = await page.evaluate(()=>{
        let selector = "sitemap loc"
        let elArr: any = Array.from(document.querySelectorAll(`${selector}`))
        elArr = elArr.map((x:any)=>{
            let el = x.textContent
            return el;
        })
        return elArr
    })
     
    await browser.close()
    return siteMapPages;
}



async function run(): Promise<void>{
    console.log('running sitmap crawler');

    await scrapeAthletes();
    await scrapeMeets();
    await scrapeStatic();
    
    console.log('finished crawl')
}



run()
