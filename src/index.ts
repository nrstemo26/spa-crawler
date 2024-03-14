const puppeteer = require('puppeteer')
let fs = require('fs');

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

//https://liftoracle.com/sitemap.xml 
async function crawlAthletePage(url:string){
    try{
        console.log('crawling specific athlete')
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setViewport({width:1500, height:1000})
        await page.goto(url, {
            waitUntil: 'networkidle0'
        })
    
        await page.screenshot({fullPage: false, path:'athletepage.png'})
           
        const htmlContent = await page.evaluate(()=>{
            return document.documentElement.outerHTML;
        })
    
        writeHtml(htmlContent, url)
        await browser.close();
        fs.appendFileSync('./sitemap_data/athlete/success.log', url + '\n');
        
    }catch(e){
        fs.appendFileSync('./sitemap_data/athlete/error.log', url + '\n');
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
    let path: string = './sitemap_data/athlete/'
    let url:string = 'https://liftoracle.com/sitemap-athletes-1.xml';
    //go to url and then pop off

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width:1500, height:1000})
    await page.goto(url, {
        waitUntil: 'networkidle0'
    })

    await page.screenshot({fullPage: false, path:'page.png'})
    //selectors for each athlete
    //<url> <loc> url</loc> </url>
    //selector all

    let siteMapAthletes = await page.evaluate(()=>{
        let selector = "url loc"
        let elArr: any = Array.from(document.querySelectorAll(`${selector}`))
        elArr = elArr.map((x:any)=>{
            let el = x.textContent
            return el;
        })
        return elArr
    })
    // console.log(siteMapAthletes)
    // console.log(siteMapAthletes.length)

    for(let i = 0; i < siteMapAthletes.length; i++){
        await crawlAthletePage(siteMapAthletes[i])
    }
    // siteMapAthletes.forEach((item:string ,i) => {
    //     crawlAthletePage(item);
    // })
    // crawlAthletePage(siteMapAthletes[2])
    // so take sitemapathletes and then go thru each athletes page
    // what do i do when on the page??
    // 
    await browser.close()
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



// run();

// crawlAthletePage('https://liftoracle.com/athlete/Abigail%20Cooper');
run()

//
// so what do I need to do?
// I need to loop thru each athlete in the sitemap
// get all of the sitemap athletes
// loop thru all of the athletes
// crawl the athlete page and write
// error handling and write to a 
// get the url of that athlete


//what do i need to do now