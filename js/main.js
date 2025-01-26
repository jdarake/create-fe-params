
var PassageID; // ポーリング変数
var waitCount = 0; // レベルアップ画像表示時のウエイト回数
var paramType = "init"; // ポーリング時のパラメータ判別変数
var prevFlg = false;

$(function () {
	$('[data-toggle="popover"]').popover();
});

// 成長率
var upParam = {
	"lv":0,
	"hp":0,
	"str":0,
	"ski":0,
	"agi":0,
	"luk":0,
	"def":0,
	"mag":0
};

// 上昇値
var upState = {
	"lv":0,
	"hp":0,
	"str":0,
	"ski":0,
	"agi":0,
	"luk":0,
	"def":0,
	"mag":0
};

// 現在値
var curParam = {
	"lv":0,
	"hp":0,
	"str":0,
	"ski":0,
	"agi":0,
	"luk":0,
	"def":0,
	"mag":0,
	"bod":0
};

var quesList = new Vue({
	el: '#ques',
	
	data: {
		quesLists: [],
		name: '',
		isLoading: false,
		isQues: true,
		selected: '',
		selectsex: '',
		selectheight: '',
		selectweight: '',
		sexs: [
			{'sex' : 'おとこ'}, 
			{'sex' : 'おんな'}
		],
		options: [],
		maxList: []
	},
	
	methods: {
		
		radioChange: function (index, id) {
			for (var i in this.quesLists[index].ansList) {
				this.quesLists[index].ansList[i].val = 0;
			}
			this.quesLists[index].ansList[id].val = 1;
		},
		onFileChange(e) {
			let files = e.target.files || e.dataTransfer.files;
			this.createImage(files[0]);
		},
		createImage(file) {
			let reader = new FileReader();
			reader.onload = (e) => {
				resultArea.uploadedImage = e.target.result;
			};
			reader.readAsDataURL(file);
		},
		resultFunc: function () {
			
			if (this.selected == "") {
				alert("希望のクラスは必ず選んでください。");
				return null;
			}
			
			showDownload();
			
			// 全ラジオボタンの値分繰り返す
			for (var i in this.quesLists) {
				for (var j in this.quesLists[i].ansList) {
					// console.log(this.quesLists[i].ansList[j].id + ":" + this.quesLists[i].ansList[j].ans)
					var ans = this.quesLists[i].ansList[j];
					if (ans.val == 1) {
						// 回答内容によって成長値を上乗せ
						upParam.lv = upParam.lv + ans.lv;
						upParam.hp = upParam.hp + ans.hp;
						upParam.str = upParam.str + ans.str;
						upParam.ski = upParam.ski + ans.ski;
						upParam.agi = upParam.agi + ans.agi;
						upParam.luk = upParam.luk + ans.luk;
						upParam.def = upParam.def + ans.def;
						upParam.mag = upParam.mag + ans.mag;
					}
				}
			}
			
			// 兵種選択の結果格納
			var selected = this.selected;
			
			// 初期値オブジェクトを取得
			var filter = this.options.filter(function (element) {
				return element.job == selected;
			});
			var target = filter[0];
			
			// 性別による成長値の調整
			if (this.selectsex == "おとこ") {
				upParam.hp = upParam.hp + 5;
				upParam.str = upParam.str + 5;
				upParam.ski = upParam.ski - 5;
				upParam.agi = upParam.agi - 5;
				upParam.def = upParam.def + 5;
				upParam.mag = upParam.mag - 5;
			} else if (this.selectsex == "おんな") {
				upParam.hp = upParam.hp - 5;
				upParam.str = upParam.str - 5;
				upParam.ski = upParam.ski + 5;
				upParam.agi = upParam.agi + 5;
				upParam.def = upParam.def - 5;
				upParam.mag = upParam.mag + 5;
			}
			
			// 初期レベルの場合初期値を設定
			if (curParam.lv <= 0) {
				
				// 上級職の場合はいったん下級職の初期値をJSONから取得する
				if(!target.prevjob == "") {
					filter = this.options.filter(function (element) {
						return element.job == target.prevjob;
					});
					tempTarget = filter[0];
				} else {
					tempTarget = target;
					prevFlg = true;
				}
				
				// 初期値を加算してく
				curParam.hp = tempTarget.hp;
				curParam.str = tempTarget.str;
				curParam.ski = tempTarget.ski;
				curParam.agi = tempTarget.agi;
				curParam.luk = tempTarget.luk;
				curParam.def = tempTarget.def;
				curParam.mag = tempTarget.mag;
				curParam.bod = tempTarget.bod;
			}
			
			// 身長による体格値の調整
			if (this.selectheight == null) this.selectheight = 0;
			curParam.bod = curParam.bod + Number(this.selectheight);
			
			// 体重による体格値の調整
			if (this.selectweight == null) this.selectweight = 0;
			curParam.bod = curParam.bod + Number(this.selectweight);
			
			// 成長限界値を個別に取得
			var maxfilter = this.maxList.filter(function (element) {
				return element.job == selected;
			});
			var maxTarget = maxfilter[0];
			
			// 上級職の場合
			if (!target.prevjob == "") {
				
				// 下級職のmax値にいったん設定
				var filterMax = this.maxList.filter(function (element) {
					return element.job == target.prevjob;
				});
				tempMaxTarget = filterMax[0];
				
				// 下級職分の成長を先に行う
				for (var i = 0; i < 20 ; i++) {
					levelUp(tempMaxTarget);
					console.log("下級lv:"+(i+1));
				}
				// クラスチェンジ時のボーナスを加算
				curParam.lv = 1;
				curParam.hp = curParam.hp + (target.hp - tempTarget.hp);
				if (curParam.hp > maxTarget.hp) {curParam.hp = maxTarget.hp;}
				curParam.str = curParam.str + (target.str - tempTarget.str);
				if (curParam.str > maxTarget.str) {curParam.str = maxTarget.str;}
				curParam.ski = curParam.ski + (target.ski - tempTarget.ski);
				if (curParam.ski > maxTarget.ski) {curParam.ski = maxTarget.ski;}
				curParam.agi = curParam.agi + (target.agi - tempTarget.agi);
				if (curParam.agi > maxTarget.agi) {curParam.agi = maxTarget.agi;}
				curParam.luk = curParam.luk + (target.luk - tempTarget.luk);
				if (curParam.luk > maxTarget.luk) {curParam.luk = maxTarget.luk;}
				curParam.def = curParam.def + (target.def - tempTarget.def);
				if (curParam.def > maxTarget.def) {curParam.def = maxTarget.def;}
				curParam.mag = curParam.mag + (target.mag - tempTarget.mag);
				if (curParam.mag > maxTarget.mag) {curParam.mag = maxTarget.mag;}
				curParam.bod = curParam.bod + target.bod;
				if (curParam.bod > maxTarget.bod) {curParam.bod = maxTarget.bod;}
			}
			
			// レベル分成長させる
			for (var i = 0; i < upParam.lv; i++) {
				levelUp(maxTarget);
			}
			
			//処理結果モデルに格納
			if (this.name == "") this.name = "名無しのヌル";
			resultArea.name = this.name;
			resultArea.selected = this.selected;
			// 1.現在パラメータ格納
			resultArea.resultParam.lv = curParam.lv;
			resultArea.resultParam.hp = curParam.hp;
			resultArea.resultParam.str = curParam.str;
			resultArea.resultParam.ski = curParam.ski;
			resultArea.resultParam.agi = curParam.agi;
			resultArea.resultParam.luk = curParam.luk;
			resultArea.resultParam.def = curParam.def;
			resultArea.resultParam.mag = curParam.mag;
			resultArea.resultParam.bod = curParam.bod;
			// 2.最大パラメータ格納
			resultArea.maxParam.lv = maxTarget.lv;
			resultArea.maxParam.hp = maxTarget.hp;
			resultArea.maxParam.str = maxTarget.str;
			resultArea.maxParam.ski = maxTarget.ski;
			resultArea.maxParam.agi = maxTarget.agi;
			resultArea.maxParam.luk = maxTarget.luk;
			resultArea.maxParam.def = maxTarget.def;
			resultArea.maxParam.mag = maxTarget.mag;
			resultArea.maxParam.bod = maxTarget.bod;
			// 3.成長率格納
			resultArea.paramGrow.hp = upParam.hp;
			resultArea.paramGrow.str = upParam.str;
			resultArea.paramGrow.ski = upParam.ski;
			resultArea.paramGrow.agi = upParam.agi;
			resultArea.paramGrow.luk = upParam.luk;
			resultArea.paramGrow.def = upParam.def;
			resultArea.paramGrow.mag = upParam.mag;
			// 4.パラメータバーの長さ格納
			resultArea.progWidht.str = parsent(maxTarget.str);
			resultArea.progWidht.ski = parsent(maxTarget.ski);
			resultArea.progWidht.agi = parsent(maxTarget.agi);
			resultArea.progWidht.luk = parsent(maxTarget.luk);
			resultArea.progWidht.def = parsent(maxTarget.def);
			resultArea.progWidht.mag = parsent(maxTarget.mag);
			resultArea.progWidht.bod = parsent(maxTarget.bod);
			
			// なんちゃってローディング
			setTimeout(this.showResult, 500);
			
			// viweportをいったん解除
			// document.getElementById('viewport').setAttribute('content', 'width=640,initial-scale=1');
		},
		showResult:function() {
			// 結果表示
			this.isLoading = false 
			resultArea.isResult = true;
		}
	},
	mounted() {
		var tempQuesLists = [];
		resultList = [];
		axios.get("data/ques.json").then(response => {
			tempQuesLists = response.data.quesList;
			for(i = tempQuesLists.length - 1; i > 0; i--){
				var j = Math.floor(Math.random() * (i + 1));
				var tmp = tempQuesLists[i];
				tempQuesLists[i] = tempQuesLists[j];
				tempQuesLists[j] = tmp;
			}
			for(i = 0; i < tempQuesLists.length; i++) {
				if (i >= 10) break;
				resultList[i] = tempQuesLists[i];
			}
			this.quesLists = resultList;
		})
	},
	created: function() {
		axios.get('data/initParam.json').then(response => { this.options = response.data.initParamList }).catch(error => console.log(error)) 
		axios.get('data/maxParam.json').then(response => { this.maxList = response.data.maxParamList }).catch(error => console.log(error))
	}
});

// ダウンロード中画面だけ先出し
function showDownload() {
	quesList.isQues = false;
	quesList.isLoading = true;
};

var resultArea = new Vue({
	el: '#resultArea',
	data: {
		name: '',
		selected: '',
		uploadedImage: '',
		isResult: false,
		isLevelUp: false,
		isUPhp: false,
		isUPstr: false,
		isUPski: false,
		isUPagi: false,
		isUPluk: false,
		isUPdef: false,
		isUPmag: false,
		isUPbod: false,
		isUpBtn: false,
		resultParam: {
			"lv" : 0,
			"hp" : 0,
			"str" : 0,
			"ski" : 0,
			"agi" : 0,
			"luk" : 0,
			"def" : 0,
			"mag" : 0,
			"bod" : 0
		},
		maxParam: {
			"lv" : 0,
			"hp" : 0,
			"str" : 0,
			"ski" : 0,
			"agi" : 0,
			"luk" : 0,
			"def" : 0,
			"mag" : 0,
			"bod" : 0
		},
		paramGrow: {
			"hp" : 0,
			"str" : 0,
			"ski" : 0,
			"agi" : 0,
			"luk" : 0,
			"def" : 0,
			"mag" : 0
		},
		progWidht: {
			"hp" : 100,
			"str" : 100,
			"ski" : 100,
			"agi" : 100,
			"luk" : 100,
			"def" : 100,
			"mag" : 100,
			"bod" : 100
		},
		upParamValue: {
			"lv": 0,
			"hp": 0,
			"str": 0,
			"ski": 0,
			"agi": 0,
			"luk": 0,
			"def": 0,
			"mag": 0,
			"bod": 0
		}
	},
	methods: {
		levelUpFunc: function () {
			
			// ボタン非活性
			this.isUpBtn = true;
			
			// 成長限界値を個別に取得
			var maxfilter = quesList.maxList.filter(function (element) {
				return element.job == quesList.selected;
			});
			var maxTarget = maxfilter[0];
			
			// レベルアップ
			curParam.lv = curParam.lv++;
			levelUp(maxTarget);
			
			// 最大パラメータ格納
			resultArea.maxParam.lv = maxTarget.lv;
			resultArea.maxParam.hp = maxTarget.hp;
			resultArea.maxParam.str = maxTarget.str;
			resultArea.maxParam.ski = maxTarget.ski;
			resultArea.maxParam.agi = maxTarget.agi;
			resultArea.maxParam.luk = maxTarget.luk;
			resultArea.maxParam.def = maxTarget.def;
			resultArea.maxParam.mag = maxTarget.mag;
			resultArea.maxParam.bod = maxTarget.bod;
			
			// パラメータの時間差表示
			startTimer();
			
		}
		
	}
});

function levelUpFunc2() {
	
	// パラメータ増加値をそれぞれ取得
	var upParamValues = {
		"lv": curParam.lv - resultArea.resultParam.lv,
		"hp": curParam.hp - resultArea.resultParam.hp,
		"str": curParam.str - resultArea.resultParam.str,
		"ski": curParam.ski - resultArea.resultParam.ski,
		"agi": curParam.agi - resultArea.resultParam.agi,
		"luk": curParam.luk - resultArea.resultParam.luk,
		"def": curParam.def - resultArea.resultParam.def,
		"mag": curParam.mag - resultArea.resultParam.mag,
		"bod": curParam.bod - resultArea.resultParam.bod
	}
	
	// 増加しない箇所はスキップするため増加パラメータ判別変数を更新
	if (!(paramType == "init" || paramType == "wait") ) {
		for (value in upParamValues) {
			paramType = value;
			if (upParamValues[value] > 0) {
				break;
			}
		}
	}
	
	
	var timestamp = new Date().getTime();
	
	// 現在パラメータ格納
	if(paramType == "lv") {
		resultArea.resultParam.lv = curParam.lv;
		resultArea.upParamValue.lv = upParamValues.lv;
		paramType = "hp";
		$('#lv').append('<div id="lvc"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "hp") {
		resultArea.resultParam.hp = curParam.hp;
		resultArea.upParamValue.hp = upParamValues.hp;
		resultArea.isUPhp = true;
		paramType = "str";
		$('#hp').append('<div id="hpc"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "str") {
		resultArea.resultParam.str = curParam.str;
		resultArea.upParamValue.str = upParamValues.str;
		resultArea.isUPstr = true;
		paramType = "ski";
		$('#str').append('<div id="strc"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "ski") {
		resultArea.resultParam.ski = curParam.ski;
		resultArea.upParamValue.ski = upParamValues.ski;
		resultArea.isUPski = true;
		paramType = "agi";
		$('#ski').append('<div id="skic"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "agi") {
		resultArea.resultParam.agi = curParam.agi;
		resultArea.upParamValue.agi = upParamValues.agi;
		resultArea.isUPagi = true;
		paramType = "luk";
		$('#agi').append('<div id="agic"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "luk") {
		resultArea.resultParam.luk = curParam.luk;
		resultArea.upParamValue.luk = upParamValues.luk;
		resultArea.isUPluk = true;
		paramType = "def";
		$('#luk').append('<div id="lukc"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "def") {
		resultArea.resultParam.def = curParam.def;
		resultArea.upParamValue.def = upParamValues.def;
		resultArea.isUPdef = true;
		paramType = "mag";
		$('#def').append('<div id="defc"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	} 
	else if (paramType == "mag") {
		resultArea.resultParam.mag = curParam.mag;
		resultArea.upParamValue.mag = upParamValues.mag;
		resultArea.isUPmag = true;
		paramType = "bod";
		$('#mag').append('<div id="magc"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "bod" && upParamValues.bod > 0) {
		resultArea.resultParam.bod = curParam.bod;
		resultArea.upParamValue.bod = upParamValues.bod;
		resultArea.isUPbod = true;
		$('#bod').append('<div id="bodc"><img class="animeStar" src="data/star.png?' + timestamp + '"></div>');
	}
	else if (paramType == "init") {
		resultArea.isLevelUp = true;
		paramType = "wait";
		waitCount = 0;
	}
	else if (paramType == "wait" && waitCount < 4) {
		waitCount++;
	}
	else if (waitCount >= 4) {
		paramType = "lv";
		resultArea.isLevelUp = false;
		waitCount = 0;
	}
	else {
		stopTimer();
	}
	console.log(paramType);
}



// ステータスアップ時のポーリング処理
function startTimer() {
	paramType = "init";
	PassageID = setInterval('levelUpFunc2()',500);
}

// ポーリング終了
function stopTimer(){
	clearInterval( PassageID );
	sleep(2000);
	resultArea.isUPhp = false;
	resultArea.isUPstr = false;
	resultArea.isUPski = false;
	resultArea.isUPagi = false;
	resultArea.isUPluk = false;
	resultArea.isUPdef = false;
	resultArea.isUPmag = false;
	resultArea.isUPbod = false;
	$('#lvc').remove();
	$('#hpc').remove();
	$('#strc').remove();
	$('#skic').remove();
	$('#agic').remove();
	$('#lukc').remove();
	$('#defc').remove();
	$('#magc').remove();
	$('#bodc').remove();
	if (resultArea.resultParam.lv < resultArea.maxParam.lv) {
		resultArea.isUpBtn = false;
	}
}


/**
レベルアップ時の処理を行う。
*/
function levelUp(maxTarget) {
	
	//レベルMAXじゃない場合のみ処理
	if (curParam.lv < maxTarget.lv) {
		// 上昇値を設定していく
		upState.hp = random(upParam.hp, curParam.hp, maxTarget.hp);
		upState.str = random(upParam.str, curParam.str, maxTarget.str);
		upState.ski = random(upParam.ski, curParam.ski, maxTarget.ski);
		upState.agi = random(upParam.agi, curParam.agi, maxTarget.agi);
		upState.luk = random(upParam.luk, curParam.luk, maxTarget.luk);
		upState.def = random(upParam.def, curParam.def, maxTarget.def);
		upState.mag = random(upParam.mag, curParam.mag, maxTarget.mag);
		
		// 上昇値を加算していく
		curParam.lv++;
		curParam.hp = curParam.hp + upState.hp;
		curParam.str = curParam.str + upState.str;
		curParam.ski = curParam.ski + upState.ski;
		curParam.agi = curParam.agi + upState.agi;
		curParam.luk = curParam.luk + upState.luk;
		curParam.def = curParam.def + upState.def;
		curParam.mag = curParam.mag + upState.mag;
	}
	
};


/**
ステータス加算
*/
function stateUp(type, param) {
	if(upState.hp > 0) {
		if (type == "hp") {
			curParam.hp = curParam.hp + upState.hp;
		}
	}
};

/**
引数の確率を乱数にあててパラメータ上昇値を返却する。
	param1:	成長率(%)
	param2:	現在ステータス
	param3:	MAX値
	return:	上昇値
*/
function random(param, cur, max) {
	
	var result = 0;
	
	// 能力値MAXじゃない場合のみ処理
	if (cur < max) {
		// 乱数を1～100の間で生成
		var rand = Math.floor( Math.random() * 100);
		// 成長率内に収まった乱数の場合、成長値を返却(成長率100%を超えた分も評価)
		while(param > 0){
			if (rand <= param) {
				if(cur + result < max) {
					++result;
				}
			}
			param = param - 100;
		}
	}
	return result;
};

/**
パラメータ最大値が基準値の何%にあたるか計算
	引数1:	最大値
	戻り値:	パーセント(小数点以下四捨五入)
*/
function parsent(max) {
	var bordar = 30;
	return Math.round(((max / bordar) * 100) - 20) 
};

/**
ただのスリープ
	引数1:	ミリ秒
*/
function sleep(a){
	var dt1 = new Date().getTime();
	var dt2 = new Date().getTime();
	while (dt2 < dt1 + a){
		dt2 = new Date().getTime();
	}
	return;
}

anime({
	targets: '.levelup',
	translateY: 50,
	easing: 'easeInOutExpo'
});

function copyToClipboard() {
	var copyTarget = document.getElementById("copyTarget");
	copyTarget.select();
	document.execCommand("Copy");
	alert("コピーしました");
}
