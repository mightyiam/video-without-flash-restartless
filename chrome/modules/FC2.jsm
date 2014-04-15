
var parser = {
    BASE_URI : 'video.fc2.com',
    API_GET_VIDEO:'http://video.fc2.com/ginfo.php?upid=UPID&mimi=MIMI&gk=GK',
    SALT:'_gGddgPfeaf_gzyr',
    
    parse_site:function(cw) {
	const REGEX_VIDEO_ID_SITE = /content\/(\w+)/;
	const XPATH_VIDEO_TYPE = '/html/head/meta[@property="og:video:type"]/@content';
	const XPATH_VIDEO_IMG = '/html/head/meta[@property="og:image"]/@content';
	var doc = cw.document;
	var video_info = [];
	var id;

	//get the video id
	if(url_match = doc.URL.match(REGEX_VIDEO_ID_SITE)){
	    id = url_match[1];
	}
	else{
	    throw('cannot retreive ID of a '+this.BASE_URI+' video on '+doc.URL);
	}

	//get MD5 from video id and salt
	var id_salt = id+this.SALT;
	var md5sum = utils.md5(id_salt);

	//get gk (signature generated by JS)
	var gk = [];
	var res;
	var re_fun = /function cass\(\)\{([\s\S]+?)\}/;	
	var re_arr = /Array\(([0-9]),'(\w)'\)/g;
	var source = doc.documentElement.innerHTML;
	var function_content = source.match(re_fun)[1];
	while(res = re_arr.exec(function_content)){  
          gk[res[1]] = res[2];
        }

	//construct the url 
	var api_video_uri = this.API_GET_VIDEO.replace('UPID', id);
	api_video_uri = api_video_uri.replace('MIMI', md5sum);
	api_video_uri = api_video_uri.replace('GK', gk.join(''));
	
	var data = utils.get(api_video_uri);
	//extract the video url (filepath) from the data
	var assoc_data = utils.url_vars_to_array(data);
	var filepath = assoc_data['filepath'];
	if(!filepath)return;

	var mid = assoc_data['mid'];
	var url = filepath+'?mid='+mid;
	
	//get player
	var player = doc.getElementById('videoplayer');
	if(!player){
	    player = doc.getElementsByClassName('req_regist_wrap01 box_inset01')[0];
	    var bnr_wifi = doc.getElementsByClassName('bnr_wifi')[0];
	    if(bnr_wifi)bnr_wifi.style.display = 'none';
	}
	
	//get thumbnail
	var video_img = doc.evaluate(XPATH_VIDEO_IMG, doc, null,
				     cw.XPathResult.STRING_TYPE, null).stringValue;
        var video_type = doc.evaluate(XPATH_VIDEO_TYPE, doc, null,
				     cw.XPathResult.STRING_TYPE, null).stringValue;

	video_info.push({
	    'player':player,
	    'video_img': video_img,
	    'videos': [ {'format':video_type, 'url':url} ]
	});

	return video_info;
    }
};
