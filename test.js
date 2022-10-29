function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function httpGetAsync(theUrl, callback){
    //console.log('got_to_send_req_for_search')
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpGetAsync_for_events(theUrl, callback,id,event_id){
    //console.log('got_to_send_reqs_for_events')
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText,id,event_id);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
function check_main_page(html_text){
    let i=0;
    //console.log('got_to_main_page')
    let regex='href="/m/([0-9]*)';
    let links_matches = [...html_text.matchAll(regex)];
    let links=[]
    for (i=0;i<links_matches.length;i++){
        links.push(links_matches[i][0])

    }
    //console.log(links);
    let links_uniq=uniq(links);
    //console.log(links_uniq);
    let links_filtered=[]
    for (i=0;i<links_uniq.length;i++){
        let temp=links_uniq[i];
        temp=temp.replaceAll('href="/m/','');
        links_filtered.push(temp);

    }

    //console.log('found_those_event_ids')
    //console.log(links_filtered)
    for (i=0;i<links_filtered.length;i++){
        //console.log(links_filtered[i])
        let event_id=links_filtered[i]
        console.log(event_id)
        httpGetAsync_for_events('https://thawing-escarpment-34789.herokuapp.com/'+'https://events.vtools.ieee.org/m/'+links_filtered[i].toString(), get_event_info_from_html,i,event_id);

    }
    return undefined;
}

function change_html(info,serial){
    if (serial>9){
        return //haven't figured that out for now
    }
    document.getElementById('event_'+serial.toString()).innerHTML = '<h1>'+info['title']+'</h1>'+'\n'+'<h3>Description:</h3>\n'+info['description']+'\n'+'<img class="event_image" style="width:50%;" src='+info['image path']+' alt="event media">\n\n\n\n\n';
    console.log('ok')
    return
}

function get_event_info_from_html(html_text,serial,event_id) {
    html_text_string=html_text.replace(/\n/g, " "); //replaces \n for simplicity
    html_text_string=html_text_string.replace(/\r/g, " "); //replaces \r for simplicity
    html_text_string=html_text_string.replace(/\u2028/g, " "); //replaces \u2028 for simplicity
    html_text_string=html_text_string.replace(/\u2029/g, " "); //replaces \u2029 for simplicity
    let info ={}; //initialize return dict
    info['error report']=''; //initialize error report in return dict
    let re1 = new RegExp('<title>.*</title>'); //regex to find title
    //console.log(html_text_string)
    let title = html_text_string.match(re1); //find possible titles list
    let re2 = new RegExp('style="float:right; margin-left:10px; max-width: 50%;" />.*<br style="clear:both;">') //regex to find description
    let description = html_text_string.match(re2); //find possible descriptions
    //console.log(html_text_string)
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
    //console.log(info['title'])

    //console.log(html_text_string)
    // check for possible errors
    if (description.length >0 && description.length<2){
        info['description']=description[0].replaceAll("\r\n<div>",'').replace('style="float:right; margin-left:10px; max-width: 50%;" /> 	  ','').replaceAll('<br style="clear:both;">','') //clear clutter
        if (info['description'].includes('<div' )){
            let cut_off=info['description'].indexOf('<div');
            //console.log(cut_off)
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
    //console.log(info['description'])
    //console.log(event_id)
    info['image path']="https://events.vtools.ieee.org/event/picture/"+event_id; //get image path to info
    change_html(info,serial); //edit page element with info
    return info; //return info because why not
  }

let branch_name='STB50001+-+Univ+of+Patras'
httpGetAsync('https://thawing-escarpment-34789.herokuapp.com/'+'https://events.vtools.ieee.org/events/search?utf8=✓&_sub=true&q=&ou='+branch_name+'&d=All&commit=Search', check_main_page);
