function httpGetAsync(theUrl, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpGetAsync_for_events(theUrl, callback,id){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText,id);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
function check_main_page(html_text){
    let regex='href="/m/[0-9]*';
    let links = html_text.match(regex);
    let links_filtered= [...new Set(links)]; //remove duplicates
    for (i=0;i<links_filtered.length;i++){
        httpGetAsync_for_events('https://events.vtools.ieee.org/m/'+links_filtered[i].toString(), get_event_info_from_html,id);

    }

}

function change_html(info,serial){
    console.log('ok')
    return
}

function get_event_info_from_html(html_text,serial) {
    html_text_string=html_text.replace(/\n/g, " "); //replaces \n for simplicity
    let info ={}; //initialize return dict
    info['error report']=''; //initialize error report in return dict
    let re1 = new RegExp('<title>.*</title>'); //regex to find title
    let title = html_text_string.match(re1); //find possible titles list
    //for each case (0,1,many) of titles found set apropriate title and error report 
    if (title.length >0 && title.length<2){
        info['title']=title[0].replaceAll('<title>','').replaceAll(": vTools Events</title>",'').replaceAll('&quot;','"'); //change special sequence &quot; to ", also get rid of other collateral
    }
    if (title.length >1){
        info['title']=title[0].replaceAll('<title>','').replaceAll(": vTools Events</title>",'').replaceAll('&quot;','"'); //change special sequence &quot; to ", also get rid of other collateral;
        info['error report']=info['error report']+'_'+'found multiple titles';
    }
    if (title.length ==0){
        info['title']=undefined;
        info['error report']=info['error report']+'_'+'found no title';
    }
    let re2 = new RegExp('style="float:right; margin-left:10px; max-width: 50%;" />.*<br style="clear:both;">') //regex to find description
    let description = html_text_string.match(re2); //find possible descriptions
    // check for possible errors
    if (description.length >0 && description.length<2){
        info['description']=description[0].replaceAll("\r\n<div>",'').replace('style="float:right; margin-left:10px; max-width: 50%;" />\n\t  ','').replaceAll('<br style="clear:both;">','') //clear clutter
        if (info['description'].includes('<div' )){
            let cut_off=description.indexOf('<div');
            info['description']=info['description'].slice(0,cut_off); //slice clutter out
        }
    }
    if (description.length >1){
        info['description']=undefined;
        info['error report']=info['error report']+'_'+'found multiple descriptions';
    }
    if (description.length ==0){
        info['description']=undefined;
        info['error report']=info['error report']+'_'+'found no description';
    }
    info['image path']="https://events.vtools.ieee.org/event/picture/"+serial.toString(); //get image path to info
    change_html(info,serial); //edit page element with info
    return info; //return info because why not
  }

  httpGetAsync('https://events.vtools.ieee.org/events/search?utf8=✓&_sub=true&q=&ou={}&d=All&commit=Search', check_main_page);
