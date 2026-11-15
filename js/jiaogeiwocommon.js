/**
 * 默认跳转到指定语言
 * 默认调整到英文: jumpLang('en');
 * 
 */
function jumpLang(lang) {
    // 只有直接访问域名才用
    if (location.pathname === '/') {
        location.href = '/' + lang;
    }
}

/**
 * 手机端显示pc端网页
 */
 function browserRedirect() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";

    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
        // window.location.href = 'm' + location.pathname + location.search;
        document.querySelector('head').innerHTML += '<meta name="viewport" content="width=1200px, initial-scale=0.3">'
    }
}

/**
 * 网站是否被嵌在iframe中
 */
function isIframe() {
    return self !== top;
}

/**
 * 301重定向
 */
function redirectToWWW() {
    if (location.hostname.split('.').length === 2) {
        location.href = location.protocol + '//www.' + location.host + location.pathname;
    }
}

/**
 * 屏蔽中国ip代码
 */
function shieldChina() {
    if (location.host.indexOf('caihongjianzhan.com') === -1) { // 只有正式域名才执行
        fetch('//yun-api.sungdell.com/ip-country')
            .then(res => res.json())
            .then(res => {
                if (res.country === 'CN') {
                    location.href = "cnlogin.html";
                }
            })
    }
}

/**
 * 禁止页面复制
 */
function banCopy() {
    document.writeln(`
        <script>  
            document.oncontextmenu=new Function("event.returnValue=false");  
            document.onselectstart=new Function("event.returnValue=false");  
        </script> 
    `);
}

/**
 * 栏目高亮代码
 */
 function activeMenu({
    navSelector = '[component="header.html"]', 
    keyword = location.pathname.substring(1) + location.search,
    activeSelector = 'li',
    activeClass = 'is-active',
} = {}) {
   const $a = $(navSelector + " a[href$='" + keyword + "']");
   let $active = $a;
   if (activeSelector) {
       $active = $a.closest(activeSelector);
   }
   if ($active.length > 0) {
       $(`${navSelector} ${activeSelector || 'a'}.${activeClass}`).removeClass(activeClass);
       $active.addClass(activeClass);
   }
}

/**
 * 用图片主色作为背景渐变
 */
 function setSectionsMainColor(imgEle) {
    imgEle.crossOrigin = "Anonymous";
    if (imgEle.naturalWidth === 0) {
        console.info('naturalWidth is 0');
        return;
    }
    const canvas = document.createElement('canvas')
    var ctx = canvas.getContext("2d");
    var naturalImgSize = [imgEle.naturalWidth, imgEle.naturalHeight];
    canvas.width = naturalImgSize[0];
    canvas.height = naturalImgSize[1];
    
    //绘制到canvas
    ctx.drawImage(imgEle, 0, 0);
    //获取imageData：rgba像素点
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const leftSectionData = []
    const rightSectionData = []
    const onelineImgDataLen = canvas.width * 4;

    imgData.data.forEach((colorVal, i) => {
        if (i % onelineImgDataLen <= 0.5 * onelineImgDataLen || i % onelineImgDataLen >= 0.6 * onelineImgDataLen) {
            const inLeft = i % onelineImgDataLen <= 0.5 * onelineImgDataLen
            if (i % 4 === 0) {
                // 获取rgb均值
                const curAverageRGB = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
                let leftOrRightRef = inLeft ? leftSectionData : rightSectionData;
                //每个数组里存四个值：本颜色值中的r、g、b的均值，以及r、g、b三个值。
                //均值一方面用于累加计算本区域的整体均值，然后再跟每个均值对比拿到与整体均值最接近的项的索引，再取该数组里的后三个值：rgb，对应着颜色
                leftOrRightRef[leftOrRightRef.length] = [curAverageRGB, imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]]
            }
        }
    })
    //generate average rgb
    const averageOfLeft = Math.round(leftSectionData.reduce((_cur, item) => {
        return _cur + item[0]
    }, 0) / leftSectionData.length)
    const averageOfRight = Math.round(rightSectionData.reduce((_cur, item) => {
        return _cur + item[0]
    }, 0) / rightSectionData.length)
    //find the most near color
    const findNearestIndex = (averageVal, arrBox) => {
        let _gapValue = Math.abs(averageVal - arrBox[0])
        let _nearColorIndex = 0
        arrBox.forEach((item, index) => {
            const curGapValue = Math.abs(item - averageVal)
            if (curGapValue < _gapValue) {
                _gapValue = curGapValue
                _nearColorIndex = index
            }
        })
        return _nearColorIndex
    }

    const leftNearestColor = leftSectionData[findNearestIndex(averageOfLeft, leftSectionData)]
    const rightNearestColor = rightSectionData[findNearestIndex(averageOfRight, rightSectionData)]
    console.log(leftNearestColor,rightNearestColor);
    $(imgEle).parent().css('background-image', 'linear-gradient(90deg,rgba(' + leftNearestColor[1] + ',' + leftNearestColor[2] + ',' + leftNearestColor[3] + ',1) 0%,rgba(' + rightNearestColor[1] + ',' + rightNearestColor[2] + ',' + rightNearestColor[3] + ',1) 100%')
}