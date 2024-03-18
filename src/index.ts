const puppeteer = require('puppeteer')
let fs = require('fs');
const asyncFs = require('fs').promises;


let sitemaps = [
    {
        path: './sitemap_data/athlete/',
        url:'https://liftoracle.com/sitemap-athletes-1.xml',
    },
    {
        path: './sitemap_data/athlete/',
        url:'https://liftoracle.com/sitemap-athletes-2.xml',
    },
    {
        path: './sitemap_data/static/',
        url:'https://liftoracle.com/sitemap-static.xml',
    },
    {
        path: './sitemap_data/meet/',
        url:'https://liftoracle.com/sitemap-meets-1.xml',
    },
]


async function scrapeStatic(){
    let data = {
        path: './sitemap_data/static/',
        url:'https://liftoracle.com/sitemap-static.xml',
    }

    console.log('scraping static page')
}

async function scrapeMeets(){
    let data = {
        path: './sitemap_data/meet/',
        url:'https://liftoracle.com/sitemap-meets-1.xml',
    }

    console.log('scraping meets')
}

async function scrapeAthletes(){
    let data = {
        path: './sitemap_data/athlete/',
        urls:[
            'https://liftoracle.com/sitemap-athletes-1.xml',
            'https://liftoracle.com/sitemap-athletes-2.xml',
        ]
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width:1500, height:1000})
    await page.goto(data.urls[0], {
        waitUntil: 'networkidle0'
    })
    const page2 = await browser.newPage()
    await page2.setViewport({width:1500, height:1000})
    await page2.goto(data.urls[1], {
        waitUntil: 'networkidle0'
    })
    
    await page.screenshot({fullPage: false, path:'page.png'})

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
    
    //  console.log(allSitemapAthletes)
     console.log(`found ${allSitemapAthletes.length} athletes in the sitemap`)

    for(let i = 0; i < 4; i++){
    // for(let i = 0; i < siteMapAthletes.length; i++){
        await crawlAthletePage(allSitemapAthletes[i])
    }
   
    await browser.close()
}



//https://liftoracle.com/sitemap.xml 
async function crawlAthletePage(url:string){
    let name = url.split('athlete/')[1].replace(/['"]/g, '')
    let formattedName = name.replace(/\s+/g, '_')
    let fileName = './sitemap_data/athlete/' + formattedName + '.html';

    function writeHtml(htmlData:string, fileName:string){
        const stream = fs.createWriteStream(fileName);
        stream.once('open', ()=>{
            stream.end(htmlData);
        })
    }

    try{
        console.log('crawling specific athlete')
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({width:1500, height:1000})
        await page.goto(url, {
            waitUntil: 'networkidle0'
        })
    
        // await page.screenshot({fullPage: false, path:'athletepage.png'})
           
        const htmlContent = await page.evaluate(()=>{
            return document.documentElement.outerHTML;
        })
    
        writeHtml(htmlContent, fileName)
        await browser.close();
        
        fs.appendFileSync('./sitemap_data/athlete/success.csv', fileName + '|' + url + '\n');
        
    }catch(e){
        fs.appendFileSync('./sitemap_data/athlete/error.csv', fileName + '|' + url + '\n');
    }
}

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
    
    
}


function writeHtml(htmlData:string, url:string){
    let name = url.split('athlete/')[1].replace(/['"]/g, '')
    let formattedName = name.replace(/\s+/g, '_')
    let fileName = './sitemap_data/athlete/' + formattedName + '.html';

    const stream = fs.createWriteStream(fileName);
    
    stream.once('open', ()=>{
        stream.end(htmlData);
    })
}



//scrape meets
//scrape athletes off of 2 pages
//scrape static

run()

// what i need
// loop thru all of the sitemap files
// make the right path to write the files
