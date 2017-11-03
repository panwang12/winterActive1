
    var openid=sessionStorage["openid"];
    if(!openid){
        window.location="index.html";
    };
    var userID="";
    var isVerrify=0;
    var firstInto=false;

    //获取用户状态 0,1,2
    $.ajax({
        type:"post",
        url:"http://winter.dfcitroenclub.com/api/Values/CheckUserForWinner",
        contentType:"application/json",
        data:JSON.stringify({openid:openid}),
        success:function(obj){
            if(obj.data===null){
                //用户未注册
                isVerrify=0
            }else if(obj.data.iswinner===false){
                //用户注册了，单未抽奖
                isVerrify=1;
                userID=obj.data.user_ID;
            } else if(obj.data.iswinner===true){
                //已经抽过奖了
                isVerrify=2;
                userID=obj.data.user_ID;

            };
            if(isVerrify===0){
                getPage2.init();
            }else if(isVerrify===1){
                getPage3.init(userID);
            }else if(isVerrify===2){
                viewMyPage.init(userID)
            }

        },
        error:function(){
            console.log("请求错误")
        }
    });
    //用户留资
    var getPage2={
            isVerify:false,
            init:function(){
                $("#my-body").load("page2.html",this.start);
            },
            start:function(){
                var that=getPage2;
                getSite();//获取网点
                //查看vin码提示
                $("#vin-help").click(function(){
                    $("#p2-notice").css("display","block");
                    console.log(this);
                });
                $("#p2-notice").click(function(){
                    $(this).css("display","none");
                });
                $.ajax({//车主验证，验证是否为认证车主，并且拿到车主信息
                    type:"post",
                    url:"http://winter.dfcitroenclub.com/api/Values/GetDriverInfo",
                    contentType:"application/json",
                    data:JSON.stringify({openid:openid}),
                    success:function(obj){
                        if(obj.respCode==="1"){
                            $("#userName").val(obj.data.name);
                            $("#userPhone").val(obj.data.mobile);
                            $("#vinCode").val(obj.data.vin);
                            that.isVerify=true;
                        }else if(obj.respCode==="0"){
                            console.log("车主未认证")
                        };
                        that.subUserMsg();
                    },
                    error:function(){
                        console.log("请求错误")
                    }
                });

            },
        subUserMsg:function(){
            var that=this;
            $("#go-lottery-box").click(function(){
                if(checked()){
                    $("#go-lottery-box").attr("disabled",true);
                    var param=$("#get-message").serialize();
                    var obj=formToJson(param);
                    obj.openid=openid;
                    if(that.isVerify===false){
                        //请求验证接口
                        $("#loadImg").css("display","block");
                        $.ajax({
                            type:"post",
                            url:"http://winter.dfcitroenclub.com/api/Values/DriverCer",
                            data:JSON.stringify(obj),
                            contentType:"application/json",
                            success:function(obj){
                                if(obj.status==="0"){
                                    //vin码在组织信息部验证未通过
                                    alert("vin码验证未通过，请重新填写vin码")
                                }else if(obj.status==="1"){
                                    //请求
                                    that.getUserId(obj);
                                }
                            },
                            complete:function(){
                                $("#go-lottery-box").attr("disabled",false);
                                $("#loadImg").css("display","none");
                            },
                            error:function(){
                                console.log("请求错误")
                            }
                        });
                    }else if(that.isVerify===true){
                        //直接调用接口
                        that.getUserId(obj);
                    }
                }
            });
        },
        getUserId:function(obj){//提交用户信息
            obj.verifystatus=this.isVerify;
            firstInto=true;//用户是否为第一次进入页面
            var msg=JSON.stringify(obj);
            $.ajax({
                type:"post",
                url:"http://winter.dfcitroenclub.com/api/Values/SaveUserInfo",
                data:msg,
                contentType:"application/json",
                success:function(res){
                    if(res.code===0){
                        //第一次提交
                        userID=res.data;//获取用户userID
                        isVerrify=1;//绑定用户状态 1
                        getPage3.init()//获得奖券信息
                    }else if(msg.code===-2){
                        //信息已经存在
                        alert("您已经参与过留资")
                    }
                },
                complete:function(){
                    $("#go-lottery-box").attr("disabled",false);
                },
                error:function(){
                    console.log("请求错误")
                }
            });
        }
    };

    var getPage3={
        ticketBoxAll:null,//所有奖券信息
        ticketBox:[],//奖券信息重置，方便查找
        TICKET:[],//龙友宝箱
        init:function(){
            this.getTicketMsg(userID);
        },
        getTicketMsg:function(userId){//获取奖券
            var that=this;
            $.ajax({
                type:"post",
                url:"http://winter.dfcitroenclub.com/api/Values/GetCoupons",
                data:JSON.stringify({userID:userId}),
                contentType:"application/json",
                success:function(msg){
                    if(msg.code===0){
                        that.ticketBoxAll=msg;
                        that.renderPage3(msg);
                        msg.data.forEach(function(v,k){
                            v.coupons.forEach(function(v1,k1){
                                that.ticketBox[v1.couponID]={};
                                that.ticketBox[v1.couponID].showName=v1.showName;
                                that.ticketBox[v1.couponID].verificationTime=v1.verificationTime;
                                that.ticketBox[v1.couponID].remark=v1.remark;
                            });
                        });
                    }
                },
                error:function(){
                    console.log("请求错误")
                }
            });
        },
        renderPage3:function(msg){//渲染页面3
            var that=this;
            $("#my-body").load("page3.html",function() {
                var html="";
                msg.data.forEach(function (v, k) {
                    html += `<div class="row">
                                <div class="prize-name">${v.groupName}</div>`;
                    v.coupons.forEach(function (v1, k1) {
                        if(v1.couponID==25){
                            html += `<div class="col-xs-4 p3-ticket-box" data-status="${v1.status}" data-num="${v1.couponID}">
                                    <i class="select-icon"></i>
                                    <div class="left-info live-area">
                                        <h3><b>${v1.explain}</b></h3>
                                    </div>
                                    <div class="right-title">
                                        ${v1.showName}
                                    </div>
                                    <div class="no-select-notice">
                                        <h3>今日抢光</h3>
                                        <h3>明日继续疯抢</h3>
                                    </div>
                                </div>`;
                        }else if(v1.couponID==23){
                            html += `<div class="col-xs-8 p3-ticket-box col-xs-offset-2" data-status="${v1.status}" data-num="${v1.couponID}">
                                    <i class="select-icon"></i>
                                    <div class="left-info">
                                        <h3><span>¥</span><b>${v1.explain}</b></h3>
                                    </div>
                                    <div class="right-title">
                                        ${v1.showName}
                                    </div>
                                    <div class="no-select-notice">
                                        <h3>今日抢光</h3>
                                        <h3>明日继续疯抢</h3>
                                    </div>
                                </div>`;
                        }else {
                            html += `<div class="col-xs-4 p3-ticket-box" data-status="${v1.status}" data-num="${v1.couponID}">
                                    <i class="select-icon"></i>
                                    <div class="left-info">
                                        <h3><span>¥</span><b>${v1.explain}</b></h3>
                                    </div>
                                    <div class="right-title">
                                        ${v1.showName}
                                    </div>
                                    <div class="no-select-notice">
                                        <h3>今日抢光</h3>
                                        <h3>明日继续疯抢</h3>
                                    </div>
                                </div>`;
                        }
                    });
                    html += "</div>";
                });
                $("#page3").append(html);
                that.getPage3();
            })
        },
        getPage3:function(){
            if(firstInto===true){//第一次进入页面
                //弹出框
                $("#p3-intro").css("display","block");
                firstInto=false;
            }
            $("[data-status='0']").addClass("no-select");//此卡券不能选
            for(var i=0;i<this.TICKET.length;i++){//获得ticket的券添加状态
                var num=this.TICKET[i];
                var tar=document.querySelector(`[data-num="${num}"]`);
                $(tar).addClass("show-icon");
                $(tar).attr("data-status","2");
            };
            $("#icon1").css("display","block");//?
            $("#p3-intro").click(function(){
                $(this).css("display","none")
            });
            $("#view-rule").click(function(){
                $("#p3-intro").css("display","block")
            });
            $("#page3 .p3-ticket-box").click(function(){//券包点击
                var status=$(this).attr("data-status");
                var num=parseInt($(this).attr("data-num"));
                if(status==="1"){
                    if(getPage3.TICKET.length<5){
                        for(var j=0;j<getPage3.TICKET.length;j++){//防止重复
                            if(getPage3.TICKET[j]===num){
                                return;
                            }
                        }
                        getPage3.TICKET.push(num);
                        $(this).attr("data-status","2");
                        $(this).addClass("show-icon");
                    }else{
                        alert("最多只能选择5张券！")
                    }
                }else if(status==="2"){
                    for(var i=0;i<getPage3.TICKET.length;i++){
                        if(getPage3.TICKET[i]===num){
                            getPage3.TICKET.splice(i,1);
                        }
                    }
                    $(this).removeClass("show-icon");
                    $(this).attr("data-status","1");
                }
            })
        },
        getPage4:function(){
            var that=this;
            $("#my-body").load("page4.html",function(){
                $("#icon1").css("display","none");
                that.renderUserTicket();
                //删除奖券
                $(".remove-ticket").click(function(){
                    var num=$(this).attr("data-MyTic");
                    $("#p4-notice").css("display","block");
                    $("#isRemove").click(function(){
                        that.TICKET.splice(parseInt(num),1);
                        that.renderPage3(that.ticketBoxAll);
                    });
                    $("#notRemove").click(function(){
                        $("#p4-notice").css("display","none")
                    })
                });
                //开始抽奖
                $("#get-ticket").click(function(){
                    var obj={};
                    obj.userID=userID;
                    obj.couponIDs=that.TICKET;
                    //开始抽奖
                    $.ajax({
                        type:"post",
                        url:"http://winter.dfcitroenclub.com/api/Values/CardBuying",
                        data:JSON.stringify(obj),
                        contentType:"application/json",
                        success:function(msg){
                            if(msg.code===-3){
                                alert("您已经参与过抢券，请在我的券包查看。");
                            }else if(msg.code===0){
                                alert("恭喜您抢到"+msg.data.length+"张卡券，请在“我的券包”中查看");
                                viewMyPage.init(userID)
                            }
                        },
                        error:function(){
                            console.log("请求错误")
                        }
                    });

                })
            })
        },
        renderUserTicket:function(){
            var html="";
            var that=this;
            this.TICKET.forEach(function(v,k){
                html+=`<div class="ticket-box">
                            <div>${that.ticketBox[v].showName}</div>
                            <div>
                                <p>${that.ticketBox[v].remark}</p>
                                <p>使用期限：${that.ticketBox[v].verificationTime}</p>
                            </div>
                            <i class="remove-ticket" data-myTic="${k}"></i>
                        </div>`;
            });
            $("#ticket-group").append(html);
        }
    }

    //转换键值对为对象
    function formToJson(data) {
        data=data.replace(/&/g,"\",\"");
        data=data.replace(/=/g,"\":\"");
        data="{\""+data+"\"}";
        return JSON.parse( decodeURI(data));
    }
    //获取网点
    function getSite(){
        $.ajax({
            url:"http://winter.dfcitroenclub.com/api/Values/GetPros",
            type:"post",
            success:function(obj){
                var str="<option>省份</option>";
                for(var i=0;i<obj.data.length;i++){
                    str+="<option>"+obj.data[i].name+"</option>";
                }
                $("#province").html(str)
            },
            error:function(){
                console.log("错误")
            }
        });
        $("#province").change(function(){
            var pro=$(this).val();
            $.ajax({
                url:"http://winter.dfcitroenclub.com/api/Values/GetCitys",
                type:"post",
                contentType:"application/json",
                data:JSON.stringify({prov:pro}),
                success:function(obj){
                    var str="<option>城市</option>";
                    for(var i=0;i<obj.data.length;i++){
                        str+="<option>"+obj.data[i].name+"</option>";
                    }
                    $("#city").html(str)
                }

            });
        });
        $("#city").change(function(){
            var city=$(this).val();
            $.ajax({
                url:"http://winter.dfcitroenclub.com/api/Values/GetSubs",
                type:"post",
                contentType:"application/json",
                data:JSON.stringify({city:city}),
                success:function(obj){
                    var str="<option value='0'>网点</option>";
                    for(var i=0;i<obj.data.length;i++){
                        str+="<option value="+obj.data[i].code+">"+obj.data[i].name+"</option>"
                    }
                    $("#website").html(str)
                }
            });
        });
    }
    //验证提交总信息
    function checked(){
        if(checkUserName()&&checkPhone()&&checkVinCode()&&checkProvince()&&checkCity()&&checkWebsite()){
            return true;
        }else{
            return false;
        }
    };
    function checkUserName(){
        var val=$("#userName").val();
        if(val==""){
            alert("用户名不能为空");
            return false;
        }
        return true;
    }
    //验证电话
    function checkPhone(){
        var val=$("#userPhone").val();
        var reg=/^1[3,5,7,8]\d{9}$/;
        if(val==""|| !reg.test(val)){
            alert("手机号码格式不正确");
            return false;
        }
        return true;
    }
    //验证车型
    function checkVinCode(){
        var val=$("#vinCode").val();
        var reg=/^[L,l][D,d][C,c][0-9a-zA-Z]{14}$/;
        if(val==""|| !reg.test(val)){
            alert("vin码不正确");
            return false;
        }
        return true;
    }
    //验证省份
    function checkProvince(){
        var val=$("#province").val();
        if(val=="省份"){
            alert("未选择省份");
            return false;
        }
        return true;
    }
    //验证城市
    function checkCity(){
        var val=$("#city").val();
        if(val=="城市"){
            alert("未选择城市");
            return false;
        }
        return true;
    }
    function checkWebsite(){
        var val=$("#website").val();
        if(val=="0"){
            alert("未选择网点");
            return false;
        }
        return true;
    }


    //底部按钮事件
    $("#view-box").click(function(){
        if(isVerrify===1&&getPage3.TICKET.length>0){
            getPage3.getPage4()
        }else if(isVerrify===2){
            alert("您已经抽过奖了，请在券包查看")
        }else{
            alert("您还没有选择抽奖的奖券，最多可以选择5张")
        }
    });
    $("#view-package").click(function(){
        if(isVerrify===2){
            viewMyPage.init(userID)
        }else{
            alert("您还没有获得奖券！")
        }
    });

//page5
    var viewMyPage={
        obj:{
            user_id:"",
            product: "5",
            response: "5",
            attitude: "5",
            evaluate: "5",
            describe: ""
        },
        init:function(userID){
            isVerrify=2;
            this.getPage5(userID);
        },
        getPage5:function(userID){
            var that=this;
            $.ajax({
                type:"post",
                url:"http://winter.dfcitroenclub.com/api/Values/MyCardPackage",
                data:JSON.stringify({userID:userID}),
                contentType:"application/json",
                success:function(msg){
                    that.loadPage5(msg);
                },
                error:function(){
                    console.log("请求错误");
                }
            });
        },
        renderPage5:function(msg){
            var html="";
            for(var i=0;i<msg.data.coupons.length;i++){
                html+=`
                <div class="ticket-box">
                <div>${msg.data.coupons[i].showName}</div>
                <div>
                    <p style="font-size: 14px;">${msg.data.coupons[i].verCode}</p>
                    <p>${msg.data.coupons[i].remark}</p>
                    <p>使用期限：${msg.data.coupons[i].verificationTime}</p>
                </div>
            </div>
            `;
            };
            $("#ticket-group").html(html)
            $("#p5-name").html(msg.data.name);
            $("#p5-phone").html(msg.data.phone);
            $("#p5-site").html(msg.data.subName)
        },
        loadPage5:function(msg){
            var that=this;
            $("#my-body").load("page5.html",function(){
                that.renderPage5(msg);
                $("#view-rule").click(function(){
                    $("#p5-rule").css("display","block");
                })
                $("#p5-rule").click(function(){
                    $("#p5-rule").css("display","none");
                });
                $("#sub-evaluate").click(function(){
                    that.obj.describe=$("#describe").val();
                    that.obj.user_id=userID;
                    $.ajax({
                        type:"post",
                        url:"http://winter.dfcitroenclub.com/api/Values/SaveEvaluate",
                        data:JSON.stringify(that.obj),
                        contentType:"application/json",
                        success:function(msg){
                            if(msg.code===-1){
                                alert("用户信息不存在");
                            }else if(msg.code===-2){
                                alert("您已经评价过了");
                            }else if(msg.code===-3){
                                alert("请在核销后再评价");
                            }else if(msg.code===0){
                                if(msg.data>0){
                                    alert("提交成功！")
                                }
                            }
                            $("#serve-content").css("display","none")
                        },
                        error:function(){
                            console.log("请求错误")
                        }
                    });
                });
                $("#serve-level").click(function(){
                    if(msg.code===0){
                        alert("您还未到店使用奖券，请核销后再评价")
                    }else{
                        $("#serve-content").fadeIn();
                        $(".appraise-detail i").click(function(){
                            var num=parseInt( $(this).attr("data-msg"));
                            switch(num){
                                case 1:
                                    alert("对服务产品满意程度");
                                    break;
                                case 2:
                                    alert("对服务响应满意程度");
                                    break;
                                case 3:
                                    alert("对服务态度满意程度");
                                    break;
                                case 4:
                                    alert("对总体评价满意程度");
                                    break;
                            }
                        });
                    }
                    $(".star-box").click(function(e){
                        var star=parseInt($(e.target).attr("data-star"));
                        var moveX=(30*star-150)+"px";
                        $(this).css("background-position-x",moveX);
                        var val=$(e.target).attr("data-star");
                        var target=$(this).attr("data-name");
                        that.obj[target]=val;
                    })
                })
            })
        }
    }
