let fs = require('fs');

const fileName = './athlete/deez'
const stream = fs.createWriteStream(fileName);

stream.once('open', ()=>{
    const html = buildHtml();
    stream.end(html);
})


function buildHtml(htmlStr:string){
    var header = '';
    var body = '';
    
    // concatenate header string
    // concatenate body string
    
    return htmlStr ||'<!DOCTYPE html>'
            + '<html><head>' + header + '</head><body>' + body + '</body></html>';
}
