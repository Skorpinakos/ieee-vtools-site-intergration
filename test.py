import requests as req
import re as re

def get_event_info_from_html(html):
    info={}
    title = re.findall("""<title>.*</title>""", html)
    if title!=[]:
        title=str(title[0]).replace('<title>','').replace(": vTools Events</title>",'').replace('''&quot;''','''"''') #find title of event using regex #change special sequence &quot; to ", also get rid of other collateral
        #print(title)
    else:
        title='No title'

    info['title']=title

    description = re.findall("""(?s)style="float:right; margin-left:10px; max-width: 50%;" />.*<br style="clear:both;">""", html)
    if description!=[]:
        description=str(description[0]).replace("\r\n<div>",'').replace("""style="float:right; margin-left:10px; max-width: 50%;" />\n\t  """,'').replace("""<br style="clear:both;">""",'')
    else:
        description='No description'
    
    if '<div' in description: #this removes clutter caused by additional logos embedded (in the 'engineering workshop for kids' for example)
        cut_off=description.index('<div')
        description=description[0:cut_off]
    #print(description)
    if description.strip()=='':
        description='No description'
    info['description']=description

    return info
    

page=req.get('https://events.vtools.ieee.org/events/search?utf8=✓&_sub=true&q=&ou={}&d=All&commit=Search'.format('STB50001+-+Univ+of+Patras')).text #get html from search page results
with open('test.html', 'w',encoding='utf-8') as file:
    file.write((page))
x = re.findall("""href="/m/[0-9]*""", page) #find event id's from result list

### remove duplicates while keeping the correct order and remove the collateral href="
matches={}
for i,match in enumerate(x):
    matches[match.replace('''href="/m/''','')]=(i)
list_of_ids=[]
list_of_ids=list(matches.keys())
list_of_ids.sort(key=lambda a: matches[a], reverse=False)
#print(list_of_ids)

#check all events using the ids 

for id in list_of_ids:
    event_page=req.get('https://events.vtools.ieee.org/m/{}'.format(id)).text #get event page using the id
    image_path="https://events.vtools.ieee.org/event/picture/{}".format(id) #get event image link using the id
    with open('test2.html', 'w',encoding='utf-8') as file:
        file.write((event_page))
        info=get_event_info_from_html(event_page) #get title and description from event page



