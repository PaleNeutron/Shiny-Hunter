auto.waitFor(); 
auto.setMode("normal");
var ar = confirm("今日份的AR关了吗？");

log("百闪狩猎 永不收费");
log("QQ 1群： 686066662");
log("QQ 2群： 970048992");
log("开启Pokémon GO");
log("屏幕分辨率为： "+device.width+" x "+device.height);

// 全局
var count = 0;
var loopSwitch = true;
var mapStatus = false;
var ivSwitch = false;
var ball = 0;
var resetPoint = 0;
var mapCount = 0;
var safeTime = false;
var clickTime = 0;
var sniperRest = 0;



$settings.setEnabled('foreground_service', true);
if (!$power_manager.isIgnoringBatteryOptimizations()) {
    toastLog("未开启忽略电池优化，请求中...");
    $power_manager.requestIgnoreBatteryOptimizations();
    sleep(3000);
}
if(!requestScreenCapture()){ 
    log("请求截图权限失败,运行结束"); 
}
files.create("/sdcard/DCIM/百闪狩猎/");

startGame();

id("hl_cd_text").waitFor();
log("加载中");
sleep(5000);

//狙击栏
var RArr = className("android.widget.RelativeLayout").boundsInside(device.width/2,0,device.width,device.height).find();
var Robject = RArr[0];

//附近雷达
var LArr = className("android.widget.RelativeLayout").boundsInside(0,0,device.width/2,device.height).find();
var Lobject = LArr[0];


sleep(1000);
log("开始狩猎");

while(count <= 5000){
    try{
    screenCheck();
    device.wakeUp();
    ball = 0;
    count++;
    mapCount = 0;
   //resetPoint = 8;
    
    if(resetPoint >= 3 || sniperRest >=8){
        sniperRest = 0;
        resetPoint = 0;
        log("多次地图加载失败 或 长时间未找到狙击目标，重新启动游戏");
        closeApp();
        log("2秒后启动游戏");
        sleep(2000);
        startGame();
        log("加载中");
    }

    RArr = className("android.widget.RelativeLayout").boundsInside(device.width/2,0,device.width,device.height).find();
    Robject = RArr[0];
    
    if(Robject && Robject.clickable()==true && Robject.visibleToUser()==true){

         log("第 "+count+" 次狩猎" + " : 共点击了" + clickTime +" 只宝可梦");
          Robject.click();
           sleep(1000);
          refresh();
            if(mapStatus == true){
            clickTime++;
            resetPoint = 0;
            changeFov();
            sleep(300);
            clickPokemon();
            ivSwitch = true;
        }else{
            log("地图加载超时下一个，建议检查下网络连接!");
            resetPoint++;
            back();
            clickCompass();
         }
 

    safeTime = false;

    while(id("hl_ec").exists() && ivSwitch == true){

        var cdTimer = text("0:00:00").findOnce();
        var ivCheck = text("100").findOnce();
        if(ivCheck){
            if(cdTimer){
                if(safeTime == false){
                    log("✨百闪✨");
                    log("15秒后自动捕捉");
                    sleep(1000);
                    safeTime = true;
                    sleep(14000);
                }
                ball++;
                log("自动捕获第"+ball+"次");
                catchPokemon();
                sleep(5000);
            }else{
                device.wakeUp();
                toast("等待cd中，过后自动捕获");
                sleep(10000);
            }
        }else{
            log("退出(IV非百✨路闪)");
            sleep(500);
            back();
            sleep(2000);
        }
    }

    sleep(100);
    back();
    sleep(500);
    back();
    sleep(500);
    clickCompass();

    }else{
        sniperRest++;
        log("未找到狙击目标, 暂停15秒");
        sleep(15000);
    }
}catch(e){
    log("e");

}
}

exit();


//功能
//检测环境功能
function checkEnv(){
    log("检测环境");
    
    if(id("hl_cd_text").exists()){
    log("CD计时器✓");
    }
    else{
    log("CD计时器x");
    }
    
    if(Robject && Robject.clickable()==true){
        log("狙击栏✓");
    }
    else{
        log("狙击栏x");
    }
    
    if(Lobject && Lobject.clickable()==true){
        log("附近雷达✓");
    }
    else{
        log("附近雷达x");
    }
}
    

    //检测加载
    function checkMap(){
        radar = className("android.widget.RelativeLayout").boundsInside(0,0,device.width/2,device.height).find();
        radarobject = null;
        radarobject = radar[0];
    
            if(radarobject != null && radarobject.clickable()==true && radarobject.visibleToUser()==true){
                return true;
            }
            else{
                return false;
            } 
        
     }
    
     //加快地图加载
     
     function refresh(){
        let mx = 554;
        let my = 2241;
        clicks(mx,my);
         mx = 842;
         my = 1483;
         sleep(700);
        clicks(mx,my);
        sleep(1800);
        clickWarning();
        sleep(100);
        back();
        mapStatus = false;
        while(mapStatus == false && mapCount <= 90){
            device.wakeUpIfNeeded();
            toast("等待地图加载中 等待上限为1分半");
            mapStatus = checkMap();
            mapCount++;
            sleep(1000);
        }
    }

   
    //点击脚底
    
    function clickPokemon(){
        sleep(700);
        let gx = 540;
        let gy = 1588;
        clicks(gx,gy);
        sleep(250);

        gx = 537;
        gy = 1593;
        clicks(gx,gy);
        sleep(250);

        gx = 540;
        gy = 1600;
        clicks(gx,gy);
        sleep(250);

        gx = 541;
        gy = 1549;
        clicks(gx,gy);
        sleep(250);


        gx = 526;
        gy = 1600;
        clicks(gx,gy);
        sleep(250);


        gx = 557;
        gy = 1518;
        clicks(gx,gy);
        sleep(250);


        gx = 577;
        gy = 1532;
        clicks(gx,gy);
        sleep(250);


        gx = 585;
        gy = 1587;
        clicks(gx,gy);
        sleep(800);
    }
    
    //点击天气驾驶提示
    function clickWarning(){
        let wx = 542;
        let wy =  1648; 
        sleep(100);
        clicks(wx,wy);
    }
    
    //点击天气驾驶提示
    function clickFirstWarning(){
        let fwx = 548;
        let fwy =  1694; 
        sleep(1000);
        clicks(fwx,fwy);
    }
    
    
    //点击指南针
    function clickCompass(){
        let cx = 987;
        let cy = 390; 
        sleep(100);
        clicks(cx,cy);
        clicks(cx,cy);
    }
    
    //拉远视角
    
    function changeFov(){
        let lx = transfX(290);
        let ly = transfY(1753);
        
        let rx = transfX(779);
        let ry = transfY(1037);

        let ex = transfX(435);
        let ey = transfY(1414);
        
        let ex2 = transfX(627);
        let ey2 = transfY(1030);
        
        
        gestures([0, 500, [lx, ly], [ex, ey]],
            [0, 500, [rx, ry], [ex2, ey2]]);
    
     }
     
     function startGame(){

        sleep(100);
        home();

        var img_icon = images.read("icon.png");
        sleep(2000);
        captureScreen("/sdcard/DCIM/百闪狩猎/currentScreen"+".png");
        var currentScreen = images.read("/sdcard/DCIM/百闪狩猎/currentScreen.png");
        sleep(500);

        var phoneScreen = findImage(currentScreen,img_icon, {threshold: 0.70});
        if(phoneScreen){
            log("找到了 宝可梦GO");
            click(phoneScreen.x+10,phoneScreen.y+10);
            sleep(100);
        }

        img_icon.recycle();

     }

    
    //自动捕获功能
    function catchPokemon(){
        // top X,Y范围
        //810 1799
        tx = transfX(542);
        ty = transfY(1181);
        // bottom X，Y 范围
        bx = transfX(542);
        by = transfY(2143);
    
        log("sliding ("+ bx +"," + by +"), ("+ tx +"," + ty +")")
        slidingTime = randomRangeTime(0.3,0.7);
        swipe(bx,by ,tx ,ty ,slidingTime);
    }

    //随机时间
    function randomRangeTime(start,end){
        len = (end -start)*1000; 
        ms = Math.floor(Math.random() * len) + start*1000;
        return ms;
    }

    //分辨率适配

    function clicks(x,y){
        let cx = x*device.width/1080;
        let cy = y*device.height/2400;
        click(cx,cy);
    }

    function transfX(x){

        let cx = x*device.width/1080;
        return cx;

    }

    function transfY(y){
        let cy = y*device.height/2400;
        return cy;
    }

    function closeApp() {
        let packageName = currentPackage();
        app.openAppSetting(packageName);
        text(app.getAppName(packageName)).waitFor();
        let is_sure = textMatches(/(.制..|.束..|...行)/).findOne();
        if (is_sure.enabled()) {
            textMatches(/(.制..|.束..|...行)/).findOne().click();
            sleep(3000);
            textMatches(/(.*确.*|.*定.*)/).findOne().click();
            sleep(3000);
            log(app.getAppName(packageName) + "应用已被关闭");
            sleep(1000);
            home();
        } else {
            log(app.getAppName(packageName) + "应用不能被正常关闭 请前往https://desoiat.github.io/2022/08/26/Pokemon-Go/" + "进行反馈");
            back();
        }
     }

    function screenCheck(){

    var img_envWarning = images.read("envWarning.png");
    var img_warning2 = images.read("warning2.png");
    var img_pvp = images.read("pvp.png");
    var img_menu = images.read("menu.png");
    var img_dojo = images.read("dojo.png");
    var img_egg = images.read("egg.png");
    var img_safe = images.read("safe.png");


    sleep(500);
    captureScreen("/sdcard/DCIM/百闪狩猎/currentScreen"+".png");
    var currentScreen = images.read("/sdcard/DCIM/百闪狩猎/currentScreen.png");
    sleep(500);

    var menuScreen = findImage(currentScreen,img_menu, {threshold: 0.86});
    var pvpScreen = findImage(currentScreen,img_pvp, {threshold: 0.86});
    var envWarningScreen = findImage(currentScreen,img_envWarning, {threshold: 0.86});
    var warning2Screen = findImage(currentScreen,img_warning2, {threshold: 0.86});
    var dojoScreen = findImage(currentScreen,img_dojo, {threshold: 0.86});
    var safeScreen = findImage(currentScreen,img_safe, {threshold: 0.86});
    var eggScreen = findImage(currentScreen,img_egg, {threshold: 0.86});

    if(envWarningScreen){
        log("安全提示1");
        click(envWarningScreen.x+10,envWarningScreen.y+10);
        sleep(300);
    }
    else if(warning2Screen){
        log("安全提示2");
        click(warning2Screen.x+10,warning2Screen.y+10);
        sleep(300);
    }
    else if(safeScreen){
        log("安全提示3");
        click(safeScreen.x+10,safeScreen.y+10);
        sleep(300);
    }
    else if(menuScreen){
        log("菜单");
        back();
    }
    else if(pvpScreen){
        log("多人对战");
        back();
    }
    else if(dojoScreen){
        log("道馆");
        back();
    }
    else if(eggScreen){
        log("Raids");
        back();
    }


    img_envWarning.recycle();
    img_pvp.recycle();
    img_menu.recycle();
    img_warning2.recycle();
    currentScreen.recycle();
    img_pvp.recycle();
    img_menu.recycle();
    img_dojo.recycle();
    img_egg.recycle();
    img_safe.recycle();
    

}