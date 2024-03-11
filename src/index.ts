const puppeteer = require('puppeteer')

//what are the steps I need to do
// open browser
// go to web pages i need
// take the html and put it somewhere
//

let sitemaps = [
    'https://liftoracle.com/sitemap-static.xml',
    'https://liftoracle.com/sitemap-athletes-1.xml',
    'https://liftoracle.com/sitemap-athletes-2.xml',
    'https://liftoracle.com/sitemap-meets-1.xml',
]

async function run(): Promise<void>{
    console.log('running sitmap crawler');
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
    console.log(siteMapAthletes)
    console.log(siteMapAthletes.length)
}

// async function getAthletesOnPage(athletesOnPage, page , filePath){
//     let allAthleteData =[];
//     for(let i = 1; i <= athletesOnPage; i++){
//         let athleteData = await page.evaluate((index)=>{
//             let selector = ".data-table div div.v-data-table div.v-data-table__wrapper table tbody tr:nth-of-type("+ index +") td > div"
//             let elArr = Array.from(document.querySelectorAll(`${selector}`))
//             elArr = elArr.map((x)=>{
//                 let el = x.textContent.replace('|', ',')
//                 return  el.trim()
//             })
//             return elArr
//         },i)
//         // athleteData = athleteData.map(x=> x.replace(',',' ').trim())

//         allAthleteData.push(athleteData)
//     }

//     let weightliftingCSV = createCSVfromArray(allAthleteData);
//     writeCSV(filePath, weightliftingCSV)    
// }


// async function getCurrentYearMetadata(filePath: string) {
//     console.log('running current year metadata scraper')
//     let url = 'https://usaweightlifting.sport80.com/public/rankings/results/'
    
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setViewport({width:1500, height:1000})
//     await page.goto(url, {
//         waitUntil: 'networkidle0'
//     })

//     async function getMoreResultsOnPage(){
//         await page.waitForNetworkIdle()
//         await page.click('div.v-select__slot div.v-input__append-inner div.v-input__icon')
//         await page.waitForNetworkIdle()
//         await page.waitForSelector('div.v-menu__content')
//         await page.waitForNetworkIdle()
//         await page.click('div.v-menu__content div.v-list.v-select-list.v-sheet div.v-list-item.v-list-item--link:nth-of-type(6)')
//         await page.waitForNetworkIdle()
//         console.log('got more results on page')
//     }

//     async function getPageData(){
//         return await page.$eval(
//             ".data-table div div.v-data-table div.v-data-footer div.v-data-footer__pagination",
//             x =>  x.textContent
//         )
//     }
       
//     //takes pagination from 30/page to 50/page
//     await getMoreResultsOnPage()
    
// //    await page.screenshot({ path: 'date.png', fullPage: true })
   
//    //waits for the data to actually load before we get all of the meet data
//    await page.waitForNetworkIdle()
//    await page.waitForNetworkIdle()
   
//     // await page.screenshot({ path: 'page.png', fullPage: true })
//     await getTableWriteCsv(filePath, page)

//     console.log('starting scraping')
    
//     await getMeetsOnPage(getAmountMeetsOnPage(await getPageData()), page, filePath);
//     console.log(await getPageData())

//     while(await handleTotalAthleteString(await getPageData())){
//         console.log('getting meet metadata...')
//         await Promise.all([
//             page.waitForNetworkIdle(),
//             page.click('.data-table div div.v-data-table div.v-data-footer div.v-data-footer__icons-after'),
//         ]);
//         console.log(await getPageData())
        
//         await getMeetsOnPage(getAmountMeetsOnPage(await getPageData()), page, filePath)
//     }

//     console.log('getting resourses...')
//     console.log(await getPageData())
//     console.log('done scraping')

//     await browser.close();
// }

run();
