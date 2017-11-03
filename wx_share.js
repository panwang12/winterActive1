/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(function () {

    $.ajax({
        url: "http://www.you-partners.com/interface/cicadacloud/share_sample.php",
        type: "GET",
        cache: true,
        data: {u: location.href},
        dataType: "jsonp",
        success: function (back) {
            //alert(location.href);
            wx.config({
                debug: false,
                appId: back.appId,
                timestamp: back.timestamp,
                nonceStr: back.nonceStr,
                signature: back.signature,
                jsApiList: [
                    // 所有要调用的 API 都要加到这个列表中
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                ]
            });
        },
        error: function () {
        }
    });
});

wx.ready(function () {
    // 在这里调用 API
//    wx.hideMenuItems({
//        menuList: [
//            'menuItem:share:appMessage',
//            'menuItem:share:timeline',
//            "menuItem:share:qq",
//            'menuItem:share:QZone',
//            "menuItem:copyUrl"
//        ] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
//    });
    wx.error(function (res) {
//        alert(res);
    });

//    wx.hideOptionMenu();
    addWeiXinEvent(0);
});

var addWeiXinEvent = function (index) {
//    $.shareUrl = "http://www.stride-base.com/hui_" + $.index + ".html";
    $.shareAppTitle = "入秋盛惠季 半价轻松筹";
    $.shareAppDesc = "盛惠狂欢 好事成双,东风雪铁龙2017年冬季送温暖，爆款秒杀、惊喜特惠、更有海量礼券等你拿！";
    $.timelineTitle = "盛惠狂欢 好事成双,东风雪铁龙2017年冬季送温暖，爆款秒杀、惊喜特惠、更有海量礼券等你拿！";
    $.shareImage = "http://winter.dfcitroenclub.com/winterActive/images/share.jpg";
    $.shareUrl = "http://winter.dfcitroenclub.com/winterActive/index.html";

    wx.onMenuShareAppMessage({
        title: $.shareAppTitle,
        desc: $.shareAppDesc,
        link: $.shareUrl,
        imgUrl: $.shareImage,
        trigger: function (res) {

        },
        success: function (res) {

         // KM.km_track_share({t: $.shareAppTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareAppMessage:success"});
        },
        cancel: function (res) {
           // KM.km_track_share({t: $.shareAppTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareAppMessage:cancel"});
        },
        fail: function (res) {

        }
    });
    wx.onMenuShareTimeline({
        title: $.timelineTitle,
        link: $.shareUrl,
        imgUrl: $.shareImage,
        trigger: function (res) {
        },
        success: function (res) {
           // KM.km_track_share({t: $.timelineTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareTimeline:cancel"});

        },
        cancel: function (res) {
          //  KM.km_track_share({t: $.timelineTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareTimeline:cancel"});

        },
        fail: function (res) {
        }
    });
};

var addWeiXinEventss = function () {
//    $.shareUrl = "http://www.stride-base.com/hui_" + $.index + ".html";
    $.shareAppTitle = "";
    $.shareAppDesc = " ";
    $.timelineTitle = "";
    $.shareImage = "";
    $.shareUrl = "";

    wx.onMenuShareAppMessage({
        title: $.shareAppTitle,
        desc: $.shareAppDesc,
        link: $.shareUrl,
        imgUrl: $.shareImage,
        trigger: function (res) {

        },
        success: function (res) {

            //KM.km_track_share({t: $.shareAppTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareAppMessage:success"});
        },
        cancel: function (res) {
            //KM.km_track_share({t: $.shareAppTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareAppMessage:cancel"});
        },
        fail: function (res) {

        }
    });
    wx.onMenuShareTimeline({
        title: $.timelineTitle,
        link: $.shareUrl,
        imgUrl: $.shareImage,
        trigger: function (res) {
        },
        success: function (res) {
            KM.km_track_share({t: $.timelineTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareTimeline:cancel"});

        },
        cancel: function (res) {
            KM.km_track_share({t: $.timelineTitle, ext: "", img: $.shareImage, u: $.shareUrl, desc: $.shareAppDesc, sr: "ShareTimeline:cancel"});

        },
        fail: function (res) {
        }
    });
}
